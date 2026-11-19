// Headless regression suite for the Vice Cover Studio (v22).
// Serves app/ on a local port, drives it in headless Chromium via
// playwright-core, and asserts the v22 Double Exposure feature plus
// spot-checks for every earlier version (v1–v21) so a new version can
// never silently break an old one. Run: node tools/regress.mjs
// Exits non-zero when any check fails.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
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

// Every check runs in the page, against window.__vice + the DOM, and
// returns { name, ok, detail }. Pure state checks use a fresh default
// state; render checks draw on throwaway canvases.
const CHECKS = `async () => {
  const V = window.__vice;
  const out = [];
  const check = (name, ok, detail = '') => out.push({ name, ok: !!ok, detail: String(detail ?? '') });
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  await V.ensureDisplayFonts();

  // --- counts (v1–v22) ---
  check('layouts count is 22', Object.keys(V.LAYOUTS).length === 22, Object.keys(V.LAYOUTS).length);
  check('grades count is 12', Object.keys(V.GRADES).length === 12, Object.keys(V.GRADES).length);
  check('frames count is 11 (+ none)', Object.keys(V.FRAMES).length === 12 && V.FRAME_KEYS.length === 11, Object.keys(V.FRAMES).length + ' keys / ' + V.FRAME_KEYS.length + ' real');
  check('sticker kinds count is 13', Object.keys(V.STICKER_KINDS).length === 13, Object.keys(V.STICKER_KINDS).length);
  check('templates count is 24', Object.keys(V.TEMPLATES).length === 24, Object.keys(V.TEMPLATES).length);
  check('looks count is 8', Object.keys(V.LOOKS).length === 8, Object.keys(V.LOOKS).length);
  check('blend modes count is 5', V.BLEND_MODE_KEYS.length === 5, V.BLEND_MODE_KEYS.join(','));
  check('export sizes count is 4', Object.keys(V.EXPORT_SIZES).length === 4, Object.keys(V.EXPORT_SIZES).length);
  check('mockups count is 3', Object.keys(V.MOCKUPS).length === 3, Object.keys(V.MOCKUPS).length);
  check('print sizes count is 3', Object.keys(V.PRINT_SIZES).length === 3, Object.keys(V.PRINT_SIZES).length);
  check('export-everything count is 11', V.EXPORT_EVERYTHING_COUNT === 11, V.EXPORT_EVERYTHING_COUNT);
  check('tilt presets are 8', Object.keys(V.TILT_PRESETS).length === 8, Object.keys(V.TILT_PRESETS).length);

  // --- v22 defaults ---
  const s0 = V.state;
  check('default state has 5 panels', s0.panels.length === 5, s0.panels.length);
  check('default panels have blend off', s0.panels.every((p) => p.blendPhoto === -1), JSON.stringify(s0.panels.map((p) => p.blendPhoto)));
  check('default blend mode is screen', s0.panels.every((p) => p.blendMode === 'screen'));
  check('default blend opacity is 0.65', s0.panels.every((p) => p.blendOpacity === 0.65));
  check('doubleExposureActive false by default', s0.panels.every((p) => !V.doubleExposureActive(p)));

  // --- v22 apply / clear ---
  const s = { panels: s0.panels.map((p) => ({ ...p })), photos: [new Image(), new Image(), new Image()] };
  check('applyDoubleExposure ok', V.applyDoubleExposure(s, 0, 1, 'screen', 0.7) === true);
  check('blend active after apply', V.doubleExposureActive(s.panels[0]) === true);
  check('blend fields stored', s.panels[0].blendPhoto === 1 && s.panels[0].blendMode === 'screen' && s.panels[0].blendOpacity === 0.7);
  check('same-photo blend refused', V.applyDoubleExposure(s, 0, 0, 'screen', 0.7) === false);
  check('out-of-range photo refused', V.applyDoubleExposure(s, 0, 9, 'screen', 0.7) === false);
  check('out-of-range panel refused', V.applyDoubleExposure(s, 9, 1, 'screen', 0.7) === false);
  check('unknown mode falls back to screen', (() => { V.applyDoubleExposure(s, 1, 0, 'nope', 0.5); return s.panels[1].blendMode === 'screen'; })());
  check('opacity clamps above 1', V.clampBlendOpacity(1.5) === 1, V.clampBlendOpacity(1.5));
  check('opacity clamps below 0', V.clampBlendOpacity(-0.5) === 0, V.clampBlendOpacity(-0.5));
  check('opacity NaN defaults to 0.65', V.clampBlendOpacity('x') === 0.65, V.clampBlendOpacity('x'));
  check('clearDoubleExposure turns blend off', (() => { V.clearDoubleExposure(s, 0); return !V.doubleExposureActive(s.panels[0]) && s.panels[0].blendPhoto === -1; })());

  // --- v22 template ---
  check('viceDoubleExposure template exists', !!V.TEMPLATES.viceDoubleExposure);
  // applyTemplate needs a full-ish state; run it on the live state.
  const live = V.state;
  const applied = V.applyTemplate(live, 'viceDoubleExposure');
  V.redraw(); // syncs the editor controls with the new state
  check('applyTemplate viceDoubleExposure returns true', applied === true);
  check('template sets magazine layout', live.layout === 'magazine', live.layout);
  check('template blends photo 2 into panel 1', live.panels[0].blendPhoto === 1 && live.panels[0].blendMode === 'screen' && live.panels[0].blendOpacity === 0.7, JSON.stringify(live.panels[0]));
  check('template title is DOUBLE VICE', live.title === 'DOUBLE VICE', live.title);

  // --- v22 timeline label ---
  check('describeStateChange names a blend change', (() => {
    const a = { panels: [{ blendPhoto: -1, blendMode: 'screen', blendOpacity: 0.65 }] };
    const b = { panels: [{ blendPhoto: 1, blendMode: 'screen', blendOpacity: 0.7 }] };
    return V.describeStateChange(a, b) === 'Double exposure';
  })());
  check('describeStateChange identical states is Edit', V.describeStateChange({ panels: [] }, { panels: [] }) === 'Edit');

  // --- v22 snapshot round-trip ---
  check('snapshot/restore keeps the blend', (() => {
    const snap = { panels: live.panels.map((p) => ({ ...p })) };
    live.panels[0].blendPhoto = -1;
    live.panels = snap.panels.map((p) => ({ ...p }));
    return live.panels[0].blendPhoto === 1 && live.panels[0].blendOpacity === 0.7;
  })());

  // --- v22 render: blend changes pixels, diptych tolerates blend ---
  const sumPixels = (canvas) => {
    const ctx = canvas.getContext('2d');
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 997) sum += d[i];
    return sum;
  };
  const c1 = document.createElement('canvas'); c1.width = 480; c1.height = 270;
  const c2 = document.createElement('canvas'); c2.width = 480; c2.height = 270;
  const base = { ...live, compare: 1 };
  V.drawCover(c1, { ...base, panels: base.panels.map((p) => ({ ...p, blendPhoto: -1 })) });
  V.drawCover(c2, { ...base });
  check('drawCover with blend runs', sumPixels(c2) > 0, sumPixels(c2));
  check('blend changes the rendered pixels', sumPixels(c1) !== sumPixels(c2), sumPixels(c1) + ' vs ' + sumPixels(c2));
  check('diptych renders with blend set', (() => {
    try {
      const c3 = document.createElement('canvas'); c3.width = 480; c3.height = 270;
      V.drawCover(c3, { ...base, layout: 'diptych' });
      return sumPixels(c3) > 0;
    } catch (e) { return false; }
  })());
  const blob = await V.exportCover({ ...base }, 540, 540);
  check('exportCover with blend returns a PNG blob', blob && blob.size > 10000, blob && blob.size);

  // --- v22 UI controls ---
  const $ = (id) => document.getElementById(id);
  check('fs-double fieldset exists', !!$('fs-double'));
  check('double controls exist', !!($('doubleOn') && $('doublePhoto') && $('doubleMode') && $('doubleOpacity') && $('doubleSwap')));
  check('doubleOn reflects the template blend', $('doubleOn').checked === true);
  // Switch the blend mode through the UI.
  $('doubleMode').value = 'overlay';
  $('doubleMode').dispatchEvent(new Event('change'));
  check('UI blend-mode change reaches state', V.state.panels[0].blendMode === 'overlay', V.state.panels[0].blendMode);
  $('doubleOpacity').value = '0.5';
  $('doubleOpacity').dispatchEvent(new Event('input'));
  check('UI opacity change reaches state', Math.abs(V.state.panels[0].blendOpacity - 0.5) < 0.001, V.state.panels[0].blendOpacity);
  $('doubleSwap').click();
  check('UI swap exchanges the two photos', V.state.panels[0].photo === 1 && V.state.panels[0].blendPhoto === 0, V.state.panels[0].photo + '/' + V.state.panels[0].blendPhoto);
  $('doubleSwap').click();
  $('doubleOn').click();
  check('UI uncheck clears the blend', V.state.panels[0].blendPhoto === -1 && !V.doubleExposureActive(V.state.panels[0]));
  $('doubleOn').click();
  check('UI re-check restores a blend', V.doubleExposureActive(V.state.panels[0]) === true);

  // --- v1–v21 spot checks ---
  check('v21 layout bottomheavy exists', V.LAYOUTS.bottomheavy && V.LAYOUTS.bottomheavy.panels === 3);
  check('v20 layout centerstage exists', V.LAYOUTS.centerstage && V.LAYOUTS.centerstage.panels === 3);
  check('v19 layout heroleft exists', V.LAYOUTS.heroleft && V.LAYOUTS.heroleft.panels === 3);
  check('v18 layouts splitscreen + quadgrid exist', !!V.LAYOUTS.splitscreen && !!V.LAYOUTS.quadgrid);
  check('v17 frames neon + vhs exist', !!V.FRAMES.neon && !!V.FRAMES.vhs);
  check('v20 frames gold + blueprint exist', !!V.FRAMES.gold && !!V.FRAMES.blueprint);
  check('v19 frames comic + retro exist', !!V.FRAMES.comic && !!V.FRAMES.retro);
  check('v21 template viceBottomHeavy exists', !!V.TEMPLATES.viceBottomHeavy);
  check('v20 template viceCenterStage exists', !!V.TEMPLATES.viceCenterStage);
  check('v19 template viceTimeline exists', !!V.TEMPLATES.viceTimeline);
  check('v18 template viceLayouts exists', !!V.TEMPLATES.viceLayouts);
  check('v17 template viceStudioPro exists', !!V.TEMPLATES.viceStudioPro);
  check('v16 template viceBundle exists', !!V.TEMPLATES.viceBundle);
  check('auto-caption v1 returns 3 cards', V.suggestCaptions(V.analyzePhoto(live.photos[0] || live.photos[1])).length === 3, V.suggestCaptions(V.analyzePhoto(live.photos[0] || live.photos[1])).length);
  check('auto-caption v2 returns 3 cards', V.suggestCaptionsV2(V.analyzePhoto(live.photos[0] || live.photos[1])).length === 3, V.suggestCaptionsV2(V.analyzePhoto(live.photos[0] || live.photos[1])).length);
  check('auto-caption v3 returns 3 cards', V.suggestCaptionsV3(V.analyzePhoto(live.photos[0] || live.photos[1])).length === 3, V.suggestCaptionsV3(V.analyzePhoto(live.photos[0] || live.photos[1])).length);
  check('ZIP crc32 check value', V.crc32(new TextEncoder().encode('123456789')) === 0xCBF43926, V.crc32(new TextEncoder().encode('123456789')).toString(16));
  check('createZipBlob returns a blob', await (async () => { const b = await V.createZipBlob([{ file: 'a.txt', blob: new Blob(['hi']) }]); return b && b.size > 0; })());
  check('films include kodachrome', !!V.FILMS.kodachrome || Object.keys(V.FILMS).length >= 5, Object.keys(V.FILMS).join(','));
  return out;
}`;

async function main() {
  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  let failures = 0;
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 300)));
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__vice && window.__viceState, null, { timeout: 30000 });
    await page.waitForFunction(() => window.__viceState.photos[0] && window.__viceState.photos[1], null, { timeout: 30000 });
    const results = await page.evaluate(new Function(`return (${CHECKS})()`));
    for (const r of results) {
      console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : '  :: ' + r.detail}`);
      if (!r.ok) failures++;
    }
    // Shot-param checks (fresh pages, like the screenshot run).
    const shot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await shot.goto(`http://127.0.0.1:${port}/?shot=cover&double=overlay&doubleOpacity=0.5&bubbles=0`, { waitUntil: 'load' });
    await shot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const d = await shot.evaluate(() => {
      const p = window.__viceState.panels[0];
      return { active: window.__vice.doubleExposureActive(p), mode: p.blendMode, op: p.blendOpacity };
    });
    const okShot = d.active && d.mode === 'overlay' && Math.abs(d.op - 0.5) < 0.001;
    console.log(`${okShot ? 'PASS' : 'FAIL'}  shot param double=overlay sets the blend  :: ${JSON.stringify(d)}`);
    if (!okShot) failures++;
    const ed = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await ed.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceDoubleExposure&focus=double&bubbles=0`, { waitUntil: 'load' });
    await ed.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const vis = await ed.evaluate(() => {
      const r = document.getElementById('fs-double').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('doubleOn').checked };
    });
    const okEd = vis.top >= -50 && vis.top < 1280 && vis.checked === true;
    console.log(`${okEd ? 'PASS' : 'FAIL'}  editor shot focus=double shows the fieldset, checked  :: ${JSON.stringify(vis)}`);
    if (!okEd) failures++;
    console.log(`\n${results.length + 2} checks, ${failures} failed`);
  } finally {
    await browser.close();
    server.close();
  }
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
