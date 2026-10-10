/**
 * The smallest static server that reproduces the deployment.
 *
 * Node's own `http` and nothing else, on purpose. The first attempt used
 * `npx --yes http-server`, which has to resolve a package before it listens -
 * and that is how a test run ends in "Timed out waiting 60000ms from
 * config.webServer" on one machine and passes on another, which is worse than
 * no e2e test at all. A run that is green because a server from an earlier run
 * happened to still be listening is not evidence.
 *
 * Serves the directory given as the first argument, which is `dist/site`: it
 * contains the `enigma2_player` folder, so the paths a test uses are the paths
 * GitHub Pages serves.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';

const root = process.argv[2] ?? 'dist/site';
const port = Number(process.argv[3] ?? 4321);

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.ico', 'image/x-icon'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

/** The file a request path names, or null when it escapes the root. */
function resolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  // normalize first, then check the prefix: without this, `/../../secret`
  // would be served, and a test server that can read outside its folder is a
  // bad habit even when it only ever runs locally.
  const candidate = normalize(join(root, decoded));
  if (!candidate.startsWith(normalize(root) + sep) && normalize(candidate) !== normalize(root)) {
    return null;
  }
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    return join(candidate, 'index.html');
  }
  return candidate;
}

const server = createServer((request, response) => {
  const file = resolve(request.url ?? '/');
  if (file === null || !existsSync(file)) {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
    return;
  }
  response.writeHead(200, {
    'content-type': types.get(extname(file)) ?? 'application/octet-stream',
  });
  const stream = createReadStream(file);
  // A browser that navigates away mid-response aborts the socket, and the
  // stream then errors. Unhandled, that error takes the whole server process
  // down - and every later test fails with ERR_ABORTED on a server that is no
  // longer there. Playwright running tests in parallel hits this reliably; it
  // cost a run that looked like eight broken tests and was one dead server.
  stream.on('error', () => response.destroy());
  response.on('close', () => stream.destroy());
  stream.pipe(response);
});

// Same reasoning one level down: a reset connection must not be fatal.
server.on('clientError', (_error, socket) => socket.destroy());

server.listen(port, '127.0.0.1', () => {
  console.log(`serving ${root} on http://127.0.0.1:${port}/`);
});
