import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const execFileAsync = promisify(execFile);
const projectDirectory = fileURLToPath(new URL('../../', import.meta.url));
const expectedRepository = { owner: 'Sanluis94', repo: 'Plataforma-educacional' };
const requestTimeout = 30_000;
let interrupted = false;
let activeController;

class CheckError extends Error {}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    interrupted = true;
    process.exitCode = signal === 'SIGINT' ? 130 : 143;
    activeController?.abort();
  });
}

function requireCondition(condition, message) {
  if (!condition) throw new CheckError(message);
}

function textContent(result) {
  return (result.content ?? [])
    .filter((item) => item.type === 'text')
    .map((item) => item.text)
    .join('\n');
}

function jsonContent(result) {
  if (result.structuredContent) return result.structuredContent;
  try {
    return JSON.parse(textContent(result));
  } catch {
    throw new CheckError('O servidor retornou um formato inesperado.');
  }
}

async function stopServer(client, transport) {
  // The launchers have child processes. On Windows, terminate this specific
  // process tree before closing the transport so no server is left behind.
  const pid = transport.pid;
  if (process.platform === 'win32' && Number.isSafeInteger(pid) && pid > 0) {
    await execFileAsync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], {
      windowsHide: true,
      timeout: 5_000,
    }).catch(() => {}); // Already-exited servers also make taskkill return nonzero.
  }
  await client.close().catch(() => {});
  await transport.close().catch(() => {});
}

async function checkServer(label, parameters, verify) {
  const controller = new AbortController();
  activeController = controller;
  const deadline = setTimeout(() => controller.abort(), 120_000);
  const transport = new StdioClientTransport({
    ...parameters,
    cwd: projectDirectory,
    stderr: 'pipe',
  });
  // Never print or persist server diagnostics: they may contain credentials or
  // private environment details. The check reports only known, safe metadata.
  transport.stderr?.resume();
  const client = new Client({ name: 'kortex-mcp-check', version: '1.0.0' });
  let stage = 'inicialização';
  const options = { timeout: requestTimeout, signal: controller.signal };
  const startedAt = Date.now();

  try {
    console.log(`${label}: iniciando verificação somente de leitura...`);
    await client.connect(transport, { ...options, timeout: 75_000 });
    const handshakeMilliseconds = Date.now() - startedAt;
    const server = client.getServerVersion();
    requireCondition(server?.name && server.version, 'Handshake sem identificação do servidor.');
    stage = 'listagem de ferramentas';
    const tools = [];
    const cursors = new Set();
    let cursor;
    do {
      const page = await client.listTools(cursor ? { cursor } : {}, options);
      tools.push(...page.tools);
      cursor = page.nextCursor;
      requireCondition(!cursor || !cursors.has(cursor), 'Paginação de ferramentas inválida.');
      if (cursor) cursors.add(cursor);
    } while (cursor);
    requireCondition(tools.length > 0, 'O servidor não disponibilizou ferramentas.');

    const callReadOnly = async (name, args = {}) => {
      stage = name;
      const tool = tools.find((item) => item.name === name);
      requireCondition(tool, `Ferramenta necessária ausente: ${name}.`);
      requireCondition(tool.annotations?.readOnlyHint === true, `Ferramenta sem declaração de leitura: ${name}.`);
      const result = await client.callTool({ name, arguments: args }, undefined, options);
      requireCondition(!result.isError, `A consulta ${name} retornou erro; confira a autenticação e o acesso.`);
      return result;
    };
    const verified = await verify(callReadOnly, tools);
    const version = /^[a-zA-Z0-9._+-]{1,100}$/.test(server.version) ? server.version : 'informada';
    console.log(`${label}: OK — handshake em ${handshakeMilliseconds} ms, versão ${version}, ${tools.length} ferramentas; ${verified}`);
    return true;
  } catch (error) {
    // Do not interpolate raw SDK/server errors, responses, or environment data.
    const reason = interrupted
      ? 'verificação interrompida'
      : controller.signal.aborted
        ? 'tempo máximo de 120 segundos excedido'
        : error instanceof CheckError
          ? error.message
          : 'falha de conexão ou resposta; confira o launcher e a autenticação';
    console.error(`${label}: FALHOU na etapa ${stage}: ${reason}`);
    return false;
  } finally {
    clearTimeout(deadline);
    await stopServer(client, transport);
    activeController = undefined;
  }
}

async function checkGitHub() {
  requireCondition(process.platform === 'win32', 'O launcher GitHub deste projeto requer Windows/PowerShell.');
  return checkServer('GitHub', {
    command: join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'),
    args: ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
      fileURLToPath(new URL('./github.ps1', import.meta.url))],
  }, async (call) => {
    const user = jsonContent(await call('get_me'));
    requireCondition(typeof user.login === 'string' && /^[a-z\d-]{1,39}$/i.test(user.login),
      'A consulta get_me não confirmou um usuário autenticado.');
    const branches = jsonContent(await call('list_branches', { ...expectedRepository, perPage: 100, page: 1 }));
    requireCondition(Array.isArray(branches) && branches.length > 0 && branches.every((branch) => typeof branch.name === 'string'),
      'A consulta list_branches não confirmou acesso às branches do repositório.');
    return `get_me confirmou ${user.login}; list_branches confirmou ${expectedRepository.owner}/${expectedRepository.repo} (${branches.length} branches).`;
  });
}

async function checkFirebase() {
  const rc = JSON.parse(await readFile(new URL('../../.firebaserc', import.meta.url), 'utf8'));
  const expectedProject = rc.projects?.default;
  requireCondition(typeof expectedProject === 'string' && /^[a-z][a-z\d-]{4,28}[a-z\d]$/.test(expectedProject),
    'Configure um projeto default válido em .firebaserc.');
  return checkServer('Firebase', {
    command: process.execPath,
    args: [fileURLToPath(new URL('./firebase.mjs', import.meta.url))],
  }, async (call, tools) => {
    const allowedTools = new Set([
      'firebase_get_environment', 'firebase_get_project', 'firebase_list_projects',
      'firebase_list_apps', 'firebase_get_sdk_config', 'firebase_get_security_rules',
      'firebase_validate_security_rules', 'firebase_read_resources',
      'auth_get_users', 'firestore_query_collection',
    ]);
    requireCondition(tools.every((tool) => allowedTools.has(tool.name) && tool.annotations?.readOnlyHint === true),
      'Firebase disponibilizou uma ferramenta fora da lista de consultas autorizadas.');
    const environment = textContent(await call('firebase_get_environment'));
    const activeProject = environment.match(/^Active Project ID: ([a-z\d-]+)/m)?.[1];
    requireCondition(activeProject === expectedProject, 'O projeto ativo diverge de .firebaserc.');
    requireCondition(/^Authenticated User: (?!<NONE>)[^\r\n]+$/m.test(environment),
      'Firebase não confirmou um usuário autenticado.');
    const project = jsonContent(await call('firebase_get_project'));
    requireCondition(project.projectId === expectedProject && (project.lifecycleState ?? project.state) === 'ACTIVE',
      'A consulta firebase_get_project não confirmou o projeto ativo esperado.');
    return `firebase_get_environment e firebase_get_project confirmaram ${expectedProject} (ACTIVE).`;
  });
}

async function main() {
  const mode = process.argv[2] ?? 'all';
  requireCondition(process.argv.length <= 3 && ['all', 'github', 'firebase'].includes(mode),
    'Uso: node scripts/mcp/check.mjs [all|github|firebase]');
  let succeeded = true;
  if (mode === 'all' || mode === 'github') succeeded = await checkGitHub() && succeeded;
  if (!interrupted && (mode === 'all' || mode === 'firebase')) succeeded = await checkFirebase() && succeeded;
  if (!succeeded && !interrupted) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof CheckError ? error.message : 'Não foi possível preparar a verificação dos MCPs.');
  if (!interrupted) process.exitCode = 1;
});
