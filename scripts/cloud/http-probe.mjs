import { request } from 'node:http';

/** Node fetch discards a custom Host header; a loopback probe must preserve it. */
export function probeHttp(url, headers = {}) {
  const target = new URL(url);
  if (target.protocol !== 'http:' || target.hostname !== '127.0.0.1') throw new Error('O probe deve usar HTTP no loopback.');
  return new Promise((resolve, reject) => {
    const req = request(target, { headers }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('error', reject);
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve({ status: response.statusCode, headers: new Headers(response.headers), text: async () => body, json: async () => JSON.parse(body) });
      });
    });
    req.on('error', reject);
    req.setTimeout(3000, () => req.destroy(new Error('O probe HTTP excedeu três segundos.')));
    req.end();
  });
}
