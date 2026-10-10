/**
 * Measures the start page of the build and prints the numbers.
 *
 * `enigma2_player-9v1` asked for Core Web Vitals before and after the
 * migration, and this measured both builds side by side while both existed.
 * The Astro baseline (`../dist`) went with the Astro tree at the cutover
 * (`enigma2_player-hsf.1`), so what is left is the ongoing measurement of the
 * site itself. This is a LAB measurement on one machine over a local static
 * server - not field data: it answers whether a change made the start page
 * worse, not what visitors experience.
 *
 * Measured per build, median of five loads:
 *  - LCP, Largest Contentful Paint (the "good" threshold is 2500 ms)
 *  - CLS, Cumulative Layout Shift (0.1)
 *  - FCP, First Contentful Paint
 *  - the bytes the page needs before it is interactive, and the request count
 *
 * INP is deliberately absent: it needs a real interaction from a real person
 * and cannot be faked in a loop. The keyboard tests cover whether the
 * interactions work; how fast they feel is a field measurement.
 *
 * Usage, build first:
 *   npm run build
 *   npm run vitals
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';

import { chromium } from '@playwright/test';

const TARGETS = [{ name: 'Angular', root: 'dist/site', path: '/enigma2_player/' }];
const RUNS = 5;
const PORT = 4399;

const TYPES = new Map([
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
  ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

/** The same minimal server the end-to-end tests use, one root at a time. */
function serve(root) {
  const server = createServer((request, response) => {
    const decoded = decodeURIComponent((request.url ?? '/').split('?')[0]);
    let file = normalize(join(root, decoded));
    if (!file.startsWith(normalize(root) + sep) && normalize(file) !== normalize(root)) {
      response.writeHead(403).end('no');
      return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) {
      file = join(file, 'index.html');
    }
    if (!existsSync(file)) {
      response.writeHead(404).end('not found');
      return;
    }
    // content-length on purpose: the byte count is half of what this script
    // measures, and without the header the browser reports zero.
    response.writeHead(200, {
      'content-type': TYPES.get(extname(file)) ?? 'application/octet-stream',
      'content-length': statSync(file).size,
    });
    const stream = createReadStream(file);
    stream.on('error', () => response.destroy());
    response.on('close', () => stream.destroy());
    stream.pipe(response);
  });
  server.on('clientError', (_error, socket) => socket.destroy());
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

/** One load, with the vitals read from the browser's own observers. */
async function measure(browser, url) {
  const context = await browser.newContext();
  const page = await context.newPage();
  let bytes = 0;
  let requests = 0;
  page.on('response', async (response) => {
    requests++;
    const length = response.headers()['content-length'];
    bytes += length ? Number(length) : 0;
  });

  await page.goto(url, { waitUntil: 'load' });
  // Layout shifts keep happening after load; a second of quiet is the usual
  // compromise for a lab run.
  await page.waitForTimeout(1000);

  const vitals = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const result = { lcp: 0, cls: 0, fcp: 0 };
        for (const entry of performance.getEntriesByType('paint')) {
          if (entry.name === 'first-contentful-paint') {
            result.fcp = entry.startTime;
          }
        }
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            result.lcp = Math.max(result.lcp, entry.startTime);
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              result.cls += entry.value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(result), 300);
      }),
  );

  await context.close();
  return { ...vitals, bytes, requests };
}

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const browser = await chromium.launch();
const results = [];

for (const target of TARGETS) {
  if (!existsSync(target.root)) {
    console.log(`${target.name}: ${target.root} not built - skipped`);
    continue;
  }
  const server = await serve(target.root);
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    runs.push(await measure(browser, `http://127.0.0.1:${PORT}${target.path}`));
  }
  server.close();
  results.push({
    name: target.name,
    lcp: median(runs.map((run) => run.lcp)),
    cls: median(runs.map((run) => run.cls)),
    fcp: median(runs.map((run) => run.fcp)),
    bytes: median(runs.map((run) => run.bytes)),
    requests: median(runs.map((run) => run.requests)),
  });
}

await browser.close();

console.log(`\nStart page, median of ${RUNS} loads, local static server:\n`);
console.log('| build | LCP | CLS | FCP | bytes | requests |');
console.log('|---|---|---|---|---|---|');
for (const row of results) {
  console.log(
    `| ${row.name} | ${row.lcp.toFixed(0)} ms | ${row.cls.toFixed(3)} | ` +
      `${row.fcp.toFixed(0)} ms | ${(row.bytes / 1024).toFixed(0)} KiB | ${row.requests} |`,
  );
}
console.log(
  '\nThresholds: LCP <= 2500 ms good, CLS <= 0.1 good. Lab numbers on one ' +
    'machine over localhost - they answer "did the migration make it worse", ' +
    'not "what do visitors experience".',
);
