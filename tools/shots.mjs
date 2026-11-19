// Regenerates screenshots/ from shots.json, exactly as the app's maker
// would: serves app/ locally, loads each ?shot= scene in headless
// Chromium, waits for window.__shotReady, and screenshots the viewport
// as a JPEG. Run: node tools/shots.mjs
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const APP = join(ROOT, 'app');
const CHROME = process.env.CHROME_PATH
  || `${process.env.HOME}/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8',
};

function serve() {
  return new Promise((resolveListen) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://127.0.0.1');
        let p = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
        const file = join(APP, p);
        if (!file.startsWith(APP)) { res.writeHead(403); res.end(); return; }
        const data = await readFile(file);
        res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404); res.end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => resolveListen(server));
  });
}

async function main() {
  const shots = JSON.parse(await readFile(join(ROOT, 'shots.json'), 'utf8'));
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  try {
    for (const shot of shots) {
      const page = await browser.newPage({ viewport: { width: shot.w, height: shot.h } });
      page.on('pageerror', (e) => console.log(`PAGEERROR ${shot.name}:`, String(e).slice(0, 200)));
      await page.goto(`http://127.0.0.1:${port}/${shot.query}`, { waitUntil: 'load' });
      await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 60000 });
      const buf = await page.screenshot({ type: 'jpeg', quality: 85 });
      await writeFile(join(ROOT, 'screenshots', shot.name), buf);
      console.log(`${shot.name}: ${shot.w}x${shot.h}, ${(buf.length / 1024).toFixed(0)} KiB`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
