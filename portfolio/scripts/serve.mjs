import { readFile } from 'node:fs/promises';
// Servidor local mínimo para desenvolvimento (sem dependências).
// Uso: node scripts/serve.mjs [porta]
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../site',
);
const port = Number(process.argv[2] || process.env.PORT || 8080);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.woff2': 'font/woff2',
};

// Reaproveita os cabeçalhos de segurança do netlify.toml, para testar
// localmente com a mesma Content-Security-Policy da produção.
const toml = await readFile(path.resolve(root, '../netlify.toml'), 'utf8');
const securityHeaders = Object.fromEntries(
  [
    ...toml
      .split('for = "/assets/*"')[0]
      .matchAll(/^\s+([A-Za-z-]+) = "(.*)"$/gm),
  ]
    .filter(([, key]) => key.includes('-'))
    .map(([, key, value]) => [key, value]),
);

export function createServer() {
  return http.createServer(async (req, res) => {
    for (const [key, value] of Object.entries(securityHeaders))
      res.setHeader(key, value);
    const urlPath = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    );
    let file = path.normalize(path.join(root, urlPath));
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    if (urlPath.endsWith('/')) file = path.join(file, 'index.html');
    try {
      const body = await readFile(file);
      res.writeHead(200, {
        'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      });
      res.end(body);
    } catch {
      const body = await readFile(path.join(root, '404.html'));
      res.writeHead(404, { 'Content-Type': types['.html'] });
      res.end(body);
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer().listen(port, () =>
    console.log(`Portfólio em http://localhost:${port}`),
  );
}
