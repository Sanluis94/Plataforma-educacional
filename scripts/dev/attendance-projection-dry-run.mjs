// Offline planning only: no Firebase initialization, credentials, network or writes to a database.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const inputArgument = args.find(argument => argument.startsWith('--input='))?.slice(8);
const outputArgument = args.find(argument => argument.startsWith('--output='))?.slice(9) ?? '.local/attendance-projection-plan.json';
if (!inputArgument || args.some(argument => !argument.startsWith('--input=') && !argument.startsWith('--output='))) throw new Error('Uso: node scripts/dev/attendance-projection-dry-run.mjs --input=<arquivo JSON privado> [--output=.local/plano.json]. A entrada deve ser um array de chamadas com id; esta ferramenta nunca aplica o plano.');
const input = resolve(root, inputArgument), output = resolve(root, outputArgument), privateRoot = resolve(root, '.local');
const withinPrivate = relative(privateRoot, output);
if (isAbsolute(withinPrivate) || withinPrivate.startsWith('..') || !withinPrivate || input === output) throw new Error('O plano deve ficar dentro de .local e não pode sobrescrever a entrada.');
const records = JSON.parse(await readFile(input, 'utf8'));
if (!Array.isArray(records)) throw new Error('A entrada deve ser um array JSON de chamadas, cada uma com seu id real.');
const writes = [], issues = [], targets = new Set();
const safeId = value => typeof value === 'string' && value.trim() && !value.includes('/');
for (const [index, record] of records.entries()) {
  const date = typeof record?.data === 'string' ? new Date(`${record.data}T00:00:00Z`) : null;
  if (!record || !safeId(record.id) || !safeId(record.turmaId) || !date || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== record.data || !Number.isFinite(Date.parse(record.criadoEm)) || (record.aulaNumero !== undefined && (!Number.isInteger(record.aulaNumero) || record.aulaNumero < 1)) || !Array.isArray(record.registros) || new Set(record.registros.map(entry => entry?.studentId)).size !== record.registros.length || record.registros.some(entry => !safeId(entry?.studentId) || !['presente', 'falta', 'justificada'].includes(entry?.status))) { issues.push({ recordIndex: index, error: 'Chamada inválida; confira id, turma, data, alunos únicos, situação e data de criação.' }); continue; }
  const sourceHash = createHash('sha256').update(JSON.stringify(record)).digest('hex');
  record.registros.forEach((entry, sourceIndex) => {
    const path = `classes/${record.turmaId}/attendance_students/${entry.studentId}/records/${record.id}`;
    if (targets.has(path)) { issues.push({ recordIndex: index, error: 'Projeção duplicada na entrada.' }); return; }
    targets.add(path);
    writes.push({ path, requiresSource: { path: `attendance/${record.id}`, sha256: sourceHash }, data: { sourceId: record.id, sourceIndex, data: record.data, aulaNumero: record.aulaNumero ?? 1, status: entry.status, updatedAt: record.criadoEm } });
  });
}
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ mode: 'dry-run-only', generatedAt: new Date().toISOString(), sourceRecords: records.length, projectedRecords: writes.length, issues, writes, note: 'Nenhuma operação remota foi executada. Antes de qualquer aplicação, valide a origem, a correspondência com cada documento atual, a autorização da escola, os lotes e a existência de projeções anteriores.' }, null, 2));
console.log(JSON.stringify({ mode: 'dry-run-only', sourceRecords: records.length, projectedRecords: writes.length, issues: issues.length, output: relative(root, output) }));
if (issues.length) process.exitCode = 1;
