import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import {
  defaultOutputDir,
  loadDotEnv,
  parseArgs,
  resolveRepoPath,
  validateOutputDirectory,
  defaultSource,
  publicSeedOutputDir,
} from './config.mjs';

await loadDotEnv();

const args = parseArgs(process.argv.slice(2));
const host = args.host ?? process.env.ETL_API_HOST ?? '127.0.0.1';
const port = Number(args.port ?? process.env.ETL_API_PORT ?? 3333);
if (!['127.0.0.1', 'localhost', '::1'].includes(host)) throw new Error('A API de exportações privadas deve permanecer no loopback local.');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Porta ETL inválida.');
const outputDir = await validateOutputDirectory(resolveRepoPath(args.output ?? (args['public-seed'] === 'true' ? publicSeedOutputDir : process.env.ETL_OUTPUT_DIR ?? defaultOutputDir)), { source: defaultSource, publicSeed: args['public-seed'] === 'true' });

const server = createServer(async (request, response) => {
  try {
    const requestHost = new URL(`http://${request.headers.host ?? 'invalid'}`).hostname;
    const origin = request.headers.origin;
    const localOrigin = origin ? new URL(origin) : null;
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(requestHost) || (localOrigin && (!['127.0.0.1', 'localhost', '[::1]'].includes(localOrigin.hostname) || !['http:', 'https:'].includes(localOrigin.protocol)))) {
      sendJson(response, 403, { error: 'Exportações ETL disponíveis apenas no ambiente local.' });
      return;
    }
    if (origin) response.setHeader('access-control-allow-origin', origin);
    response.setHeader('vary', 'Origin');
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }

    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? `${host}:${port}`}`);
    const pathname = normalizePath(url.pathname);

    if (pathname === '/health') {
      await handleHealth(response);
      return;
    }

    if (pathname === '/snapshot') {
      sendJson(response, 200, await readOutputJson('index.json'));
      return;
    }

    if (pathname === '/collections') {
      const snapshot = await readSnapshot();
      sendJson(response, 200, {
        data: Object.keys(snapshot.collections),
      });
      return;
    }

    const collectionMatch = pathname.match(/^\/collections\/([a-zA-Z0-9_-]+)$/);
    if (collectionMatch) {
      const collection = await readCollection(collectionMatch[1]);
      sendJson(response, 200, { data: collection });
      return;
    }

    const metricMatch = pathname.match(/^\/metrics\/([a-zA-Z0-9_-]+)$/);
    if (metricMatch) {
      const metric = await readMetric(metricMatch[1]);
      sendJson(response, 200, { data: metric });
      return;
    }

    if (pathname === '/quality') {
      sendJson(response, 200, (await readSnapshot()).quality);
      return;
    }

    const entityMatch = pathname.match(/^\/(users|classes|activities|progress)\/([^/]+)$/);
    if (entityMatch) {
      await handleEntity(response, entityMatch[1], decodeURIComponent(entityMatch[2]));
      return;
    }

    sendJson(response, 404, {
      error: 'Endpoint not found',
      endpoints: [
        '/health',
        '/snapshot',
        '/collections',
        '/collections/:name',
        '/metrics/:name',
        '/users/:id',
        '/classes/:id',
        '/activities/:id',
        '/progress/:studentId',
      ],
    });
  } catch (error) {
    const statusCode = error.code === 'ENOENT' ? 503 : error.code === 'NOT_FOUND' ? 404 : 500;
    sendJson(response, statusCode, {
      error: statusCode === 503 ? 'Exportação ETL ausente.' : 'Não foi possível ler a exportação ETL.',
      hint: statusCode === 503 ? 'Run npm run etl before starting or querying the local ETL API.' : undefined,
    });
  }
});

server.listen(port, host, () => {
  console.log(`Local ETL API running at http://${host}:${port}`);
  console.log(`Reading ETL artifacts from ${outputDir}`);
});

async function handleHealth(response) {
  try {
    const snapshotStat = await stat(join(outputDir, 'index.json'));
    const snapshot = await readSnapshot();

    sendJson(response, 200, {
      status: 'ok',
      outputDir,
      generatedAt: snapshot.generatedAt,
      lastModifiedAt: snapshotStat.mtime.toISOString(),
      collections: Object.keys(snapshot.collections),
      metrics: Object.keys(snapshot.metrics),
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      sendJson(response, 503, {
        status: 'missing_artifacts',
        outputDir,
        hint: 'Run npm run etl to generate local data artifacts.',
      });
      return;
    }

    throw error;
  }
}

async function handleEntity(response, entity, id) {
  const snapshot = await readSnapshot();

  if (entity === 'progress') {
    const progress = snapshot.collections.progress[id];

    if (!progress) {
      sendJson(response, 404, { error: 'Progress not found' });
      return;
    }

    sendJson(response, 200, { data: progress });
    return;
  }

  const collectionName = entity === 'users'
    ? 'users'
    : entity === 'classes'
      ? 'classes'
      : 'activities';

  const item = snapshot.collections[collectionName].find((entry) => entry.id === id);

  if (!item) {
    sendJson(response, 404, { error: `${entity.slice(0, -1)} not found` });
    return;
  }

  sendJson(response, 200, { data: item });
}

async function readSnapshot() {
  return readOutputJson('index.json');
}

async function readCollection(name) {
  ensureSafeSegment(name);
  const snapshot = await readSnapshot();
  if (!Object.hasOwn(snapshot.collections, name)) throw Object.assign(new Error('Coleção desconhecida.'), { code: 'NOT_FOUND' });
  return snapshot.collections[name];
}

async function readMetric(name) {
  ensureSafeSegment(name);
  const snapshot = await readSnapshot();
  const key = Object.keys(snapshot.metrics).find(key => key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`) === name);
  if (!key) throw Object.assign(new Error('Métrica desconhecida.'), { code: 'NOT_FOUND' });
  return snapshot.metrics[key];
}

async function readOutputJson(relativePath) {
  const content = await readFile(join(outputDir, relativePath), 'utf8');
  return JSON.parse(content);
}

function normalizePath(pathname) {
  const normalized = pathname.replace(/\/+$/g, '');
  return normalized || '/';
}

function ensureSafeSegment(segment) {
  if (!/^[a-zA-Z0-9_-]+$/.test(segment)) {
    throw new Error(`Invalid path segment: ${segment}`);
  }
}

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);

  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
  });
  response.end(body);
}
