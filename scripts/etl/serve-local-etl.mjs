import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import {
  defaultOutputDir,
  loadDotEnv,
  parseArgs,
  resolveRepoPath,
} from './config.mjs';

await loadDotEnv();

const args = parseArgs(process.argv.slice(2));
const host = args.host ?? process.env.ETL_API_HOST ?? '127.0.0.1';
const port = Number(args.port ?? process.env.ETL_API_PORT ?? 3333);
const outputDir = resolveRepoPath(args.output ?? process.env.ETL_OUTPUT_DIR ?? defaultOutputDir);

const server = createServer(async (request, response) => {
  try {
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
    const statusCode = error.code === 'ENOENT' ? 503 : 500;
    sendJson(response, statusCode, {
      error: error.message,
      hint: statusCode === 503 ? 'Run npm run etl before starting or querying the ETL API.' : undefined,
    });
  }
});

server.listen(port, host, () => {
  console.log(`ETL API running at http://${host}:${port}`);
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
        hint: 'Run npm run etl to generate data artifacts.',
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
  return readOutputJson(`collections/${name}.json`);
}

async function readMetric(name) {
  ensureSafeSegment(name);
  return readOutputJson(`metrics/${name}.json`);
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
    'access-control-allow-origin': '*',
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
  });
  response.end(body);
}
