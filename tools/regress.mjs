// Headless regression suite for the Vice Cover Studio (v41).
// Serves app/ on a local port, drives it in headless Chromium via
// playwright-core, and asserts the v41 Vice Seal feature plus
// spot-checks for every earlier version (v1–v40) so a new version can
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
  check('layouts count is 23', Object.keys(V.LAYOUTS).length === 23, Object.keys(V.LAYOUTS).length);
  check('grades count is 13', Object.keys(V.GRADES).length === 13, Object.keys(V.GRADES).length);
  check('frames count is 11 (+ none)', Object.keys(V.FRAMES).length === 12 && V.FRAME_KEYS.length === 11, Object.keys(V.FRAMES).length + ' keys / ' + V.FRAME_KEYS.length + ' real');
  check('sticker kinds count is 13', Object.keys(V.STICKER_KINDS).length === 13, Object.keys(V.STICKER_KINDS).length);
  check('templates count is 43', Object.keys(V.TEMPLATES).length === 43, Object.keys(V.TEMPLATES).length);
  check('rides count is 5', Object.keys(V.RIDES).length === 5 && V.RIDE_KEYS.length === 5, Object.keys(V.RIDES).length + ' / ' + V.RIDE_KEYS.length);
  check('rideAt clamps unknown ride to coupe', V.rideAt('nope', 0.4).ride === 'coupe' && V.rideAt('muscle', 0.4).label === 'MUSCLE', JSON.stringify(V.rideAt('nope', 0.4)));
  check('rideAt clamps size to 0..1', V.rideAt('bike', 2).size === 1 && V.rideAt('bike', -1).size === 0, JSON.stringify(V.rideAt('bike', 2)));
  check('describeStateChange names a ride change', V.describeStateChange({ ride: { on: false } }, { ride: { on: true, ride: 'coupe', size: 0.8 } }) === 'Ride');
  check('signs count is 5', Object.keys(V.SIGNS).length === 5 && V.SIGN_KEYS.length === 5, Object.keys(V.SIGNS).length + ' / ' + V.SIGN_KEYS.length);
  check('signAt clamps unknown sign to neon', V.signAt('nope', 0.4).sign === 'neon' && V.signAt('ocean', 0.4).label === 'OCEAN DRIVE', JSON.stringify(V.signAt('nope', 0.4)));
  check('signAt clamps size to 0..1', V.signAt('vice', 2).size === 1 && V.signAt('vice', -1).size === 0, JSON.stringify(V.signAt('vice', 2)));
  check('describeStateChange names a sign change', V.describeStateChange({ sign: { on: false } }, { sign: { on: true, sign: 'neon', size: 0.8 } }) === 'Sign');
  check('tags count is 5', Object.keys(V.TAGS).length === 5 && V.TAG_KEYS.length === 5, Object.keys(V.TAGS).length + ' / ' + V.TAG_KEYS.length);
  check('tagAt clamps unknown tag to vice', V.tagAt('nope', 0.4).tag === 'vice' && V.tagAt('gold', 0.4).label === 'GOLD', JSON.stringify(V.tagAt('nope', 0.4)));
  check('tagAt clamps size to 0..1', V.tagAt('neon', 2).size === 1 && V.tagAt('neon', -1).size === 0, JSON.stringify(V.tagAt('neon', 2)));
  check('describeStateChange names a tag change', V.describeStateChange({ tag: { on: false } }, { tag: { on: true, tag: 'vice', size: 0.8 } }) === 'Tag');
  check('plates count is 5', Object.keys(V.PLATES).length === 5 && V.PLATE_KEYS.length === 5, Object.keys(V.PLATES).length + ' / ' + V.PLATE_KEYS.length);
  check('plateAt clamps unknown plate to vice', V.plateAt('nope', 0.4).plate === 'vice' && V.plateAt('gold', 0.4).label === 'GOLD-24', JSON.stringify(V.plateAt('nope', 0.4)));
  check('plateAt clamps size to 0..1', V.plateAt('neon', 2).size === 1 && V.plateAt('neon', -1).size === 0, JSON.stringify(V.plateAt('neon', 2)));
  check('plateAt labels are original (no Rockstar brand)', ['vice', 'neon', 'ocean', 'gold', 'palm'].every((k) => !/rockstar|gta vi/i.test(V.plateAt(k, 0.8).label + ' ' + V.plateAt(k, 0.8).state)), ['vice', 'neon', 'ocean', 'gold', 'palm'].map((k) => V.plateAt(k, 0.8).label).join(','));
  check('describeStateChange names a plate change', V.describeStateChange({ plate: { on: false } }, { plate: { on: true, plate: 'vice', size: 0.8 } }) === 'Plate');
  check('emblems count is 5', Object.keys(V.EMBLEMS).length === 5 && V.EMBLEM_KEYS.length === 5, Object.keys(V.EMBLEMS).length + ' / ' + V.EMBLEM_KEYS.length);
  check('emblemAt clamps unknown emblem to vice', V.emblemAt('nope', 0.4).emblem === 'vice' && V.emblemAt('gold', 0.4).label === 'GOLDEN HOUR', JSON.stringify(V.emblemAt('nope', 0.4)));
  check('emblemAt clamps size to 0..1', V.emblemAt('neon', 2).size === 1 && V.emblemAt('neon', -1).size === 0, JSON.stringify(V.emblemAt('neon', 2)));
  check('emblemAt labels are original (no Rockstar brand)', ['vice', 'neon', 'sunset', 'gold', 'palm'].every((k) => !/rockstar|gta vi/i.test(V.emblemAt(k, 0.8).label + ' ' + V.emblemAt(k, 0.8).word)), ['vice', 'neon', 'sunset', 'gold', 'palm'].map((k) => V.emblemAt(k, 0.8).label).join(','));
  check('describeStateChange names an emblem change', V.describeStateChange({ emblem: { on: false } }, { emblem: { on: true, emblem: 'vice', size: 0.8 } }) === 'Emblem');
  check('shades count is 5', Object.keys(V.SHADES).length === 5 && V.SHADE_KEYS.length === 5, Object.keys(V.SHADES).length + ' / ' + V.SHADE_KEYS.length);
  check('shadeAt clamps unknown shade to coconut', V.shadeAt('nope', 0.4).shade === 'coconut' && V.shadeAt('banana', 0.4).label === 'BANANA LEAVES', JSON.stringify(V.shadeAt('nope', 0.4)));
  check('shadeAt clamps size to 0..1', V.shadeAt('fan', 2).size === 1 && V.shadeAt('fan', -1).size === 0, JSON.stringify(V.shadeAt('fan', 2)));
  check('shadeAt labels are original (no Rockstar brand)', ['coconut', 'fan', 'banana', 'areca', 'date'].every((k) => !/rockstar|gta vi/i.test(V.shadeAt(k, 0.8).label)), ['coconut', 'fan', 'banana', 'areca', 'date'].map((k) => V.shadeAt(k, 0.8).label).join(','));
  check('describeStateChange names a shade change', V.describeStateChange({ shade: { on: false } }, { shade: { on: true, shade: 'coconut', size: 0.8 } }) === 'Shade');
  check('seals count is 5', Object.keys(V.SEALS).length === 5 && V.SEAL_KEYS.length === 5, Object.keys(V.SEALS).length + ' / ' + V.SEAL_KEYS.length);
  check('sealAt clamps unknown seal to vice', V.sealAt('nope', 0.4).seal === 'vice' && V.sealAt('sunset', 0.4).label === 'SUNSET STRIP', JSON.stringify(V.sealAt('nope', 0.4)));
  check('sealAt clamps size to 0..1', V.sealAt('neon', 2).size === 1 && V.sealAt('neon', -1).size === 0, JSON.stringify(V.sealAt('neon', 2)));
  check('sealAt labels are original (no Rockstar brand)', ['vice', 'palm', 'sunset', 'neon', 'wave'].every((k) => !/rockstar|gta vi/i.test(V.sealAt(k, 0.8).label)), ['vice', 'palm', 'sunset', 'neon', 'wave'].map((k) => V.sealAt(k, 0.8).label).join(','));
  check('describeStateChange names a seal change', V.describeStateChange({ seal: { on: false } }, { seal: { on: true, seal: 'vice', size: 0.8 } }) === 'Seal');
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

  // --- v23 Key Art + Magazine Furniture ---
  check('default furniture is off', V.furnitureActive(V.state) === false, JSON.stringify(V.state.furniture));
  check('defaultFurniture values', (() => { const f = V.defaultFurniture(); return f.on === false && f.issue === '07' && f.date === 'NOV 2026' && f.price === '$9.99' && f.barcode === true; })());
  check('barcodeBars is 32 bars of 1..4', (() => { const b = V.barcodeBars('07'); return b.length === 32 && b.every((w) => w >= 1 && w <= 4); })(), V.barcodeBars('07').join(','));
  check('barcodeBars deterministic per issue', JSON.stringify(V.barcodeBars('07')) === JSON.stringify(V.barcodeBars('07')));
  check('barcodeBars differ per issue', JSON.stringify(V.barcodeBars('07')) !== JSON.stringify(V.barcodeBars('08')));
  check('clampFurnitureIssue strips non-digits', V.clampFurnitureIssue('a0b7x') === '07', V.clampFurnitureIssue('a0b7x'));
  check('clampFurnitureDate uppercases', V.clampFurnitureDate('nov 2026') === 'NOV 2026', V.clampFurnitureDate('nov 2026'));
  check('clampFurniturePrice strips letters', V.clampFurniturePrice('USD9.99') === '9.99', V.clampFurniturePrice('USD9.99'));
  check('keyart layout exists, 1 panel', V.LAYOUTS.keyart && V.LAYOUTS.keyart.panels === 1);
  check('bluehour grade exists', !!V.GRADES.bluehour && V.GRADES.bluehour.label === 'Blue Hour');
  check('layoutPanels keyart is full-bleed, no caption', (() => { const r = V.layoutPanels('keyart', 1280, 720); return r.length === 1 && r[0].x === 0 && r[0].y === 0 && r[0].w === 1280 && r[0].h === 720 && r[0].noCaption === true; })());
  check('viceKeyArt template exists', !!V.TEMPLATES.viceKeyArt);
  const keyState = V.state;
  const keyApplied = V.applyTemplate(keyState, 'viceKeyArt');
  V.redraw();
  check('applyTemplate viceKeyArt returns true', keyApplied === true);
  check('template sets keyart layout', keyState.layout === 'keyart', keyState.layout);
  check('template sets bluehour grade', keyState.grade === 'bluehour', keyState.grade);
  check('template turns the masthead off', keyState.masthead === false);
  check('template turns cover lines off', keyState.coverLinesOn === false);
  check('template turns furniture on', V.furnitureActive(keyState) === true, JSON.stringify(keyState.furniture));
  check('template title is VICE CITY', keyState.title === 'VICE CITY', keyState.title);
  check('describeStateChange names a furniture change', (() => {
    const a = { furniture: { on: false, issue: '07', date: 'NOV 2026', price: '$9.99', barcode: true } };
    const b = { furniture: { on: true, issue: '07', date: 'NOV 2026', price: '$9.99', barcode: true } };
    return V.describeStateChange(a, b) === 'Magazine furniture';
  })());
  check('snapshot/restore keeps the furniture', (() => {
    const snap = JSON.parse(JSON.stringify(keyState.furniture));
    keyState.furniture.on = false;
    keyState.furniture = JSON.parse(JSON.stringify(snap));
    return V.furnitureActive(keyState) === true && keyState.furniture.issue === '07';
  })());
  const ck1 = document.createElement('canvas'); ck1.width = 480; ck1.height = 270;
  const ck2 = document.createElement('canvas'); ck2.width = 480; ck2.height = 270;
  V.drawCover(ck1, { ...keyState, furniture: { on: false, issue: '07', date: 'NOV 2026', price: '$9.99', barcode: true } });
  V.drawCover(ck2, { ...keyState });
  check('drawCover keyart with furniture runs', sumPixels(ck2) > 0, sumPixels(ck2));
  check('furniture changes the rendered pixels', sumPixels(ck1) !== sumPixels(ck2), sumPixels(ck1) + ' vs ' + sumPixels(ck2));
  const kblob = await V.exportCover({ ...keyState }, 540, 540);
  check('exportCover keyart returns a PNG blob', kblob && kblob.size > 10000, kblob && kblob.size);
  check('fs-furniture fieldset exists', !!$('fs-furniture'));
  check('furniture controls exist', !!($('furnitureOn') && $('furnitureIssue') && $('furnitureDate') && $('furniturePrice') && $('furnitureBarcode')));
  check('furnitureOn reflects the template', $('furnitureOn').checked === true);
  $('furnitureIssue').value = '08';
  $('furnitureIssue').dispatchEvent(new Event('input'));
  check('UI issue change reaches state', V.state.furniture.issue === '08', V.state.furniture.issue);
  $('furnitureOn').click();
  check('UI uncheck turns furniture off', V.furnitureActive(V.state) === false);
  $('furnitureOn').click();
  check('UI re-check turns furniture on', V.furnitureActive(V.state) === true);

  // --- v24 Vice Clock (Time-of-Day dial) ---
  check('default clock is off at 18:30', V.timeOfDayActive(V.state) === false && V.state.timeOfDay.hour === 18.5, JSON.stringify(V.state.timeOfDay));
  check('defaultTimeOfDay values', (() => { const t = V.defaultTimeOfDay(); return t.on === false && t.hour === 18.5; })());
  check('7 time stops, 5..24', V.TIME_STOPS.length === 7 && V.TIME_STOPS[0].hour === 5 && V.TIME_STOPS[6].hour === 24, V.TIME_STOPS.map((s) => s.hour).join(','));
  check('5 time presets', V.TIME_PRESETS.length === 5, V.TIME_PRESETS.map((p) => p.label).join(','));
  check('clampTimeHour clamps below 5', V.clampTimeHour(2) === 5, V.clampTimeHour(2));
  check('clampTimeHour clamps above 24', V.clampTimeHour(30) === 24, V.clampTimeHour(30));
  check('clampTimeHour snaps to half hours', V.clampTimeHour(18.7) === 18.5, V.clampTimeHour(18.7));
  check('clampTimeHour NaN defaults to 18.5', V.clampTimeHour('x') === 18.5, V.clampTimeHour('x'));
  check('formatClockHour 18.5 is 18:30', V.formatClockHour(18.5) === '18:30', V.formatClockHour(18.5));
  check('formatClockHour 5 is 05:00', V.formatClockHour(5) === '05:00', V.formatClockHour(5));
  check('timeOfDayAt dawn label is DAWN', V.timeOfDayAt(5).label === 'DAWN', V.timeOfDayAt(5).label);
  check('timeOfDayAt noon label is NOON', V.timeOfDayAt(12).label === 'NOON', V.timeOfDayAt(12).label);
  check('timeOfDayAt 18.5 label is GOLDEN HOUR', V.timeOfDayAt(18.5).label === 'GOLDEN HOUR', V.timeOfDayAt(18.5).label);
  check('timeOfDayAt midnight label is MIDNIGHT', V.timeOfDayAt(24).label === 'MIDNIGHT', V.timeOfDayAt(24).label);
  check('sun at noon, moon at midnight', V.timeOfDayAt(12).disc === 'sun' && V.timeOfDayAt(24).disc === 'moon', V.timeOfDayAt(12).disc + '/' + V.timeOfDayAt(24).disc);
  check('disc travels left to right', V.timeOfDayAt(5).discX < V.timeOfDayAt(12).discX && V.timeOfDayAt(12).discX < V.timeOfDayAt(24).discX, [5, 12, 24].map((h) => V.timeOfDayAt(h).discX.toFixed(2)).join(','));
  check('disc rides higher at noon than at dawn', V.timeOfDayAt(12).discY < V.timeOfDayAt(5).discY, [5, 12].map((h) => V.timeOfDayAt(h).discY.toFixed(2)).join(','));
  check('sky tint differs dawn vs noon vs midnight', (() => { const a = V.timeOfDayAt(5), b = V.timeOfDayAt(12), c = V.timeOfDayAt(24); return a.top !== b.top && b.top !== c.top && a.bottom !== c.bottom; })());
  check('midpoint interpolates between stops', (() => { const a = V.timeOfDayAt(17), b = V.timeOfDayAt(19), m = V.timeOfDayAt(18); return m.top !== a.top && m.top !== b.top; })());
  check('timeOfDayAt deterministic', JSON.stringify(V.timeOfDayAt(18.5)) === JSON.stringify(V.timeOfDayAt(18.5)));
  check('viceGoldenHour template exists', !!V.TEMPLATES.viceGoldenHour);
  const clockState = V.state;
  const clockApplied = V.applyTemplate(clockState, 'viceGoldenHour');
  V.redraw();
  check('applyTemplate viceGoldenHour returns true', clockApplied === true);
  check('template sets keyart layout', clockState.layout === 'keyart', clockState.layout);
  check('template sets sunset grade', clockState.grade === 'sunset', clockState.grade);
  check('template turns the clock on at 18.5', V.timeOfDayActive(clockState) === true && clockState.timeOfDay.hour === 18.5, JSON.stringify(clockState.timeOfDay));
  check('template title is GOLDEN HOUR', clockState.title === 'GOLDEN HOUR', clockState.title);
  check('describeStateChange names a clock change', (() => {
    const a = { timeOfDay: { on: false, hour: 18.5 } };
    const b = { timeOfDay: { on: true, hour: 18.5 } };
    return V.describeStateChange(a, b) === 'Time of day';
  })());
  check('snapshot/restore keeps the clock', (() => {
    const snap = JSON.parse(JSON.stringify(clockState.timeOfDay));
    clockState.timeOfDay.on = false;
    clockState.timeOfDay = JSON.parse(JSON.stringify(snap));
    return V.timeOfDayActive(clockState) === true && clockState.timeOfDay.hour === 18.5;
  })());
  const cc1 = document.createElement('canvas'); cc1.width = 480; cc1.height = 270;
  const cc2 = document.createElement('canvas'); cc2.width = 480; cc2.height = 270;
  const cc3 = document.createElement('canvas'); cc3.width = 480; cc3.height = 270;
  V.drawCover(cc1, { ...clockState, timeOfDay: { on: false, hour: 18.5 } });
  V.drawCover(cc2, { ...clockState });
  V.drawCover(cc3, { ...clockState, timeOfDay: { on: true, hour: 24 } });
  check('drawCover keyart with clock runs', sumPixels(cc2) > 0, sumPixels(cc2));
  check('clock changes the rendered pixels', sumPixels(cc1) !== sumPixels(cc2), sumPixels(cc1) + ' vs ' + sumPixels(cc2));
  check('midnight clock differs from golden hour', sumPixels(cc2) !== sumPixels(cc3), sumPixels(cc2) + ' vs ' + sumPixels(cc3));
  const cblob = await V.exportCover({ ...clockState }, 540, 540);
  check('exportCover golden hour returns a PNG blob', cblob && cblob.size > 10000, cblob && cblob.size);
  check('fs-clock fieldset exists', !!$('fs-clock'));
  check('clock controls exist', !!($('clockOn') && $('clockHour') && $('clockHourVal') && document.querySelectorAll('.clockPreset').length === 5));
  check('clockOn reflects the template', $('clockOn').checked === true);
  check('clock readout shows 18:30 GOLDEN HOUR', $('clockHourVal').textContent.includes('18:30') && $('clockHourVal').textContent.includes('GOLDEN HOUR'), $('clockHourVal').textContent);
  $('clockHour').value = '21';
  $('clockHour').dispatchEvent(new Event('input'));
  check('UI hour change reaches state', V.state.timeOfDay.hour === 21, V.state.timeOfDay.hour);
  check('UI readout follows the hour', $('clockHourVal').textContent.includes('21:00') && $('clockHourVal').textContent.includes('BLUE HOUR'), $('clockHourVal').textContent);
  document.querySelector('.clockPreset[data-hour="24"]').click();
  check('UI preset sets midnight', V.state.timeOfDay.hour === 24 && V.timeOfDayActive(V.state) === true, JSON.stringify(V.state.timeOfDay));
  $('clockOn').click();
  check('UI uncheck turns clock off', V.timeOfDayActive(V.state) === false);
  $('clockOn').click();
  check('UI re-check turns clock on', V.timeOfDayActive(V.state) === true);

  // --- v25 Vice Weather (Weather dial: kind + intensity) ---
  check('default weather is off, rain 60%', V.weatherActive(V.state) === false && V.state.weather.kind === 'rain' && V.state.weather.intensity === 0.6, JSON.stringify(V.state.weather));
  check('defaultWeather values', (() => { const w = V.defaultWeather(); return w.on === false && w.kind === 'rain' && w.intensity === 0.6; })());
  check('5 weather kinds', Object.keys(V.WEATHER_KINDS).length === 5, Object.keys(V.WEATHER_KINDS).join(','));
  check('5 weather presets', V.WEATHER_PRESETS.length === 5, V.WEATHER_PRESETS.map((p) => p.label).join(','));
  check('clampWeatherIntensity clamps below 0', V.clampWeatherIntensity(-0.5) === 0, V.clampWeatherIntensity(-0.5));
  check('clampWeatherIntensity clamps above 1', V.clampWeatherIntensity(1.5) === 1, V.clampWeatherIntensity(1.5));
  check('clampWeatherIntensity snaps to hundredths', V.clampWeatherIntensity(0.678) === 0.68, V.clampWeatherIntensity(0.678));
  check('clampWeatherIntensity NaN defaults to 0.6', V.clampWeatherIntensity('x') === 0.6, V.clampWeatherIntensity('x'));
  check('clampWeatherKind unknown falls back to rain', V.clampWeatherKind('hail') === 'rain', V.clampWeatherKind('hail'));
  check('weatherAt labels', V.weatherAt('clear', 0.5).label === 'CLEAR' && V.weatherAt('haze', 0.5).label === 'GOLDEN HAZE' && V.weatherAt('rain', 0.5).label === 'RAIN' && V.weatherAt('storm', 0.5).label === 'STORM' && V.weatherAt('fog', 0.5).label === 'FOG', ['clear', 'haze', 'rain', 'storm', 'fog'].map((k) => V.weatherAt(k, 0.5).label).join(','));
  check('weatherAt clear weathers nothing', (() => { const w = V.weatherAt('clear', 1); return w.tintAlpha === 0 && w.rainCount === 0 && w.fogAlpha === 0 && w.bolt === false; })());
  check('weatherAt storm 0.8 has lightning', V.weatherAt('storm', 0.8).bolt === true, JSON.stringify(V.weatherAt('storm', 0.8)));
  check('weatherAt storm 0.2 has no lightning', V.weatherAt('storm', 0.2).bolt === false, JSON.stringify(V.weatherAt('storm', 0.2)));
  check('weatherAt rain 0.6 has 54 streaks', V.weatherAt('rain', 0.6).rainCount === 54, V.weatherAt('rain', 0.6).rainCount);
  check('weatherAt fog 0.8 fogAlpha is 0.8', V.weatherAt('fog', 0.8).fogAlpha === 0.8, V.weatherAt('fog', 0.8).fogAlpha);
  check('weatherAt intensity scales the rain', V.weatherAt('rain', 0.3).rainCount < V.weatherAt('rain', 0.9).rainCount, V.weatherAt('rain', 0.3).rainCount + ' vs ' + V.weatherAt('rain', 0.9).rainCount);
  check('weatherAt deterministic', JSON.stringify(V.weatherAt('storm', 0.8)) === JSON.stringify(V.weatherAt('storm', 0.8)));
  check('viceStorm template exists', !!V.TEMPLATES.viceStorm);
  const weatherState = V.state;
  const weatherApplied = V.applyTemplate(weatherState, 'viceStorm');
  V.redraw();
  check('applyTemplate viceStorm returns true', weatherApplied === true);
  check('template sets keyart layout', weatherState.layout === 'keyart', weatherState.layout);
  check('template sets bluehour grade', weatherState.grade === 'bluehour', weatherState.grade);
  check('template turns storm on at 80%', V.weatherActive(weatherState) === true && weatherState.weather.kind === 'storm' && weatherState.weather.intensity === 0.8, JSON.stringify(weatherState.weather));
  check('template title is VICE STORM', weatherState.title === 'VICE STORM', weatherState.title);
  check('describeStateChange names a weather change', (() => {
    const a = { weather: { on: false, kind: 'rain', intensity: 0.6 } };
    const b = { weather: { on: true, kind: 'rain', intensity: 0.6 } };
    return V.describeStateChange(a, b) === 'Weather';
  })());
  check('snapshot/restore keeps the weather', (() => {
    const snap = JSON.parse(JSON.stringify(weatherState.weather));
    weatherState.weather.on = false;
    weatherState.weather = JSON.parse(JSON.stringify(snap));
    return V.weatherActive(weatherState) === true && weatherState.weather.kind === 'storm' && weatherState.weather.intensity === 0.8;
  })());
  const wc1 = document.createElement('canvas'); wc1.width = 480; wc1.height = 270;
  const wc2 = document.createElement('canvas'); wc2.width = 480; wc2.height = 270;
  const wc3 = document.createElement('canvas'); wc3.width = 480; wc3.height = 270;
  const wc4 = document.createElement('canvas'); wc4.width = 480; wc4.height = 270;
  V.drawCover(wc1, { ...weatherState, weather: { on: false, kind: 'storm', intensity: 0.8 } });
  V.drawCover(wc2, { ...weatherState });
  V.drawCover(wc3, { ...weatherState, weather: { on: true, kind: 'fog', intensity: 0.8 } });
  V.drawCover(wc4, { ...weatherState });
  check('drawCover keyart with storm runs', sumPixels(wc2) > 0, sumPixels(wc2));
  check('storm changes the rendered pixels', sumPixels(wc1) !== sumPixels(wc2), sumPixels(wc1) + ' vs ' + sumPixels(wc2));
  check('fog differs from storm', sumPixels(wc2) !== sumPixels(wc3), sumPixels(wc2) + ' vs ' + sumPixels(wc3));
  check('storm render is deterministic', sumPixels(wc2) === sumPixels(wc4), sumPixels(wc2) + ' vs ' + sumPixels(wc4));
  const wblob = await V.exportCover({ ...weatherState }, 540, 540);
  check('exportCover storm returns a PNG blob', wblob && wblob.size > 10000, wblob && wblob.size);
  check('fs-weather fieldset exists', !!$('fs-weather'));
  check('weather controls exist', !!($('weatherOn') && $('weatherInt') && $('weatherIntVal') && document.querySelectorAll('.weatherPreset').length === 5));
  check('weatherOn reflects the template', $('weatherOn').checked === true);
  check('weather readout shows STORM • 80%', $('weatherIntVal').textContent.includes('STORM') && $('weatherIntVal').textContent.includes('80%'), $('weatherIntVal').textContent);
  $('weatherInt').value = '30';
  $('weatherInt').dispatchEvent(new Event('input'));
  check('UI intensity change reaches state', V.state.weather.intensity === 0.3, V.state.weather.intensity);
  check('UI readout follows the intensity', $('weatherIntVal').textContent.includes('STORM') && $('weatherIntVal').textContent.includes('30%'), $('weatherIntVal').textContent);
  document.querySelector('.weatherPreset[data-kind="fog"]').click();
  check('UI preset sets fog', V.state.weather.kind === 'fog' && V.weatherActive(V.state) === true, JSON.stringify(V.state.weather));
  $('weatherOn').click();
  check('UI uncheck turns weather off', V.weatherActive(V.state) === false);
  $('weatherOn').click();
  check('UI re-check turns weather on', V.weatherActive(V.state) === true);

  // --- v26 Vice Era (Era dial: year + intensity) ---
  check('default era is off, 1986 80%', V.eraActive(V.state) === false && V.state.era.era === '1986' && V.state.era.intensity === 0.8, JSON.stringify(V.state.era));
  check('defaultEra values', (() => { const e = V.defaultEra(); return e.on === false && e.era === '1986' && e.intensity === 0.8; })());
  check('5 era kinds', Object.keys(V.ERA_KINDS).length === 5, Object.keys(V.ERA_KINDS).join(','));
  check('5 era presets', V.ERA_PRESETS.length === 5, V.ERA_PRESETS.map((p) => p.label).join(','));
  check('clampEraIntensity clamps below 0', V.clampEraIntensity(-0.5) === 0, V.clampEraIntensity(-0.5));
  check('clampEraIntensity clamps above 1', V.clampEraIntensity(1.5) === 1, V.clampEraIntensity(1.5));
  check('clampEraIntensity snaps to hundredths', V.clampEraIntensity(0.678) === 0.68, V.clampEraIntensity(0.678));
  check('clampEraIntensity NaN defaults to 0.8', V.clampEraIntensity('x') === 0.8, V.clampEraIntensity('x'));
  check('clampEra unknown falls back to 1986', V.clampEra('2099') === '1986', V.clampEra('2099'));
  check('eraAt labels', V.eraAt('1986', 0.5).label === 'VICE 1986' && V.eraAt('1998', 0.5).label === 'VICE 1998' && V.eraAt('2002', 0.5).label === 'VICE 2002' && V.eraAt('2013', 0.5).label === 'VICE 2013' && V.eraAt('2026', 0.5).label === 'VICE 2026', ['1986', '1998', '2002', '2013', '2026'].map((k) => V.eraAt(k, 0.5).label).join(','));
  check('eraAt 2026 ages almost nothing', (() => { const e = V.eraAt('2026', 1); return e.grainCount === 0 && e.scanlines === false && e.tintAlpha === 0.04; })());
  check('eraAt 1986 0.8 has scanlines', V.eraAt('1986', 0.8).scanlines === true, JSON.stringify(V.eraAt('1986', 0.8)));
  check('eraAt 1986 0.2 has no scanlines', V.eraAt('1986', 0.2).scanlines === false, JSON.stringify(V.eraAt('1986', 0.2)));
  check('eraAt 1986 0.8 has 720 grain dots', V.eraAt('1986', 0.8).grainCount === 720, V.eraAt('1986', 0.8).grainCount);
  check('eraAt 1998 0.8 grain is half of 1986', V.eraAt('1998', 0.8).grainCount === 360, V.eraAt('1998', 0.8).grainCount);
  check('eraAt intensity scales the grain', V.eraAt('1986', 0.3).grainCount < V.eraAt('1986', 0.9).grainCount, V.eraAt('1986', 0.3).grainCount + ' vs ' + V.eraAt('1986', 0.9).grainCount);
  check('eraAt deterministic', JSON.stringify(V.eraAt('1986', 0.8)) === JSON.stringify(V.eraAt('1986', 0.8)));
  check('vice1986 template exists', !!V.TEMPLATES.vice1986);
  const eraState = V.state;
  const eraApplied = V.applyTemplate(eraState, 'vice1986');
  V.redraw();
  check('applyTemplate vice1986 returns true', eraApplied === true);
  check('template sets keyart layout', eraState.layout === 'keyart', eraState.layout);
  check('template sets sunset grade', eraState.grade === 'sunset', eraState.grade);
  check('template turns 1986 on at 80%', V.eraActive(eraState) === true && eraState.era.era === '1986' && eraState.era.intensity === 0.8, JSON.stringify(eraState.era));
  check('template title is VICE 1986', eraState.title === 'VICE 1986', eraState.title);
  check('describeStateChange names an era change', (() => {
    const a = { era: { on: false, era: '1986', intensity: 0.8 } };
    const b = { era: { on: true, era: '1986', intensity: 0.8 } };
    return V.describeStateChange(a, b) === 'Era';
  })());
  check('snapshot/restore keeps the era', (() => {
    const snap = JSON.parse(JSON.stringify(eraState.era));
    eraState.era.on = false;
    eraState.era = JSON.parse(JSON.stringify(snap));
    return V.eraActive(eraState) === true && eraState.era.era === '1986' && eraState.era.intensity === 0.8;
  })());
  const ec1 = document.createElement('canvas'); ec1.width = 480; ec1.height = 270;
  const ec2 = document.createElement('canvas'); ec2.width = 480; ec2.height = 270;
  const ec3 = document.createElement('canvas'); ec3.width = 480; ec3.height = 270;
  const ec4 = document.createElement('canvas'); ec4.width = 480; ec4.height = 270;
  V.drawCover(ec1, { ...eraState, era: { on: false, era: '1986', intensity: 0.8 } });
  V.drawCover(ec2, { ...eraState });
  V.drawCover(ec3, { ...eraState, era: { on: true, era: '2013', intensity: 0.8 } });
  V.drawCover(ec4, { ...eraState });
  check('drawCover keyart with 1986 runs', sumPixels(ec2) > 0, sumPixels(ec2));
  check('1986 changes the rendered pixels', sumPixels(ec1) !== sumPixels(ec2), sumPixels(ec1) + ' vs ' + sumPixels(ec2));
  check('2013 differs from 1986', sumPixels(ec2) !== sumPixels(ec3), sumPixels(ec2) + ' vs ' + sumPixels(ec3));
  check('1986 render is deterministic', sumPixels(ec2) === sumPixels(ec4), sumPixels(ec2) + ' vs ' + sumPixels(ec4));
  const eblob = await V.exportCover({ ...eraState }, 540, 540);
  check('exportCover 1986 returns a PNG blob', eblob && eblob.size > 10000, eblob && eblob.size);
  check('fs-era fieldset exists', !!$('fs-era'));
  check('era controls exist', !!($('eraOn') && $('eraInt') && $('eraIntVal') && document.querySelectorAll('.eraPreset').length === 5));
  check('eraOn reflects the template', $('eraOn').checked === true);
  check('era readout shows VICE 1986 • 80%', $('eraIntVal').textContent.includes('VICE 1986') && $('eraIntVal').textContent.includes('80%'), $('eraIntVal').textContent);
  $('eraInt').value = '30';
  $('eraInt').dispatchEvent(new Event('input'));
  check('UI intensity change reaches state', V.state.era.intensity === 0.3, V.state.era.intensity);
  check('UI readout follows the intensity', $('eraIntVal').textContent.includes('VICE 1986') && $('eraIntVal').textContent.includes('30%'), $('eraIntVal').textContent);
  document.querySelector('.eraPreset[data-era="2013"]').click();
  check('UI preset sets 2013', V.state.era.era === '2013' && V.eraActive(V.state) === true, JSON.stringify(V.state.era));
  $('eraOn').click();
  check('UI uncheck turns era off', V.eraActive(V.state) === false);
  $('eraOn').click();
  check('UI re-check turns era on', V.eraActive(V.state) === true);

  // --- v27 Vice District (District dial: place + intensity) ---
  check('default district is off, ocean 80%', V.districtActive(V.state) === false && V.state.district.district === 'ocean' && V.state.district.intensity === 0.8, JSON.stringify(V.state.district));
  check('defaultDistrict values', (() => { const d = V.defaultDistrict(); return d.on === false && d.district === 'ocean' && d.intensity === 0.8; })());
  check('5 district kinds', Object.keys(V.DISTRICT_KINDS).length === 5, Object.keys(V.DISTRICT_KINDS).join(','));
  check('5 district presets', V.DISTRICT_PRESETS.length === 5, V.DISTRICT_PRESETS.map((p) => p.label).join(','));
  check('clampDistrictIntensity clamps below 0', V.clampDistrictIntensity(-0.5) === 0, V.clampDistrictIntensity(-0.5));
  check('clampDistrictIntensity clamps above 1', V.clampDistrictIntensity(1.5) === 1, V.clampDistrictIntensity(1.5));
  check('clampDistrictIntensity snaps to hundredths', V.clampDistrictIntensity(0.678) === 0.68, V.clampDistrictIntensity(0.678));
  check('clampDistrictIntensity NaN defaults to 0.8', V.clampDistrictIntensity('x') === 0.8, V.clampDistrictIntensity('x'));
  check('clampDistrict unknown falls back to ocean', V.clampDistrict('nowhere') === 'ocean', V.clampDistrict('nowhere'));
  check('districtAt labels', V.districtAt('ocean', 0.5).label === 'OCEAN DRIVE' && V.districtAt('havana', 0.5).label === 'LITTLE HAVANA' && V.districtAt('downtown', 0.5).label === 'DOWNTOWN' && V.districtAt('port', 0.5).label === 'PORT VICE' && V.districtAt('glades', 0.5).label === 'EVERGLADES', ['ocean', 'havana', 'downtown', 'port', 'glades'].map((k) => V.districtAt(k, 0.5).label).join(','));
  check('districtAt profiles differ', V.districtAt('downtown', 0.8).profile === 'towers' && V.districtAt('ocean', 0.8).profile === 'deco' && V.districtAt('port', 0.8).profile === 'cranes' && V.districtAt('glades', 0.8).profile === 'flat' && V.districtAt('havana', 0.8).profile === 'low', ['ocean', 'havana', 'downtown', 'port', 'glades'].map((k) => V.districtAt(k, 0.8).profile).join(','));
  check('districtAt downtown skyline is tallest', V.districtAt('downtown', 0.8).skylineH > V.districtAt('glades', 0.8).skylineH, V.districtAt('downtown', 0.8).skylineH + ' vs ' + V.districtAt('glades', 0.8).skylineH);
  check('districtAt intensity scales the tint', V.districtAt('ocean', 0.3).tintAlpha < V.districtAt('ocean', 0.9).tintAlpha, V.districtAt('ocean', 0.3).tintAlpha + ' vs ' + V.districtAt('ocean', 0.9).tintAlpha);
  check('districtAt intensity scales the windows', V.districtAt('ocean', 0.3).windowCount < V.districtAt('ocean', 0.9).windowCount, V.districtAt('ocean', 0.3).windowCount + ' vs ' + V.districtAt('ocean', 0.9).windowCount);
  check('districtAt deterministic', JSON.stringify(V.districtAt('ocean', 0.8)) === JSON.stringify(V.districtAt('ocean', 0.8)));
  check('viceOceanDrive template exists', !!V.TEMPLATES.viceOceanDrive);
  const distState = V.state;
  const distApplied = V.applyTemplate(distState, 'viceOceanDrive');
  V.redraw();
  check('applyTemplate viceOceanDrive returns true', distApplied === true);
  check('template sets keyart layout', distState.layout === 'keyart', distState.layout);
  check('template sets beach backdrop', distState.backdrop === 'beach', distState.backdrop);
  check('template turns ocean on at 80%', V.districtActive(distState) === true && distState.district.district === 'ocean' && distState.district.intensity === 0.8, JSON.stringify(distState.district));
  check('template title is OCEAN DRIVE', distState.title === 'OCEAN DRIVE', distState.title);
  check('describeStateChange names a district change', (() => {
    const a = { district: { on: false, district: 'ocean', intensity: 0.8 } };
    const b = { district: { on: true, district: 'ocean', intensity: 0.8 } };
    return V.describeStateChange(a, b) === 'District';
  })());
  check('snapshot/restore keeps the district', (() => {
    const snap = JSON.parse(JSON.stringify(distState.district));
    distState.district.on = false;
    distState.district = JSON.parse(JSON.stringify(snap));
    return V.districtActive(distState) === true && distState.district.district === 'ocean' && distState.district.intensity === 0.8;
  })());
  const dc1 = document.createElement('canvas'); dc1.width = 480; dc1.height = 270;
  const dc2 = document.createElement('canvas'); dc2.width = 480; dc2.height = 270;
  const dc3 = document.createElement('canvas'); dc3.width = 480; dc3.height = 270;
  const dc4 = document.createElement('canvas'); dc4.width = 480; dc4.height = 270;
  V.drawCover(dc1, { ...distState, district: { on: false, district: 'ocean', intensity: 0.8 } });
  V.drawCover(dc2, { ...distState });
  V.drawCover(dc3, { ...distState, district: { on: true, district: 'downtown', intensity: 0.8 } });
  V.drawCover(dc4, { ...distState });
  check('drawCover keyart with ocean runs', sumPixels(dc2) > 0, sumPixels(dc2));
  check('ocean changes the rendered pixels', sumPixels(dc1) !== sumPixels(dc2), sumPixels(dc1) + ' vs ' + sumPixels(dc2));
  check('downtown differs from ocean', sumPixels(dc2) !== sumPixels(dc3), sumPixels(dc2) + ' vs ' + sumPixels(dc3));
  check('ocean render is deterministic', sumPixels(dc2) === sumPixels(dc4), sumPixels(dc2) + ' vs ' + sumPixels(dc4));
  const dblob = await V.exportCover({ ...distState }, 540, 540);
  check('exportCover ocean returns a PNG blob', dblob && dblob.size > 10000, dblob && dblob.size);
  check('fs-district fieldset exists', !!$('fs-district'));
  check('district controls exist', !!($('districtOn') && $('districtInt') && $('districtIntVal') && document.querySelectorAll('.districtPreset').length === 5));
  check('districtOn reflects the template', $('districtOn').checked === true);
  check('district readout shows OCEAN DRIVE • 80%', $('districtIntVal').textContent.includes('OCEAN DRIVE') && $('districtIntVal').textContent.includes('80%'), $('districtIntVal').textContent);
  $('districtInt').value = '30';
  $('districtInt').dispatchEvent(new Event('input'));
  check('UI intensity change reaches state', V.state.district.intensity === 0.3, V.state.district.intensity);
  check('UI readout follows the intensity', $('districtIntVal').textContent.includes('OCEAN DRIVE') && $('districtIntVal').textContent.includes('30%'), $('districtIntVal').textContent);
  document.querySelector('.districtPreset[data-district="downtown"]').click();
  check('UI preset sets downtown', V.state.district.district === 'downtown' && V.districtActive(V.state) === true, JSON.stringify(V.state.district));
  $('districtOn').click();
  check('UI uncheck turns district off', V.districtActive(V.state) === false);
  $('districtOn').click();
  check('UI re-check turns district on', V.districtActive(V.state) === true);

  // --- v28 Vice Moment (Moment dial: one moment conducts time +
  // weather + era + district + grade + backdrop) ---
  check('default moment is off, heist 80%', V.momentActive(V.state) === false && V.state.moment.moment === 'heist' && V.state.moment.intensity === 0.8, JSON.stringify(V.state.moment));
  check('defaultMoment values', (() => { const m = V.defaultMoment(); return m.on === false && m.moment === 'heist' && m.intensity === 0.8; })());
  check('5 moment kinds', Object.keys(V.MOMENT_KINDS).length === 5, Object.keys(V.MOMENT_KINDS).join(','));
  check('5 moment presets', V.MOMENT_PRESETS.length === 5, V.MOMENT_PRESETS.map((p) => p.label).join(','));
  check('clampMomentIntensity clamps below 0', V.clampMomentIntensity(-0.5) === 0, V.clampMomentIntensity(-0.5));
  check('clampMomentIntensity clamps above 1', V.clampMomentIntensity(1.5) === 1, V.clampMomentIntensity(1.5));
  check('clampMomentIntensity snaps to hundredths', V.clampMomentIntensity(0.678) === 0.68, V.clampMomentIntensity(0.678));
  check('clampMomentIntensity NaN defaults to 0.8', V.clampMomentIntensity('x') === 0.8, V.clampMomentIntensity('x'));
  check('clampMoment unknown falls back to heist', V.clampMoment('nowhere') === 'heist', V.clampMoment('nowhere'));
  check('momentAt labels', V.momentAt('heist', 0.5).label === 'SUNSET HEIST' && V.momentAt('neonrain', 0.5).label === 'NEON RAIN 1986' && V.momentAt('dawn', 0.5).label === 'EVERGLADES DAWN' && V.momentAt('midnight', 0.5).label === 'OCEAN MIDNIGHT' && V.momentAt('havana', 0.5).label === 'LITTLE HAVANA GOLD', ['heist', 'neonrain', 'dawn', 'midnight', 'havana'].map((k) => V.momentAt(k, 0.5).label).join(','));
  check('momentAt motifs differ', V.momentAt('heist', 0.8).motif === 'sun' && V.momentAt('neonrain', 0.8).motif === 'neon' && V.momentAt('dawn', 0.8).motif === 'mist' && V.momentAt('midnight', 0.8).motif === 'moon' && V.momentAt('havana', 0.8).motif === 'rays', ['heist', 'neonrain', 'dawn', 'midnight', 'havana'].map((k) => V.momentAt(k, 0.8).motif).join(','));
  check('momentAt intensity scales the tint', V.momentAt('heist', 0.3).tintAlpha < V.momentAt('heist', 0.9).tintAlpha, V.momentAt('heist', 0.3).tintAlpha + ' vs ' + V.momentAt('heist', 0.9).tintAlpha);
  check('momentAt deterministic', JSON.stringify(V.momentAt('heist', 0.8)) === JSON.stringify(V.momentAt('heist', 0.8)));
  check('heist recipe is golden hour + haze + 2013 + downtown', (() => { const r = V.momentAt('heist', 0.8).recipe; return r.hour === 18.5 && r.weather === 'haze' && r.era === '2013' && r.district === 'downtown' && r.grade === 'sunset' && r.backdrop === 'skyline'; })(), JSON.stringify(V.momentAt('heist', 0.8).recipe));
  check('neonrain recipe is midnight + rain + 1986 + ocean', (() => { const r = V.momentAt('neonrain', 0.8).recipe; return r.hour === 22 && r.weather === 'rain' && r.era === '1986' && r.district === 'ocean' && r.grade === 'neon' && r.backdrop === 'street'; })(), JSON.stringify(V.momentAt('neonrain', 0.8).recipe));
  check('dawn recipe is dawn + fog + glades', (() => { const r = V.momentAt('dawn', 0.8).recipe; return r.hour === 6 && r.weather === 'fog' && r.district === 'glades' && r.grade === 'bluehour'; })(), JSON.stringify(V.momentAt('dawn', 0.8).recipe));
  check('midnight recipe is late + clear + ocean', (() => { const r = V.momentAt('midnight', 0.8).recipe; return r.hour === 23.5 && r.weather === 'clear' && r.district === 'ocean'; })(), JSON.stringify(V.momentAt('midnight', 0.8).recipe));
  check('havana recipe is 17:00 + haze + 1998 + havana', (() => { const r = V.momentAt('havana', 0.8).recipe; return r.hour === 17 && r.weather === 'haze' && r.era === '1998' && r.district === 'havana'; })(), JSON.stringify(V.momentAt('havana', 0.8).recipe));
  check('applyMoment conducts the clock', (() => { const s = {}; V.applyMoment(s, 'heist', 0.8); return V.timeOfDayActive(s) === true && s.timeOfDay.hour === 18.5; })());
  check('applyMoment conducts weather + era + district', (() => { const s = {}; V.applyMoment(s, 'neonrain', 0.8); return V.weatherActive(s) === true && s.weather.kind === 'rain' && s.weather.intensity === 0.8 && V.eraActive(s) === true && s.era.era === '1986' && V.districtActive(s) === true && s.district.district === 'ocean'; })(), JSON.stringify((() => { const s = {}; V.applyMoment(s, 'neonrain', 0.8); return { w: s.weather, e: s.era, d: s.district }; })()));
  check('applyMoment conducts grade + backdrop', (() => { const s = {}; V.applyMoment(s, 'dawn', 0.8); return s.grade === 'bluehour' && s.backdrop === 'beach'; })());
  check('applyMoment turns the moment on', (() => { const s = {}; V.applyMoment(s, 'midnight', 0.8); return V.momentActive(s) === true && s.moment.moment === 'midnight' && s.moment.intensity === 0.8; })());
  check('applyMoment unknown falls back to heist', (() => { const s = {}; V.applyMoment(s, 'nowhere', 0.8); return s.moment.moment === 'heist' && s.timeOfDay.hour === 18.5; })());
  check('viceSunsetHeist template exists', !!V.TEMPLATES.viceSunsetHeist);
  const moState = V.state;
  const moApplied = V.applyTemplate(moState, 'viceSunsetHeist');
  V.redraw();
  check('applyTemplate viceSunsetHeist returns true', moApplied === true);
  check('template sets keyart layout', moState.layout === 'keyart', moState.layout);
  check('template sets skyline backdrop', moState.backdrop === 'skyline', moState.backdrop);
  check('template sets sunset grade', moState.grade === 'sunset', moState.grade);
  check('template turns heist on at 80%', V.momentActive(moState) === true && moState.moment.moment === 'heist' && moState.moment.intensity === 0.8, JSON.stringify(moState.moment));
  check('template conducts clock to 18.5', V.timeOfDayActive(moState) === true && moState.timeOfDay.hour === 18.5, JSON.stringify(moState.timeOfDay));
  check('template conducts weather to haze 0.6', V.weatherActive(moState) === true && moState.weather.kind === 'haze' && moState.weather.intensity === 0.6, JSON.stringify(moState.weather));
  check('template conducts era to 2013 0.5', V.eraActive(moState) === true && moState.era.era === '2013' && moState.era.intensity === 0.5, JSON.stringify(moState.era));
  check('template conducts district to downtown 0.7', V.districtActive(moState) === true && moState.district.district === 'downtown' && moState.district.intensity === 0.7, JSON.stringify(moState.district));
  check('template title is SUNSET HEIST', moState.title === 'SUNSET HEIST', moState.title);
  check('templateMatches viceSunsetHeist', V.templateMatches(moState, 'viceSunsetHeist') === true);
  check('describeStateChange names a moment change', (() => {
    const a = { moment: { on: false, moment: 'heist', intensity: 0.8 } };
    const b = { moment: { on: true, moment: 'heist', intensity: 0.8 } };
    return V.describeStateChange(a, b) === 'Moment';
  })());
  check('snapshot/restore keeps the moment', (() => {
    const snap = JSON.parse(JSON.stringify(moState.moment));
    moState.moment.on = false;
    moState.moment = JSON.parse(JSON.stringify(snap));
    return V.momentActive(moState) === true && moState.moment.moment === 'heist' && moState.moment.intensity === 0.8;
  })());
  const mc1 = document.createElement('canvas'); mc1.width = 480; mc1.height = 270;
  const mc2 = document.createElement('canvas'); mc2.width = 480; mc2.height = 270;
  const mc3 = document.createElement('canvas'); mc3.width = 480; mc3.height = 270;
  const mc4 = document.createElement('canvas'); mc4.width = 480; mc4.height = 270;
  V.drawCover(mc1, { ...moState, moment: { on: false, moment: 'heist', intensity: 0.8 } });
  V.drawCover(mc2, { ...moState });
  V.drawCover(mc3, { ...moState, moment: { on: true, moment: 'midnight', intensity: 0.8 } });
  V.drawCover(mc4, { ...moState });
  check('drawCover keyart with heist runs', sumPixels(mc2) > 0, sumPixels(mc2));
  check('heist changes the rendered pixels', sumPixels(mc1) !== sumPixels(mc2), sumPixels(mc1) + ' vs ' + sumPixels(mc2));
  check('midnight differs from heist', sumPixels(mc2) !== sumPixels(mc3), sumPixels(mc2) + ' vs ' + sumPixels(mc3));
  check('heist render is deterministic', sumPixels(mc2) === sumPixels(mc4), sumPixels(mc2) + ' vs ' + sumPixels(mc4));
  const mblob = await V.exportCover({ ...moState }, 540, 540);
  check('exportCover heist returns a PNG blob', mblob && mblob.size > 10000, mblob && mblob.size);
  check('fs-moment fieldset exists', !!$('fs-moment'));
  check('moment controls exist', !!($('momentOn') && $('momentInt') && $('momentIntVal') && document.querySelectorAll('.momentPreset').length === 5));
  check('momentOn reflects the template', $('momentOn').checked === true);
  check('moment readout shows SUNSET HEIST • 80%', $('momentIntVal').textContent.includes('SUNSET HEIST') && $('momentIntVal').textContent.includes('80%'), $('momentIntVal').textContent);
  $('momentInt').value = '30';
  $('momentInt').dispatchEvent(new Event('input'));
  check('UI intensity change reaches state', V.state.moment.intensity === 0.3, V.state.moment.intensity);
  check('UI readout follows the intensity', $('momentIntVal').textContent.includes('SUNSET HEIST') && $('momentIntVal').textContent.includes('30%'), $('momentIntVal').textContent);
  document.querySelector('.momentPreset[data-moment="neonrain"]').click();
  check('UI preset conducts neonrain', V.state.moment.moment === 'neonrain' && V.momentActive(V.state) === true && V.state.timeOfDay.hour === 22 && V.state.weather.kind === 'rain' && V.state.era.era === '1986' && V.state.district.district === 'ocean' && V.state.grade === 'neon', JSON.stringify({ m: V.state.moment, t: V.state.timeOfDay, w: V.state.weather, e: V.state.era, d: V.state.district, g: V.state.grade }));
  check('UI preset re-syncs the conducted dials', $('clockHour').value === '22' && $('weatherIntVal').textContent.includes('RAIN') && $('eraIntVal').textContent.includes('VICE 1986') && $('districtIntVal').textContent.includes('OCEAN DRIVE') && $('momentIntVal').textContent.includes('NEON RAIN 1986'), $('clockHour').value + ' / ' + $('weatherIntVal').textContent + ' / ' + $('eraIntVal').textContent + ' / ' + $('districtIntVal').textContent);
  $('momentOn').click();
  check('UI uncheck turns moment off', V.momentActive(V.state) === false);
  $('momentOn').click();
  check('UI re-check turns moment on', V.momentActive(V.state) === true);

  // --- v29 Vice Wanted (Wanted dial: 0–5 stars + police wash + beams + chip) ---
  check('default wanted is off, level 5', V.wantedActive(V.state) === false && V.state.wanted.level === 5, JSON.stringify(V.state.wanted));
  check('defaultWanted values', (() => { const w = V.defaultWanted(); return w.on === false && w.level === 5; })());
  check('6 wanted presets', V.WANTED_PRESETS.length === 6, V.WANTED_PRESETS.map((p) => p.label).join(','));
  check('wanted presets cover levels 0-5', V.WANTED_PRESETS.map((p) => p.level).join(',') === '0,1,2,3,4,5', V.WANTED_PRESETS.map((p) => p.level).join(','));
  check('clampWantedLevel clamps below 0', V.clampWantedLevel(-2) === 0, V.clampWantedLevel(-2));
  check('clampWantedLevel clamps above 5', V.clampWantedLevel(9) === 5, V.clampWantedLevel(9));
  check('clampWantedLevel rounds to whole stars', V.clampWantedLevel(2.6) === 3, V.clampWantedLevel(2.6));
  check('clampWantedLevel NaN defaults to 5', V.clampWantedLevel('x') === 5, V.clampWantedLevel('x'));
  check('wantedAt labels', V.wantedAt(0).label === 'CLEAN' && V.wantedAt(1).label === 'LOW PROFILE' && V.wantedAt(2).label === 'ON THE RADAR' && V.wantedAt(3).label === 'HOT' && V.wantedAt(4).label === 'MOST WANTED' && V.wantedAt(5).label === 'FIVE STAR', [0, 1, 2, 3, 4, 5].map((l) => V.wantedAt(l).label).join(','));
  check('wantedAt heat scales with the level', V.wantedAt(0).heat === 0 && V.wantedAt(1).heat < V.wantedAt(5).heat && V.wantedAt(5).heat === 1, V.wantedAt(0).heat + ' / ' + V.wantedAt(1).heat + ' / ' + V.wantedAt(5).heat);
  check('wantedAt stars equal the level', V.wantedAt(3).stars === 3 && V.wantedAt(5).stars === 5, V.wantedAt(3).stars + ' / ' + V.wantedAt(5).stars);
  check('wantedAt deterministic', JSON.stringify(V.wantedAt(4)) === JSON.stringify(V.wantedAt(4)));
  check('applyWanted turns wanted on at the level', (() => { const s2 = {}; V.applyWanted(s2, 2); return V.wantedActive(s2) === true && s2.wanted.level === 2; })());
  check('applyWanted NaN falls back to 5', (() => { const s2 = {}; V.applyWanted(s2, 'x'); return s2.wanted.level === 5; })());
  check('viceFiveStar template exists', !!V.TEMPLATES.viceFiveStar);
  const wState = V.state;
  const wApplied = V.applyTemplate(wState, 'viceFiveStar');
  V.redraw();
  check('applyTemplate viceFiveStar returns true', wApplied === true);
  check('template sets keyart layout', wState.layout === 'keyart', wState.layout);
  check('template sets skyline backdrop', wState.backdrop === 'skyline', wState.backdrop);
  check('template sets sunset grade', wState.grade === 'sunset', wState.grade);
  check('template turns wanted on at level 5', V.wantedActive(wState) === true && wState.wanted.level === 5, JSON.stringify(wState.wanted));
  check('template title is FIVE STAR', wState.title === 'FIVE STAR', wState.title);
  check('templateMatches viceFiveStar', V.templateMatches(wState, 'viceFiveStar') === true);
  check('templateMatches rejects wrong level', V.templateMatches({ ...wState, wanted: { on: true, level: 3 } }, 'viceFiveStar') === false);
  check('describeStateChange names a wanted change', (() => {
    const a = { wanted: { on: false, level: 5 } };
    const b = { wanted: { on: true, level: 5 } };
    return V.describeStateChange(a, b) === 'Wanted';
  })());
  check('snapshot/restore keeps wanted', (() => {
    const snap = JSON.parse(JSON.stringify(wState.wanted));
    wState.wanted.on = false;
    wState.wanted = JSON.parse(JSON.stringify(snap));
    return V.wantedActive(wState) === true && wState.wanted.level === 5;
  })());
  const w5c1 = document.createElement('canvas'); w5c1.width = 480; w5c1.height = 270;
  const w5c2 = document.createElement('canvas'); w5c2.width = 480; w5c2.height = 270;
  const w5c3 = document.createElement('canvas'); w5c3.width = 480; w5c3.height = 270;
  const w5c4 = document.createElement('canvas'); w5c4.width = 480; w5c4.height = 270;
  const w5c5 = document.createElement('canvas'); w5c5.width = 480; w5c5.height = 270;
  V.drawCover(w5c1, { ...wState, wanted: { on: false, level: 5 } });
  V.drawCover(w5c2, { ...wState });
  V.drawCover(w5c3, { ...wState, wanted: { on: true, level: 1 } });
  V.drawCover(w5c4, { ...wState });
  V.drawCover(w5c5, { ...wState, wanted: { on: true, level: 0 } });
  check('drawCover keyart with five star runs', sumPixels(w5c2) > 0, sumPixels(w5c2));
  check('five star changes the rendered pixels', sumPixels(w5c1) !== sumPixels(w5c2), sumPixels(w5c1) + ' vs ' + sumPixels(w5c2));
  check('level 1 differs from level 5', sumPixels(w5c2) !== sumPixels(w5c3), sumPixels(w5c2) + ' vs ' + sumPixels(w5c3));
  check('clean differs from five star', sumPixels(w5c2) !== sumPixels(w5c5), sumPixels(w5c2) + ' vs ' + sumPixels(w5c5));
  check('five star render is deterministic', sumPixels(w5c2) === sumPixels(w5c4), sumPixels(w5c2) + ' vs ' + sumPixels(w5c4));
  const w5blob = await V.exportCover({ ...wState }, 540, 540);
  check('exportCover five star returns a PNG blob', w5blob && w5blob.size > 10000, w5blob && w5blob.size);
  check('fs-wanted fieldset exists', !!$('fs-wanted'));
  check('wanted controls exist', !!($('wantedOn') && $('wantedLevel') && $('wantedLevelVal') && document.querySelectorAll('.wantedPreset').length === 6));
  check('wantedOn reflects the template', $('wantedOn').checked === true);
  check('wanted readout shows WANTED • LEVEL 5 • FIVE STAR', $('wantedLevelVal').textContent.includes('WANTED') && $('wantedLevelVal').textContent.includes('LEVEL 5') && $('wantedLevelVal').textContent.includes('FIVE STAR'), $('wantedLevelVal').textContent);
  $('wantedLevel').value = '2';
  $('wantedLevel').dispatchEvent(new Event('input'));
  check('UI level change reaches state', V.state.wanted.level === 2, V.state.wanted.level);
  check('UI readout follows the level', $('wantedLevelVal').textContent.includes('LEVEL 2') && $('wantedLevelVal').textContent.includes('ON THE RADAR'), $('wantedLevelVal').textContent);
  document.querySelector('.wantedPreset[data-wanted="4"]').click();
  check('UI preset sets Most Wanted', V.state.wanted.level === 4 && V.wantedActive(V.state) === true, JSON.stringify(V.state.wanted));
  check('UI preset re-syncs the readout', $('wantedLevelVal').textContent.includes('MOST WANTED'), $('wantedLevelVal').textContent);
  $('wantedOn').click();
  check('UI uncheck turns wanted off', V.wantedActive(V.state) === false);
  $('wantedOn').click();
  check('UI re-check turns wanted on', V.wantedActive(V.state) === true);


  // --- v30 Vice Radio (Radio dial: 5 stations + volume + EQ strip + badge + NOW PLAYING chip) ---
  check('default radio is off, neonwave 80%', V.radioActive(V.state) === false && V.state.radio.station === 'neonwave' && V.state.radio.volume === 0.8, JSON.stringify(V.state.radio));
  check('defaultRadio values', (() => { const r = V.defaultRadio(); return r.on === false && r.station === 'neonwave' && r.volume === 0.8; })());
  check('5 radio stations', Object.keys(V.RADIO_STATIONS).length === 5, Object.keys(V.RADIO_STATIONS).join(','));
  check('5 radio presets', V.RADIO_PRESETS.length === 5, V.RADIO_PRESETS.map((p) => p.label).join(','));
  check('radio presets cover all stations', V.RADIO_PRESETS.map((p) => p.station).join(',') === 'neonwave,sunsetfm,vicenights,palmstatic,oceandrive', V.RADIO_PRESETS.map((p) => p.station).join(','));
  check('clampRadioVolume clamps below 0', V.clampRadioVolume(-0.5) === 0, V.clampRadioVolume(-0.5));
  check('clampRadioVolume clamps above 1', V.clampRadioVolume(1.5) === 1, V.clampRadioVolume(1.5));
  check('clampRadioVolume snaps to hundredths', V.clampRadioVolume(0.678) === 0.68, V.clampRadioVolume(0.678));
  check('clampRadioVolume NaN defaults to 0.8', V.clampRadioVolume('x') === 0.8, V.clampRadioVolume('x'));
  check('clampRadioStation unknown falls back to neonwave', V.clampRadioStation('nowhere') === 'neonwave', V.clampRadioStation('nowhere'));
  check('radioAt labels + freqs', V.radioAt('neonwave', 0.8).label === 'Neon Wave' && V.radioAt('neonwave', 0.8).freq === '103.5 FM' && V.radioAt('sunsetfm', 0.8).label === 'Sunset FM' && V.radioAt('vicenights', 0.8).freq === '99.9 FM' && V.radioAt('palmstatic', 0.8).label === 'Palm Static' && V.radioAt('oceandrive', 0.8).freq === '620 AM', ['neonwave', 'sunsetfm', 'vicenights', 'palmstatic', 'oceandrive'].map((k) => V.radioAt(k, 0.8).label).join(','));
  check('radioAt tracks differ per station', V.radioAt('neonwave', 0.8).track === 'MIDNIGHT CRUISE' && V.radioAt('sunsetfm', 0.8).track === 'GOLDEN HOUR DRIVE' && V.radioAt('vicenights', 0.8).track === 'NEON HEARTS' && V.radioAt('palmstatic', 0.8).track === 'TAPE HISS SERENADE' && V.radioAt('oceandrive', 0.8).track === 'TIDE RUNNER', ['neonwave', 'sunsetfm', 'vicenights', 'palmstatic', 'oceandrive'].map((k) => V.radioAt(k, 0.8).track).join(' / '));
  check('radioAt tint scales with volume', V.radioAt('neonwave', 0).tintAlpha === 0 && V.radioAt('neonwave', 0.5).tintAlpha < V.radioAt('neonwave', 1).tintAlpha && V.radioAt('neonwave', 1).tintAlpha === 0.14, V.radioAt('neonwave', 0).tintAlpha + ' / ' + V.radioAt('neonwave', 0.5).tintAlpha + ' / ' + V.radioAt('neonwave', 1).tintAlpha);
  check('radioAt deterministic', JSON.stringify(V.radioAt('neonwave', 0.8)) === JSON.stringify(V.radioAt('neonwave', 0.8)));
  check('radioBars has 28 bars in [0,1]', V.radioBars('neonwave').length === 28 && V.radioBars('neonwave').every((b) => b >= 0 && b <= 1), V.radioBars('neonwave').length);
  check('radioBars differ per station', JSON.stringify(V.radioBars('neonwave')) !== JSON.stringify(V.radioBars('vicenights')));
  check('radioBars deterministic', JSON.stringify(V.radioBars('sunsetfm')) === JSON.stringify(V.radioBars('sunsetfm')));
  check('applyRadio turns radio on at the station', (() => { const s2 = {}; V.applyRadio(s2, 'vicenights', 0.5); return V.radioActive(s2) === true && s2.radio.station === 'vicenights' && s2.radio.volume === 0.5; })());
  check('applyRadio NaN volume falls back to 0.8', (() => { const s2 = {}; V.applyRadio(s2, 'oceandrive', 'x'); return s2.radio.station === 'oceandrive' && s2.radio.volume === 0.8; })());
  check('viceRadio template exists', !!V.TEMPLATES.viceRadio);
  const rState = V.state;
  const rApplied = V.applyTemplate(rState, 'viceRadio');
  V.redraw();
  check('applyTemplate viceRadio returns true', rApplied === true);
  check('template sets keyart layout', rState.layout === 'keyart', rState.layout);
  check('template sets skyline backdrop', rState.backdrop === 'skyline', rState.backdrop);
  check('template sets sunset grade', rState.grade === 'sunset', rState.grade);
  check('template turns radio on at neonwave 80%', V.radioActive(rState) === true && rState.radio.station === 'neonwave' && rState.radio.volume === 0.8, JSON.stringify(rState.radio));
  check('template title is ON AIR', rState.title === 'ON AIR', rState.title);
  check('templateMatches viceRadio', V.templateMatches(rState, 'viceRadio') === true);
  check('templateMatches rejects wrong station', V.templateMatches({ ...rState, radio: { on: true, station: 'vicenights', volume: 0.8 } }, 'viceRadio') === false);
  check('describeStateChange names a radio change', (() => {
    const a = { radio: { on: false, station: 'neonwave', volume: 0.8 } };
    const b = { radio: { on: true, station: 'neonwave', volume: 0.8 } };
    return V.describeStateChange(a, b) === 'Radio';
  })());
  check('snapshot/restore keeps radio', (() => {
    const snap = JSON.parse(JSON.stringify(rState.radio));
    rState.radio.on = false;
    rState.radio = JSON.parse(JSON.stringify(snap));
    return V.radioActive(rState) === true && rState.radio.station === 'neonwave' && rState.radio.volume === 0.8;
  })());
  const r30c1 = document.createElement('canvas'); r30c1.width = 480; r30c1.height = 270;
  const r30c2 = document.createElement('canvas'); r30c2.width = 480; r30c2.height = 270;
  const r30c3 = document.createElement('canvas'); r30c3.width = 480; r30c3.height = 270;
  const r30c4 = document.createElement('canvas'); r30c4.width = 480; r30c4.height = 270;
  const r30c5 = document.createElement('canvas'); r30c5.width = 480; r30c5.height = 270;
  V.drawCover(r30c1, { ...rState, radio: { on: false, station: 'neonwave', volume: 0.8 } });
  V.drawCover(r30c2, { ...rState });
  V.drawCover(r30c3, { ...rState, radio: { on: true, station: 'vicenights', volume: 0.8 } });
  V.drawCover(r30c4, { ...rState });
  V.drawCover(r30c5, { ...rState, radio: { on: true, station: 'neonwave', volume: 0.2 } });
  check('drawCover keyart with radio runs', sumPixels(r30c2) > 0, sumPixels(r30c2));
  check('radio changes the rendered pixels', sumPixels(r30c1) !== sumPixels(r30c2), sumPixels(r30c1) + ' vs ' + sumPixels(r30c2));
  check('vicenights differs from neonwave', sumPixels(r30c2) !== sumPixels(r30c3), sumPixels(r30c2) + ' vs ' + sumPixels(r30c3));
  check('volume 0.2 differs from 0.8', sumPixels(r30c2) !== sumPixels(r30c5), sumPixels(r30c2) + ' vs ' + sumPixels(r30c5));
  check('radio render is deterministic', sumPixels(r30c2) === sumPixels(r30c4), sumPixels(r30c2) + ' vs ' + sumPixels(r30c4));
  const r30blob = await V.exportCover({ ...rState }, 540, 540);
  check('exportCover radio returns a PNG blob', r30blob && r30blob.size > 10000, r30blob && r30blob.size);
  check('fs-radio fieldset exists', !!$('fs-radio'));
  check('radio controls exist', !!($('radioOn') && $('radioVol') && $('radioVolVal') && document.querySelectorAll('.radioPreset').length === 5));
  check('radioOn reflects the template', $('radioOn').checked === true);
  check('radio readout shows NEON WAVE • 80%', $('radioVolVal').textContent.includes('NEON WAVE') && $('radioVolVal').textContent.includes('80%'), $('radioVolVal').textContent);
  $('radioVol').value = '30';
  $('radioVol').dispatchEvent(new Event('input'));
  check('UI volume change reaches state', V.state.radio.volume === 0.3, V.state.radio.volume);
  check('UI readout follows the volume', $('radioVolVal').textContent.includes('NEON WAVE') && $('radioVolVal').textContent.includes('30%'), $('radioVolVal').textContent);
  document.querySelector('.radioPreset[data-station="vicenights"]').click();
  check('UI preset retunes to Vice Nights', V.state.radio.station === 'vicenights' && V.radioActive(V.state) === true, JSON.stringify(V.state.radio));
  check('UI preset re-syncs the readout', $('radioVolVal').textContent.includes('VICE NIGHTS'), $('radioVolVal').textContent);
  $('radioOn').click();
  check('UI uncheck turns radio off', V.radioActive(V.state) === false);
  $('radioOn').click();
  check('UI re-check turns radio on', V.radioActive(V.state) === true);

  // --- v31 Vice Map (Map dial: 5 styles + zoom + radar + coastline + district highlight + blip + MAP chip) ---
  check('default map is off, radar 80%', V.mapActive(V.state) === false && V.state.map.style === 'radar' && V.state.map.zoom === 0.8, JSON.stringify(V.state.map));
  check('defaultMap values', (() => { const m = V.defaultMap(); return m.on === false && m.style === 'radar' && m.zoom === 0.8; })());
  check('5 map styles', Object.keys(V.MAP_STYLES).length === 5, Object.keys(V.MAP_STYLES).join(','));
  check('5 map presets', V.MAP_PRESETS.length === 5, V.MAP_PRESETS.map((p) => p.label).join(','));
  check('map presets cover all styles', V.MAP_PRESETS.map((p) => p.style).join(',') === 'radar,street,neon,satellite,heist', V.MAP_PRESETS.map((p) => p.style).join(','));
  check('clampMapZoom clamps below 0', V.clampMapZoom(-0.5) === 0, V.clampMapZoom(-0.5));
  check('clampMapZoom clamps above 1', V.clampMapZoom(1.5) === 1, V.clampMapZoom(1.5));
  check('clampMapZoom snaps to hundredths', V.clampMapZoom(0.678) === 0.68, V.clampMapZoom(0.678));
  check('clampMapZoom NaN defaults to 0.8', V.clampMapZoom('x') === 0.8, V.clampMapZoom('x'));
  check('clampMapStyle unknown falls back to radar', V.clampMapStyle('nowhere') === 'radar', V.clampMapStyle('nowhere'));
  check('mapAt labels', V.mapAt('radar', 0.8).label === 'RADAR' && V.mapAt('street', 0.8).label === 'STREET' && V.mapAt('neon', 0.8).label === 'NEON' && V.mapAt('satellite', 0.8).label === 'SATELLITE' && V.mapAt('heist', 0.8).label === 'HEIST', ['radar', 'street', 'neon', 'satellite', 'heist'].map((k) => V.mapAt(k, 0.8).label).join(','));
  check('mapAt diameter grows with zoom', V.mapAt('radar', 0).diameter === 0.2 && V.mapAt('radar', 0.5).diameter < V.mapAt('radar', 1).diameter && V.mapAt('radar', 1).diameter === 0.32, V.mapAt('radar', 0).diameter + ' / ' + V.mapAt('radar', 0.5).diameter + ' / ' + V.mapAt('radar', 1).diameter);
  check('mapAt streetCount grows with zoom', V.mapAt('radar', 0).streetCount === 8 && V.mapAt('radar', 1).streetCount === 18, V.mapAt('radar', 0).streetCount + ' / ' + V.mapAt('radar', 1).streetCount);
  check('mapAt deterministic', JSON.stringify(V.mapAt('neon', 0.8)) === JSON.stringify(V.mapAt('neon', 0.8)));
  check('mapStreets count matches zoom', V.mapStreets('radar', 0.8).h.length === 16 && V.mapStreets('radar', 0.8).v.length === 16, V.mapStreets('radar', 0.8).h.length + '/' + V.mapStreets('radar', 0.8).v.length);
  check('mapStreets lines are in [0,1] with majors', V.mapStreets('radar', 0.8).h.every((l) => l.at >= 0 && l.at <= 1) && V.mapStreets('radar', 0.8).h.filter((l) => l.major).length > 0, V.mapStreets('radar', 0.8).h.filter((l) => l.major).length);
  check('mapStreets differ per style', JSON.stringify(V.mapStreets('radar', 0.8)) !== JSON.stringify(V.mapStreets('neon', 0.8)));
  check('mapStreets deterministic', JSON.stringify(V.mapStreets('street', 0.8)) === JSON.stringify(V.mapStreets('street', 0.8)));
  check('mapDistrict follows the district dial', (() => { const s2 = { district: { on: true, district: 'havana', intensity: 0.8 } }; const md = V.mapDistrict(s2); return md.key === 'havana' && md.label === 'LITTLE HAVANA' && md.accent === '#ffb400'; })());
  check('mapDistrict defaults to Ocean Drive', (() => { const md = V.mapDistrict({}); return md.key === 'ocean' && md.label === 'OCEAN DRIVE'; })());
  check('applyMap turns map on at the style', (() => { const s2 = {}; V.applyMap(s2, 'neon', 0.5); return V.mapActive(s2) === true && s2.map.style === 'neon' && s2.map.zoom === 0.5; })());
  check('applyMap NaN zoom falls back to 0.8', (() => { const s2 = {}; V.applyMap(s2, 'heist', 'x'); return s2.map.style === 'heist' && s2.map.zoom === 0.8; })());
  check('viceMap template exists', !!V.TEMPLATES.viceMap);
  const mState = V.state;
  const mApplied = V.applyTemplate(mState, 'viceMap');
  V.redraw();
  check('applyTemplate viceMap returns true', mApplied === true);
  check('template sets keyart layout', mState.layout === 'keyart', mState.layout);
  check('template sets skyline backdrop', mState.backdrop === 'skyline', mState.backdrop);
  check('template sets sunset grade', mState.grade === 'sunset', mState.grade);
  check('template turns map on at radar 80%', V.mapActive(mState) === true && mState.map.style === 'radar' && mState.map.zoom === 0.8, JSON.stringify(mState.map));
  check('template title is YOU ARE HERE', mState.title === 'YOU ARE HERE', mState.title);
  check('templateMatches viceMap', V.templateMatches(mState, 'viceMap') === true);
  check('templateMatches rejects wrong style', V.templateMatches({ ...mState, map: { on: true, style: 'neon', zoom: 0.8 } }, 'viceMap') === false);
  check('describeStateChange names a map change', (() => {
    const a = { map: { on: false, style: 'radar', zoom: 0.8 } };
    const b = { map: { on: true, style: 'radar', zoom: 0.8 } };
    return V.describeStateChange(a, b) === 'Map';
  })());
  check('snapshot/restore keeps map', (() => {
    const snap = JSON.parse(JSON.stringify(mState.map));
    mState.map.on = false;
    mState.map = JSON.parse(JSON.stringify(snap));
    return V.mapActive(mState) === true && mState.map.style === 'radar' && mState.map.zoom === 0.8;
  })());
  const m31c1 = document.createElement('canvas'); m31c1.width = 480; m31c1.height = 270;
  const m31c2 = document.createElement('canvas'); m31c2.width = 480; m31c2.height = 270;
  const m31c3 = document.createElement('canvas'); m31c3.width = 480; m31c3.height = 270;
  const m31c4 = document.createElement('canvas'); m31c4.width = 480; m31c4.height = 270;
  const m31c5 = document.createElement('canvas'); m31c5.width = 480; m31c5.height = 270;
  V.drawCover(m31c1, { ...mState, map: { on: false, style: 'radar', zoom: 0.8 } });
  V.drawCover(m31c2, { ...mState });
  V.drawCover(m31c3, { ...mState, map: { on: true, style: 'neon', zoom: 0.8 } });
  V.drawCover(m31c4, { ...mState });
  V.drawCover(m31c5, { ...mState, map: { on: true, style: 'radar', zoom: 0.2 } });
  check('drawCover keyart with map runs', sumPixels(m31c2) > 0, sumPixels(m31c2));
  check('map changes the rendered pixels', sumPixels(m31c1) !== sumPixels(m31c2), sumPixels(m31c1) + ' vs ' + sumPixels(m31c2));
  check('neon differs from radar', sumPixels(m31c2) !== sumPixels(m31c3), sumPixels(m31c2) + ' vs ' + sumPixels(m31c3));
  check('zoom 0.2 differs from 0.8', sumPixels(m31c2) !== sumPixels(m31c5), sumPixels(m31c2) + ' vs ' + sumPixels(m31c5));
  check('map render is deterministic', sumPixels(m31c2) === sumPixels(m31c4), sumPixels(m31c2) + ' vs ' + sumPixels(m31c4));
  const m31blob = await V.exportCover({ ...mState }, 540, 540);
  check('exportCover map returns a PNG blob', m31blob && m31blob.size > 10000, m31blob && m31blob.size);
  check('fs-map fieldset exists', !!$('fs-map'));
  check('map controls exist', !!($('mapOn') && $('mapZoom') && $('mapZoomVal') && document.querySelectorAll('.mapPreset').length === 5));
  check('mapOn reflects the template', $('mapOn').checked === true);
  check('map readout shows RADAR • 80%', $('mapZoomVal').textContent.includes('RADAR') && $('mapZoomVal').textContent.includes('80%'), $('mapZoomVal').textContent);
  $('mapZoom').value = '30';
  $('mapZoom').dispatchEvent(new Event('input'));
  check('UI zoom change reaches state', V.state.map.zoom === 0.3, V.state.map.zoom);
  check('UI readout follows the zoom', $('mapZoomVal').textContent.includes('RADAR') && $('mapZoomVal').textContent.includes('30%'), $('mapZoomVal').textContent);
  document.querySelector('.mapPreset[data-style="neon"]').click();
  check('UI preset restyles to Neon', V.state.map.style === 'neon' && V.mapActive(V.state) === true, JSON.stringify(V.state.map));
  check('UI preset re-syncs the readout', $('mapZoomVal').textContent.includes('NEON'), $('mapZoomVal').textContent);
  $('mapOn').click();
  check('UI uncheck turns map off', V.mapActive(V.state) === false);
  $('mapOn').click();
  check('UI re-check turns map on', V.mapActive(V.state) === true);

  // --- v32 Vice Phone (Phone dial: 5 screens + size + handset + status bar + notification pill + PHONE chip) ---
  check('default phone is off, messages 80%', V.phoneActive(V.state) === false && V.state.phone.screen === 'messages' && V.state.phone.size === 0.8, JSON.stringify(V.state.phone));
  check('defaultPhone values', (() => { const p = V.defaultPhone(); return p.on === false && p.screen === 'messages' && p.size === 0.8; })());
  check('5 phone screens', Object.keys(V.PHONE_SCREENS).length === 5, Object.keys(V.PHONE_SCREENS).join(','));
  check('5 phone presets', V.PHONE_PRESETS.length === 5, V.PHONE_PRESETS.map((p) => p.label).join(','));
  check('phone presets cover all screens', V.PHONE_PRESETS.map((p) => p.screen).join(',') === 'messages,camera,social,calls,home', V.PHONE_PRESETS.map((p) => p.screen).join(','));
  check('clampPhoneSize clamps below 0', V.clampPhoneSize(-0.5) === 0, V.clampPhoneSize(-0.5));
  check('clampPhoneSize clamps above 1', V.clampPhoneSize(1.5) === 1, V.clampPhoneSize(1.5));
  check('clampPhoneSize snaps to hundredths', V.clampPhoneSize(0.678) === 0.68, V.clampPhoneSize(0.678));
  check('clampPhoneSize NaN defaults to 0.8', V.clampPhoneSize('x') === 0.8, V.clampPhoneSize('x'));
  check('clampPhoneScreen unknown falls back to messages', V.clampPhoneScreen('nowhere') === 'messages', V.clampPhoneScreen('nowhere'));
  check('phoneAt labels', V.phoneAt('messages', 0.8).label === 'MESSAGES' && V.phoneAt('camera', 0.8).label === 'CAMERA' && V.phoneAt('social', 0.8).label === 'SOCIAL' && V.phoneAt('calls', 0.8).label === 'CALLS' && V.phoneAt('home', 0.8).label === 'HOME', ['messages', 'camera', 'social', 'calls', 'home'].map((k) => V.phoneAt(k, 0.8).label).join(','));
  check('phoneAt height grows with size', V.phoneAt('messages', 0).height === 0.26 && V.phoneAt('messages', 0.5).height < V.phoneAt('messages', 1).height && V.phoneAt('messages', 1).height === 0.46, V.phoneAt('messages', 0).height + ' / ' + V.phoneAt('messages', 0.5).height + ' / ' + V.phoneAt('messages', 1).height);
  check('phoneAt deterministic', JSON.stringify(V.phoneAt('social', 0.8)) === JSON.stringify(V.phoneAt('social', 0.8)));
  check('phoneClock defaults to 21:06', V.phoneClock({}) === '21:06', V.phoneClock({}));
  check('phoneClock follows the clock dial', V.phoneClock({ timeOfDay: { on: true, hour: 18.5 } }) === '18:30', V.phoneClock({ timeOfDay: { on: true, hour: 18.5 } }));
  check('phoneClock ignores the clock dial when off', V.phoneClock({ timeOfDay: { on: false, hour: 18.5 } }) === '21:06', V.phoneClock({ timeOfDay: { on: false, hour: 18.5 } }));
  check('applyPhone turns phone on at the screen', (() => { const s2 = {}; V.applyPhone(s2, 'calls', 0.5); return V.phoneActive(s2) === true && s2.phone.screen === 'calls' && s2.phone.size === 0.5; })());
  check('applyPhone NaN size falls back to 0.8', (() => { const s2 = {}; V.applyPhone(s2, 'home', 'x'); return s2.phone.screen === 'home' && s2.phone.size === 0.8; })());
  check('vicePhone template exists', !!V.TEMPLATES.vicePhone);
  const pState = V.state;
  const pApplied = V.applyTemplate(pState, 'vicePhone');
  V.redraw();
  check('applyTemplate vicePhone returns true', pApplied === true);
  check('template sets keyart layout', pState.layout === 'keyart', pState.layout);
  check('template sets skyline backdrop', pState.backdrop === 'skyline', pState.backdrop);
  check('template sets sunset grade', pState.grade === 'sunset', pState.grade);
  check('template turns phone on at messages 80%', V.phoneActive(pState) === true && pState.phone.screen === 'messages' && pState.phone.size === 0.8, JSON.stringify(pState.phone));
  check('template title is PICK UP', pState.title === 'PICK UP', pState.title);
  check('templateMatches vicePhone', V.templateMatches(pState, 'vicePhone') === true);
  check('templateMatches rejects wrong screen', V.templateMatches({ ...pState, phone: { on: true, screen: 'camera', size: 0.8 } }, 'vicePhone') === false);
  check('describeStateChange names a phone change', (() => {
    const a = { phone: { on: false, screen: 'messages', size: 0.8 } };
    const b = { phone: { on: true, screen: 'messages', size: 0.8 } };
    return V.describeStateChange(a, b) === 'Phone';
  })());
  check('snapshot/restore keeps phone', (() => {
    const snap = JSON.parse(JSON.stringify(pState.phone));
    pState.phone.on = false;
    pState.phone = JSON.parse(JSON.stringify(snap));
    return V.phoneActive(pState) === true && pState.phone.screen === 'messages' && pState.phone.size === 0.8;
  })());
  const p32c1 = document.createElement('canvas'); p32c1.width = 480; p32c1.height = 270;
  const p32c2 = document.createElement('canvas'); p32c2.width = 480; p32c2.height = 270;
  const p32c3 = document.createElement('canvas'); p32c3.width = 480; p32c3.height = 270;
  const p32c4 = document.createElement('canvas'); p32c4.width = 480; p32c4.height = 270;
  const p32c5 = document.createElement('canvas'); p32c5.width = 480; p32c5.height = 270;
  V.drawCover(p32c1, { ...pState, phone: { on: false, screen: 'messages', size: 0.8 } });
  V.drawCover(p32c2, { ...pState });
  V.drawCover(p32c3, { ...pState, phone: { on: true, screen: 'calls', size: 0.8 } });
  V.drawCover(p32c4, { ...pState });
  V.drawCover(p32c5, { ...pState, phone: { on: true, screen: 'messages', size: 0.2 } });
  check('drawCover keyart with phone runs', sumPixels(p32c2) > 0, sumPixels(p32c2));
  check('phone changes the rendered pixels', sumPixels(p32c1) !== sumPixels(p32c2), sumPixels(p32c1) + ' vs ' + sumPixels(p32c2));
  check('calls differs from messages', sumPixels(p32c2) !== sumPixels(p32c3), sumPixels(p32c2) + ' vs ' + sumPixels(p32c3));
  check('size 0.2 differs from 0.8', sumPixels(p32c2) !== sumPixels(p32c5), sumPixels(p32c2) + ' vs ' + sumPixels(p32c5));
  check('phone render is deterministic', sumPixels(p32c2) === sumPixels(p32c4), sumPixels(p32c2) + ' vs ' + sumPixels(p32c4));
  const p32blob = await V.exportCover({ ...pState }, 540, 540);
  check('exportCover phone returns a PNG blob', p32blob && p32blob.size > 10000, p32blob && p32blob.size);
  check('fs-phone fieldset exists', !!$('fs-phone'));
  check('phone controls exist', !!($('phoneOn') && $('phoneSize') && $('phoneSizeVal') && document.querySelectorAll('.phonePreset').length === 5));
  check('phoneOn reflects the template', $('phoneOn').checked === true);

  // --- v33 Vice Ticker (Ticker dial: 5 stories + crawl speed + ticker band + LIVE bug + headline crawl + TICKER chip) ---
  check('default ticker is off, heist 80%', V.tickerActive(V.state) === false && V.state.ticker.story === 'heist' && V.state.ticker.speed === 0.8, JSON.stringify(V.state.ticker));
  check('defaultTicker values', (() => { const t = V.defaultTicker(); return t.on === false && t.story === 'heist' && t.speed === 0.8; })());
  check('5 ticker stories', Object.keys(V.TICKER_STORIES).length === 5, Object.keys(V.TICKER_STORIES).join(','));
  check('5 ticker presets', V.TICKER_PRESETS.length === 5, V.TICKER_PRESETS.map((p) => p.label).join(','));
  check('ticker presets cover all stories', V.TICKER_PRESETS.map((p) => p.story).join(',') === 'heist,chase,storm,concert,lotto', V.TICKER_PRESETS.map((p) => p.story).join(','));
  check('clampTickerSpeed clamps below 0', V.clampTickerSpeed(-0.5) === 0, V.clampTickerSpeed(-0.5));
  check('clampTickerSpeed clamps above 1', V.clampTickerSpeed(1.5) === 1, V.clampTickerSpeed(1.5));
  check('clampTickerSpeed snaps to hundredths', V.clampTickerSpeed(0.678) === 0.68, V.clampTickerSpeed(0.678));
  check('clampTickerSpeed NaN defaults to 0.8', V.clampTickerSpeed('x') === 0.8, V.clampTickerSpeed('x'));
  check('clampTickerStory unknown falls back to heist', V.clampTickerStory('nowhere') === 'heist', V.clampTickerStory('nowhere'));
  check('tickerAt labels', V.tickerAt('heist', 0.8).label === 'BREAKING' && V.tickerAt('chase', 0.8).label === 'CHASE' && V.tickerAt('storm', 0.8).label === 'STORM' && V.tickerAt('concert', 0.8).label === 'TONIGHT' && V.tickerAt('lotto', 0.8).label === 'LOTTO', ['heist', 'chase', 'storm', 'concert', 'lotto'].map((k) => V.tickerAt(k, 0.8).label).join(','));
  check('tickerAt headlines are original (no Rockstar brand)', ['heist', 'chase', 'storm', 'concert', 'lotto'].every((k) => !/rockstar|weazel|gta vi/i.test(V.tickerAt(k, 0.8).headline)), ['heist', 'chase', 'storm', 'concert', 'lotto'].map((k) => V.tickerAt(k, 0.8).headline).join(' | '));
  check('tickerAt offset follows speed', V.tickerAt('heist', 0).offset === 0 && V.tickerAt('heist', 0.5).offset === 0.5 && V.tickerAt('heist', 1).offset === 1, V.tickerAt('heist', 0).offset + ' / ' + V.tickerAt('heist', 0.5).offset + ' / ' + V.tickerAt('heist', 1).offset);
  check('tickerAt deterministic', JSON.stringify(V.tickerAt('storm', 0.8)) === JSON.stringify(V.tickerAt('storm', 0.8)));
  check('applyTicker turns ticker on at the story', (() => { const s2 = {}; V.applyTicker(s2, 'chase', 0.5); return V.tickerActive(s2) === true && s2.ticker.story === 'chase' && s2.ticker.speed === 0.5; })());
  check('applyTicker NaN speed falls back to 0.8', (() => { const s2 = {}; V.applyTicker(s2, 'lotto', 'x'); return s2.ticker.story === 'lotto' && s2.ticker.speed === 0.8; })());
  check('viceTicker template exists', !!V.TEMPLATES.viceTicker);
  const tState = V.state;
  const tApplied = V.applyTemplate(tState, 'viceTicker');
  V.redraw();
  check('applyTemplate viceTicker returns true', tApplied === true);
  check('template sets keyart layout', tState.layout === 'keyart', tState.layout);
  check('template sets skyline backdrop', tState.backdrop === 'skyline', tState.backdrop);
  check('template sets sunset grade', tState.grade === 'sunset', tState.grade);
  check('template turns ticker on at heist 80%', V.tickerActive(tState) === true && tState.ticker.story === 'heist' && tState.ticker.speed === 0.8, JSON.stringify(tState.ticker));
  check('template title is BREAKING', tState.title === 'BREAKING', tState.title);
  check('templateMatches viceTicker', V.templateMatches(tState, 'viceTicker') === true);
  check('templateMatches rejects wrong story', V.templateMatches({ ...tState, ticker: { on: true, story: 'chase', speed: 0.8 } }, 'viceTicker') === false);
  check('describeStateChange names a ticker change', (() => {
    const a = { ticker: { on: false, story: 'heist', speed: 0.8 } };
    const b = { ticker: { on: true, story: 'heist', speed: 0.8 } };
    return V.describeStateChange(a, b) === 'Ticker';
  })());
  check('snapshot/restore keeps ticker', (() => {
    const snap = JSON.parse(JSON.stringify(tState.ticker));
    tState.ticker.on = false;
    tState.ticker = JSON.parse(JSON.stringify(snap));
    return V.tickerActive(tState) === true && tState.ticker.story === 'heist' && tState.ticker.speed === 0.8;
  })());
  const t33c1 = document.createElement('canvas'); t33c1.width = 480; t33c1.height = 270;
  const t33c2 = document.createElement('canvas'); t33c2.width = 480; t33c2.height = 270;
  const t33c3 = document.createElement('canvas'); t33c3.width = 480; t33c3.height = 270;
  const t33c4 = document.createElement('canvas'); t33c4.width = 480; t33c4.height = 270;
  const t33c5 = document.createElement('canvas'); t33c5.width = 480; t33c5.height = 270;
  V.drawCover(t33c1, { ...tState, ticker: { on: false, story: 'heist', speed: 0.8 } });
  V.drawCover(t33c2, { ...tState });
  V.drawCover(t33c3, { ...tState, ticker: { on: true, story: 'chase', speed: 0.8 } });
  V.drawCover(t33c4, { ...tState });
  V.drawCover(t33c5, { ...tState, ticker: { on: true, story: 'heist', speed: 0.2 } });
  check('drawCover keyart with ticker runs', sumPixels(t33c2) > 0, sumPixels(t33c2));
  check('ticker changes the rendered pixels', sumPixels(t33c1) !== sumPixels(t33c2), sumPixels(t33c1) + ' vs ' + sumPixels(t33c2));
  check('chase differs from heist', sumPixels(t33c2) !== sumPixels(t33c3), sumPixels(t33c2) + ' vs ' + sumPixels(t33c3));
  check('speed 0.2 differs from 0.8', sumPixels(t33c2) !== sumPixels(t33c5), sumPixels(t33c2) + ' vs ' + sumPixels(t33c5));
  check('ticker render is deterministic', sumPixels(t33c2) === sumPixels(t33c4), sumPixels(t33c2) + ' vs ' + sumPixels(t33c4));
  const t33blob = await V.exportCover({ ...tState }, 540, 540);
  check('exportCover ticker returns a PNG blob', t33blob && t33blob.size > 10000, t33blob && t33blob.size);
  check('fs-ticker fieldset exists', !!$('fs-ticker'));
  check('ticker controls exist', !!($('tickerOn') && $('tickerSpeed') && $('tickerSpeedVal') && document.querySelectorAll('.tickerPreset').length === 5));
  check('tickerOn reflects the template', $('tickerOn').checked === true);
  check('UI readout follows the speed', $('tickerSpeedVal').textContent.includes('BREAKING') && $('tickerSpeedVal').textContent.includes('80%'), $('tickerSpeedVal').textContent);
  document.querySelector('.tickerPreset[data-story="storm"]').click();
  check('UI preset restyles to Storm', V.state.ticker.story === 'storm' && V.tickerActive(V.state) === true, JSON.stringify(V.state.ticker));
  check('UI preset re-syncs the readout', $('tickerSpeedVal').textContent.includes('STORM'), $('tickerSpeedVal').textContent);
  $('tickerOn').click();
  check('UI uncheck turns ticker off', V.tickerActive(V.state) === false);
  $('tickerOn').click();
  check('UI re-check turns ticker on', V.tickerActive(V.state) === true);
  check('phone readout shows MESSAGES • 80%', $('phoneSizeVal').textContent.includes('MESSAGES') && $('phoneSizeVal').textContent.includes('80%'), $('phoneSizeVal').textContent);
  $('phoneSize').value = '30';
  $('phoneSize').dispatchEvent(new Event('input'));
  check('UI size change reaches state', V.state.phone.size === 0.3, V.state.phone.size);
  check('UI readout follows the size', $('phoneSizeVal').textContent.includes('MESSAGES') && $('phoneSizeVal').textContent.includes('30%'), $('phoneSizeVal').textContent);
  document.querySelector('.phonePreset[data-screen="calls"]').click();
  check('UI preset swaps to Calls', V.state.phone.screen === 'calls' && V.phoneActive(V.state) === true, JSON.stringify(V.state.phone));
  check('UI preset re-syncs the readout', $('phoneSizeVal').textContent.includes('CALLS'), $('phoneSizeVal').textContent);
  $('phoneOn').click();
  check('UI uncheck turns phone off', V.phoneActive(V.state) === false);
  $('phoneOn').click();
  check('UI re-check turns phone on', V.phoneActive(V.state) === true);

  // --- v34 Vice Cast (Cast dial: 5 casts + size + figures + rim light + CAST chip) ---
  check('default cast is off, duo 80%', V.castActive(V.state) === false && V.state.cast.cast === 'duo' && V.state.cast.size === 0.8, JSON.stringify(V.state.cast));
  check('defaultCast values', (() => { const c = V.defaultCast(); return c.on === false && c.cast === 'duo' && c.size === 0.8; })());
  check('5 casts', Object.keys(V.CASTS).length === 5, Object.keys(V.CASTS).join(','));
  check('5 cast presets', V.CAST_PRESETS.length === 5, V.CAST_PRESETS.map((p) => p.label).join(','));
  check('cast presets cover all casts', V.CAST_PRESETS.map((p) => p.cast).join(',') === 'duo,rider,detective,beach,driver', V.CAST_PRESETS.map((p) => p.cast).join(','));
  check('clampCastSize clamps below 0', V.clampCastSize(-0.5) === 0, V.clampCastSize(-0.5));
  check('clampCastSize clamps above 1', V.clampCastSize(1.5) === 1, V.clampCastSize(1.5));
  check('clampCastSize snaps to hundredths', V.clampCastSize(0.678) === 0.68, V.clampCastSize(0.678));
  check('clampCastSize NaN defaults to 0.8', V.clampCastSize('x') === 0.8, V.clampCastSize('x'));
  check('clampCast unknown falls back to duo', V.clampCast('nowhere') === 'duo', V.clampCast('nowhere'));
  check('castAt labels', V.castAt('duo', 0.8).label === 'DUO' && V.castAt('rider', 0.8).label === 'RIDER' && V.castAt('detective', 0.8).label === 'DETECTIVE' && V.castAt('beach', 0.8).label === 'BEACH' && V.castAt('driver', 0.8).label === 'DRIVER', ['duo', 'rider', 'detective', 'beach', 'driver'].map((k) => V.castAt(k, 0.8).label).join(','));
  check('cast labels are original (no Rockstar character)', ['duo', 'rider', 'detective', 'beach', 'driver'].every((k) => !/lucia|jason|rockstar/i.test(V.castAt(k, 0.8).label)), ['duo', 'rider', 'detective', 'beach', 'driver'].map((k) => V.castAt(k, 0.8).label).join(','));
  check('castAt deterministic', JSON.stringify(V.castAt('beach', 0.8)) === JSON.stringify(V.castAt('beach', 0.8)));
  check('applyCast turns cast on at the cast', (() => { const s2 = {}; V.applyCast(s2, 'rider', 0.5); return V.castActive(s2) === true && s2.cast.cast === 'rider' && s2.cast.size === 0.5; })());
  check('applyCast NaN size falls back to 0.8', (() => { const s2 = {}; V.applyCast(s2, 'driver', 'x'); return s2.cast.cast === 'driver' && s2.cast.size === 0.8; })());
  check('viceCast template exists', !!V.TEMPLATES.viceCast);
  const cState = V.state;
  const cApplied = V.applyTemplate(cState, 'viceCast');
  V.redraw();
  check('applyTemplate viceCast returns true', cApplied === true);
  check('template sets keyart layout', cState.layout === 'keyart', cState.layout);
  check('template sets skyline backdrop', cState.backdrop === 'skyline', cState.backdrop);
  check('template sets sunset grade', cState.grade === 'sunset', cState.grade);
  check('template turns cast on at duo 80%', V.castActive(cState) === true && cState.cast.cast === 'duo' && cState.cast.size === 0.8, JSON.stringify(cState.cast));
  check('template title is VICE DUO', cState.title === 'VICE DUO', cState.title);
  check('templateMatches viceCast', V.templateMatches(cState, 'viceCast') === true);
  check('templateMatches rejects wrong cast', V.templateMatches({ ...cState, cast: { on: true, cast: 'rider', size: 0.8 } }, 'viceCast') === false);
  check('describeStateChange names a cast change', (() => {
    const a = { cast: { on: false, cast: 'duo', size: 0.8 } };
    const b = { cast: { on: true, cast: 'duo', size: 0.8 } };
    return V.describeStateChange(a, b) === 'Cast';
  })());
  check('snapshot/restore keeps cast', (() => {
    const snap = JSON.parse(JSON.stringify(cState.cast));
    cState.cast.on = false;
    cState.cast = JSON.parse(JSON.stringify(snap));
    return V.castActive(cState) === true && cState.cast.cast === 'duo' && cState.cast.size === 0.8;
  })());
  const t34c1 = document.createElement('canvas'); t34c1.width = 480; t34c1.height = 270;
  const t34c2 = document.createElement('canvas'); t34c2.width = 480; t34c2.height = 270;
  const t34c3 = document.createElement('canvas'); t34c3.width = 480; t34c3.height = 270;
  const t34c4 = document.createElement('canvas'); t34c4.width = 480; t34c4.height = 270;
  const t34c5 = document.createElement('canvas'); t34c5.width = 480; t34c5.height = 270;
  V.drawCover(t34c1, { ...cState, cast: { on: false, cast: 'duo', size: 0.8 } });
  V.drawCover(t34c2, { ...cState });
  V.drawCover(t34c3, { ...cState, cast: { on: true, cast: 'rider', size: 0.8 } });
  V.drawCover(t34c4, { ...cState });
  V.drawCover(t34c5, { ...cState, cast: { on: true, cast: 'duo', size: 0.2 } });
  check('drawCover keyart with cast runs', sumPixels(t34c2) > 0, sumPixels(t34c2));
  check('cast changes the rendered pixels', sumPixels(t34c1) !== sumPixels(t34c2), sumPixels(t34c1) + ' vs ' + sumPixels(t34c2));
  check('rider differs from duo', sumPixels(t34c2) !== sumPixels(t34c3), sumPixels(t34c2) + ' vs ' + sumPixels(t34c3));
  check('size 0.2 differs from 0.8', sumPixels(t34c2) !== sumPixels(t34c5), sumPixels(t34c2) + ' vs ' + sumPixels(t34c5));
  check('cast render is deterministic', sumPixels(t34c2) === sumPixels(t34c4), sumPixels(t34c2) + ' vs ' + sumPixels(t34c4));
  const t34blob = await V.exportCover({ ...cState }, 540, 540);
  check('exportCover cast returns a PNG blob', t34blob && t34blob.size > 10000, t34blob && t34blob.size);
  check('fs-cast fieldset exists', !!$('fs-cast'));
  check('cast controls exist', !!($('castOn') && $('castSize') && $('castSizeVal') && document.querySelectorAll('.castPreset').length === 5));
  check('castOn reflects the template', $('castOn').checked === true);
  check('UI readout follows the size', $('castSizeVal').textContent.includes('DUO') && $('castSizeVal').textContent.includes('80%'), $('castSizeVal').textContent);
  document.querySelector('.castPreset[data-cast="detective"]').click();
  check('UI preset restyles to Detective', V.state.cast.cast === 'detective' && V.castActive(V.state) === true, JSON.stringify(V.state.cast));
  check('UI preset re-syncs the readout', $('castSizeVal').textContent.includes('DETECTIVE'), $('castSizeVal').textContent);
  $('castOn').click();
  check('UI uncheck turns cast off', V.castActive(V.state) === false);
  $('castOn').click();
  check('UI re-check turns cast on', V.castActive(V.state) === true);

  // --- v36 Vice Neon Sign (Sign dial: 5 signs + size + neon board + motif + SIGN chip) ---
  check('default sign is off, neon 80%', V.signActive(V.state) === false && V.state.sign.sign === 'neon' && V.state.sign.size === 0.8, JSON.stringify(V.state.sign));
  check('defaultSign values', (() => { const g = V.defaultSign(); return g.on === false && g.sign === 'neon' && g.size === 0.8; })());
  check('5 signs', Object.keys(V.SIGNS).length === 5, Object.keys(V.SIGNS).join(','));
  check('5 sign presets', V.SIGN_PRESETS.length === 5, V.SIGN_PRESETS.map((p) => p.label).join(','));
  check('sign presets cover all signs', V.SIGN_PRESETS.map((p) => p.sign).join(',') === 'vice,neon,ocean,sunset,palms', V.SIGN_PRESETS.map((p) => p.sign).join(','));
  check('clampSignSize clamps below 0', V.clampSignSize(-0.5) === 0, V.clampSignSize(-0.5));
  check('clampSignSize clamps above 1', V.clampSignSize(1.5) === 1, V.clampSignSize(1.5));
  check('clampSignSize snaps to hundredths', V.clampSignSize(0.678) === 0.68, V.clampSignSize(0.678));
  check('clampSignSize NaN defaults to 0.8', V.clampSignSize('x') === 0.8, V.clampSignSize('x'));
  check('clampSign unknown falls back to neon', V.clampSign('nowhere') === 'neon', V.clampSign('nowhere'));
  check('signAt labels', V.signAt('vice', 0.8).label === 'VICE CITY' && V.signAt('neon', 0.8).label === 'NEON NIGHTS' && V.signAt('ocean', 0.8).label === 'OCEAN DRIVE' && V.signAt('sunset', 0.8).label === 'SUNSET STRIP' && V.signAt('palms', 0.8).label === 'PALM COURT', ['vice', 'neon', 'ocean', 'sunset', 'palms'].map((k) => V.signAt(k, 0.8).label).join(','));
  check('signAt motifs differ per sign', new Set(['vice', 'neon', 'ocean', 'sunset', 'palms'].map((k) => V.signAt(k, 0.8).motif)).size === 5, ['vice', 'neon', 'ocean', 'sunset', 'palms'].map((k) => V.signAt(k, 0.8).motif).join(','));
  check('signAt deterministic', JSON.stringify(V.signAt('ocean', 0.8)) === JSON.stringify(V.signAt('ocean', 0.8)));
  check('applySign turns sign on at the sign', (() => { const s2 = {}; V.applySign(s2, 'ocean', 0.5); return V.signActive(s2) === true && s2.sign.sign === 'ocean' && s2.sign.size === 0.5; })());
  check('applySign NaN size falls back to 0.8', (() => { const s2 = {}; V.applySign(s2, 'sunset', 'x'); return s2.sign.sign === 'sunset' && s2.sign.size === 0.8; })());
  check('viceNeonSign template exists', !!V.TEMPLATES.viceNeonSign);
  const gState = V.state;
  const gApplied = V.applyTemplate(gState, 'viceNeonSign');
  V.redraw();
  check('applyTemplate viceNeonSign returns true', gApplied === true);
  check('template sets keyart layout', gState.layout === 'keyart', gState.layout);
  check('template sets skyline backdrop', gState.backdrop === 'skyline', gState.backdrop);
  check('template sets sunset grade', gState.grade === 'sunset', gState.grade);
  check('template turns sign on at neon 80%', V.signActive(gState) === true && gState.sign.sign === 'neon' && gState.sign.size === 0.8, JSON.stringify(gState.sign));
  check('template title is VICE CITY', gState.title === 'VICE CITY', gState.title);
  check('templateMatches viceNeonSign', V.templateMatches(gState, 'viceNeonSign') === true);
  check('templateMatches rejects wrong sign', V.templateMatches({ ...gState, sign: { on: true, sign: 'ocean', size: 0.8 } }, 'viceNeonSign') === false);
  check('describeStateChange names a sign change', (() => {
    const a = { sign: { on: false, sign: 'neon', size: 0.8 } };
    const b = { sign: { on: true, sign: 'neon', size: 0.8 } };
    return V.describeStateChange(a, b) === 'Sign';
  })());
  check('snapshot/restore keeps sign', (() => {
    const snap = JSON.parse(JSON.stringify(gState.sign));
    gState.sign.on = false;
    gState.sign = JSON.parse(JSON.stringify(snap));
    return V.signActive(gState) === true && gState.sign.sign === 'neon' && gState.sign.size === 0.8;
  })());
  const t36c1 = document.createElement('canvas'); t36c1.width = 480; t36c1.height = 270;
  const t36c2 = document.createElement('canvas'); t36c2.width = 480; t36c2.height = 270;
  const t36c3 = document.createElement('canvas'); t36c3.width = 480; t36c3.height = 270;
  const t36c4 = document.createElement('canvas'); t36c4.width = 480; t36c4.height = 270;
  const t36c5 = document.createElement('canvas'); t36c5.width = 480; t36c5.height = 270;
  const t36c6 = document.createElement('canvas'); t36c6.width = 480; t36c6.height = 270;
  V.drawCover(t36c1, { ...gState, sign: { on: false, sign: 'neon', size: 0.8 } });
  V.drawCover(t36c2, { ...gState });
  V.drawCover(t36c3, { ...gState, sign: { on: true, sign: 'ocean', size: 0.8 } });
  V.drawCover(t36c4, { ...gState });
  V.drawCover(t36c5, { ...gState, sign: { on: true, sign: 'neon', size: 0.2 } });
  // v36 fix check: cast + ride + sign all on — the three chips stack
  // (sign above ride above cast) instead of the old cast/ride overlap.
  V.drawCover(t36c6, { ...gState, cast: { on: true, cast: 'duo', size: 0.8 }, ride: { on: true, ride: 'coupe', size: 0.8 }, sign: { on: true, sign: 'neon', size: 0.8 }, ticker: { on: false, story: 'heist', speed: 0.8 }, timeOfDay: { on: false, hour: 18.5 }, weather: { on: false, kind: 'clear', intensity: 0.8 }, era: { on: false, era: '1986', intensity: 0.8 }, district: { on: false, district: 'ocean', intensity: 0.8 }, moment: { on: false, moment: 'heist', intensity: 0.8 }, wanted: { on: false, level: 0 }, radio: { on: false, station: 'neonwave', volume: 0.8 }, map: { on: false, style: 'radar', zoom: 0.8 }, phone: { on: false, screen: 'messages', size: 0.8 } });
  check('drawCover keyart with sign runs', sumPixels(t36c2) > 0, sumPixels(t36c2));
  check('sign changes the rendered pixels', sumPixels(t36c1) !== sumPixels(t36c2), sumPixels(t36c1) + ' vs ' + sumPixels(t36c2));
  check('ocean differs from neon', sumPixels(t36c2) !== sumPixels(t36c3), sumPixels(t36c2) + ' vs ' + sumPixels(t36c3));
  check('size 0.2 differs from 0.8', sumPixels(t36c2) !== sumPixels(t36c5), sumPixels(t36c2) + ' vs ' + sumPixels(t36c5));
  check('sign render is deterministic', sumPixels(t36c2) === sumPixels(t36c4), sumPixels(t36c2) + ' vs ' + sumPixels(t36c4));
  check('cast+ride+sign all on renders', sumPixels(t36c6) > 0, sumPixels(t36c6));
  const t36blob = await V.exportCover({ ...gState }, 540, 540);
  check('exportCover sign returns a PNG blob', t36blob && t36blob.size > 10000, t36blob && t36blob.size);
  check('fs-sign fieldset exists', !!$('fs-sign'));
  check('sign controls exist', !!($('signOn') && $('signSize') && $('signSizeVal') && document.querySelectorAll('.signPreset').length === 5));
  check('signOn reflects the template', $('signOn').checked === true);
  check('UI readout follows the size', $('signSizeVal').textContent.includes('NEON NIGHTS') && $('signSizeVal').textContent.includes('80%'), $('signSizeVal').textContent);
  document.querySelector('.signPreset[data-sign="ocean"]').click();
  check('UI preset restyles to Ocean Drive', V.state.sign.sign === 'ocean' && V.signActive(V.state) === true, JSON.stringify(V.state.sign));
  check('UI preset re-syncs the readout', $('signSizeVal').textContent.includes('OCEAN DRIVE'), $('signSizeVal').textContent);
  $('signOn').click();
  check('UI uncheck turns sign off', V.signActive(V.state) === false);
  $('signOn').click();
  check('UI re-check turns sign on', V.signActive(V.state) === true);

  // --- v37 Vice Tag (Tag dial: 5 tags + size + tilted tag word + spray speckle + drips + swoosh + motif + TAG chip) ---
  check('default tag is off, vice 80%', V.tagActive(V.state) === false && V.state.tag.tag === 'vice' && V.state.tag.size === 0.8, JSON.stringify(V.state.tag));
  check('defaultTag values', (() => { const g = V.defaultTag(); return g.on === false && g.tag === 'vice' && g.size === 0.8; })());
  check('5 tags', Object.keys(V.TAGS).length === 5, Object.keys(V.TAGS).join(','));
  check('5 tag presets', V.TAG_PRESETS.length === 5, V.TAG_PRESETS.map((p) => p.label).join(','));
  check('tag presets cover all tags', V.TAG_PRESETS.map((p) => p.tag).join(',') === 'vice,neon,gold,heat,palm', V.TAG_PRESETS.map((p) => p.tag).join(','));
  check('clampTagSize clamps below 0', V.clampTagSize(-0.5) === 0, V.clampTagSize(-0.5));
  check('clampTagSize clamps above 1', V.clampTagSize(1.5) === 1, V.clampTagSize(1.5));
  check('clampTagSize snaps to hundredths', V.clampTagSize(0.678) === 0.68, V.clampTagSize(0.678));
  check('clampTagSize NaN defaults to 0.8', V.clampTagSize('x') === 0.8, V.clampTagSize('x'));
  check('clampTag unknown falls back to vice', V.clampTag('nowhere') === 'vice', V.clampTag('nowhere'));
  check('tagAt labels', V.tagAt('vice', 0.8).label === 'VICE' && V.tagAt('neon', 0.8).label === 'NEON' && V.tagAt('gold', 0.8).label === 'GOLD' && V.tagAt('heat', 0.8).label === 'HEAT' && V.tagAt('palm', 0.8).label === 'PALM', ['vice', 'neon', 'gold', 'heat', 'palm'].map((k) => V.tagAt(k, 0.8).label).join(','));
  check('tagAt motifs differ per tag', new Set(['vice', 'neon', 'gold', 'heat', 'palm'].map((k) => V.tagAt(k, 0.8).motif)).size === 5, ['vice', 'neon', 'gold', 'heat', 'palm'].map((k) => V.tagAt(k, 0.8).motif).join(','));
  check('tagAt deterministic', JSON.stringify(V.tagAt('gold', 0.8)) === JSON.stringify(V.tagAt('gold', 0.8)));
  check('applyTag turns tag on at the tag', (() => { const s2 = {}; V.applyTag(s2, 'gold', 0.5); return V.tagActive(s2) === true && s2.tag.tag === 'gold' && s2.tag.size === 0.5; })());
  check('applyTag NaN size falls back to 0.8', (() => { const s2 = {}; V.applyTag(s2, 'heat', 'x'); return s2.tag.tag === 'heat' && s2.tag.size === 0.8; })());
  check('viceTag template exists', !!V.TEMPLATES.viceTag);
  const hState = V.state;
  const hApplied = V.applyTemplate(hState, 'viceTag');
  V.redraw();
  check('applyTemplate viceTag returns true', hApplied === true);
  check('template sets keyart layout', hState.layout === 'keyart', hState.layout);
  check('template sets skyline backdrop', hState.backdrop === 'skyline', hState.backdrop);
  check('template sets sunset grade', hState.grade === 'sunset', hState.grade);
  check('template turns tag on at vice 80%', V.tagActive(hState) === true && hState.tag.tag === 'vice' && hState.tag.size === 0.8, JSON.stringify(hState.tag));
  check('template title is VICE CITY', hState.title === 'VICE CITY', hState.title);
  check('templateMatches viceTag', V.templateMatches(hState, 'viceTag') === true);
  check('templateMatches rejects wrong tag', V.templateMatches({ ...hState, tag: { on: true, tag: 'gold', size: 0.8 } }, 'viceTag') === false);
  check('describeStateChange names a tag change', (() => {
    const a = { tag: { on: false, tag: 'vice', size: 0.8 } };
    const b = { tag: { on: true, tag: 'vice', size: 0.8 } };
    return V.describeStateChange(a, b) === 'Tag';
  })());
  check('snapshot/restore keeps tag', (() => {
    const snap = JSON.parse(JSON.stringify(hState.tag));
    hState.tag.on = false;
    hState.tag = JSON.parse(JSON.stringify(snap));
    return V.tagActive(hState) === true && hState.tag.tag === 'vice' && hState.tag.size === 0.8;
  })());
  const t37c1 = document.createElement('canvas'); t37c1.width = 480; t37c1.height = 270;
  const t37c2 = document.createElement('canvas'); t37c2.width = 480; t37c2.height = 270;
  const t37c3 = document.createElement('canvas'); t37c3.width = 480; t37c3.height = 270;
  const t37c4 = document.createElement('canvas'); t37c4.width = 480; t37c4.height = 270;
  const t37c5 = document.createElement('canvas'); t37c5.width = 480; t37c5.height = 270;
  const t37c6 = document.createElement('canvas'); t37c6.width = 480; t37c6.height = 270;
  V.drawCover(t37c1, { ...hState, tag: { on: false, tag: 'vice', size: 0.8 } });
  V.drawCover(t37c2, { ...hState });
  V.drawCover(t37c3, { ...hState, tag: { on: true, tag: 'gold', size: 0.8 } });
  V.drawCover(t37c4, { ...hState });
  V.drawCover(t37c5, { ...hState, tag: { on: true, tag: 'vice', size: 0.2 } });
  // v37 fix check: cast + ride + sign + tag all on — the four chips stack
  // (tag above sign above ride above cast) instead of overlapping.
  V.drawCover(t37c6, { ...hState, cast: { on: true, cast: 'duo', size: 0.8 }, ride: { on: true, ride: 'coupe', size: 0.8 }, sign: { on: true, sign: 'neon', size: 0.8 }, tag: { on: true, tag: 'vice', size: 0.8 }, ticker: { on: false, story: 'heist', speed: 0.8 }, timeOfDay: { on: false, hour: 18.5 }, weather: { on: false, kind: 'clear', intensity: 0.8 }, era: { on: false, era: '1986', intensity: 0.8 }, district: { on: false, district: 'ocean', intensity: 0.8 }, moment: { on: false, moment: 'heist', intensity: 0.8 }, wanted: { on: false, level: 0 }, radio: { on: false, station: 'neonwave', volume: 0.8 }, map: { on: false, style: 'radar', zoom: 0.8 }, phone: { on: false, screen: 'messages', size: 0.8 } });
  check('drawCover keyart with tag runs', sumPixels(t37c2) > 0, sumPixels(t37c2));
  check('tag changes the rendered pixels', sumPixels(t37c1) !== sumPixels(t37c2), sumPixels(t37c1) + ' vs ' + sumPixels(t37c2));
  check('gold differs from vice', sumPixels(t37c2) !== sumPixels(t37c3), sumPixels(t37c2) + ' vs ' + sumPixels(t37c3));
  check('size 0.2 differs from 0.8', sumPixels(t37c2) !== sumPixels(t37c5), sumPixels(t37c2) + ' vs ' + sumPixels(t37c5));
  check('tag render is deterministic', sumPixels(t37c2) === sumPixels(t37c4), sumPixels(t37c2) + ' vs ' + sumPixels(t37c4));
  check('cast+ride+sign+tag all on renders', sumPixels(t37c6) > 0, sumPixels(t37c6));
  const t37blob = await V.exportCover({ ...hState }, 540, 540);
  check('exportCover tag returns a PNG blob', t37blob && t37blob.size > 10000, t37blob && t37blob.size);
  check('fs-tag fieldset exists', !!$('fs-tag'));
  check('tag controls exist', !!($('tagOn') && $('tagSize') && $('tagSizeVal') && document.querySelectorAll('.tagPreset').length === 5));
  check('tagOn reflects the template', $('tagOn').checked === true);
  check('UI readout follows the size', $('tagSizeVal').textContent.includes('VICE') && $('tagSizeVal').textContent.includes('80%'), $('tagSizeVal').textContent);
  document.querySelector('.tagPreset[data-tag="gold"]').click();
  check('UI preset restyles to Gold', V.state.tag.tag === 'gold' && V.tagActive(V.state) === true, JSON.stringify(V.state.tag));
  check('UI preset re-syncs the readout', $('tagSizeVal').textContent.includes('GOLD'), $('tagSizeVal').textContent);
  $('tagOn').click();
  check('UI uncheck turns tag off', V.tagActive(V.state) === false);
  $('tagOn').click();
  check('UI re-check turns tag on', V.tagActive(V.state) === true);


  // --- v38 Vice Plate (Plate dial: 5 plates + size + tilted metal plate + state strip + embossed number + bolts + sheen + PLATE chip) ---
  check('default plate is off, vice 80%', V.plateActive(V.state) === false && V.state.plate.plate === 'vice' && V.state.plate.size === 0.8, JSON.stringify(V.state.plate));
  check('defaultPlate values', (() => { const g = V.defaultPlate(); return g.on === false && g.plate === 'vice' && g.size === 0.8; })());
  check('5 plates', Object.keys(V.PLATES).length === 5, Object.keys(V.PLATES).join(','));
  check('5 plate presets', V.PLATE_PRESETS.length === 5, V.PLATE_PRESETS.map((p) => p.label).join(','));
  check('plate presets cover all plates', V.PLATE_PRESETS.map((p) => p.plate).join(',') === 'vice,neon,ocean,gold,palm', V.PLATE_PRESETS.map((p) => p.plate).join(','));
  check('clampPlateSize clamps below 0', V.clampPlateSize(-0.5) === 0, V.clampPlateSize(-0.5));
  check('clampPlateSize clamps above 1', V.clampPlateSize(1.5) === 1, V.clampPlateSize(1.5));
  check('clampPlateSize snaps to hundredths', V.clampPlateSize(0.678) === 0.68, V.clampPlateSize(0.678));
  check('clampPlateSize NaN defaults to 0.8', V.clampPlateSize('x') === 0.8, V.clampPlateSize('x'));
  check('clampPlate unknown falls back to vice', V.clampPlate('nowhere') === 'vice', V.clampPlate('nowhere'));
  check('plateAt labels', V.plateAt('vice', 0.8).label === 'VICE-86' && V.plateAt('neon', 0.8).label === 'NEON-1' && V.plateAt('ocean', 0.8).label === 'OCEAN-7' && V.plateAt('gold', 0.8).label === 'GOLD-24' && V.plateAt('palm', 0.8).label === 'PALM-5', ['vice', 'neon', 'ocean', 'gold', 'palm'].map((k) => V.plateAt(k, 0.8).label).join(','));
  check('plateAt states differ per plate', new Set(['vice', 'neon', 'ocean', 'gold', 'palm'].map((k) => V.plateAt(k, 0.8).state)).size === 5, ['vice', 'neon', 'ocean', 'gold', 'palm'].map((k) => V.plateAt(k, 0.8).state).join(','));
  check('plateAt deterministic', JSON.stringify(V.plateAt('gold', 0.8)) === JSON.stringify(V.plateAt('gold', 0.8)));
  check('applyPlate turns plate on at the plate', (() => { const s2 = {}; V.applyPlate(s2, 'gold', 0.5); return V.plateActive(s2) === true && s2.plate.plate === 'gold' && s2.plate.size === 0.5; })());
  check('applyPlate NaN size falls back to 0.8', (() => { const s2 = {}; V.applyPlate(s2, 'ocean', 'x'); return s2.plate.plate === 'ocean' && s2.plate.size === 0.8; })());
  check('vicePlate template exists', !!V.TEMPLATES.vicePlate);
  const plApplied = V.applyTemplate(hState, 'vicePlate');
  V.redraw();
  check('applyTemplate vicePlate returns true', plApplied === true);
  check('template keeps keyart layout', hState.layout === 'keyart', hState.layout);
  check('template keeps skyline backdrop', hState.backdrop === 'skyline', hState.backdrop);
  check('template keeps sunset grade', hState.grade === 'sunset', hState.grade);
  check('template turns plate on at vice 80%', V.plateActive(hState) === true && hState.plate.plate === 'vice' && hState.plate.size === 0.8, JSON.stringify(hState.plate));
  check('template title is VICE CITY', hState.title === 'VICE CITY', hState.title);
  check('templateMatches vicePlate', V.templateMatches(hState, 'vicePlate') === true);
  check('templateMatches rejects wrong plate', V.templateMatches({ ...hState, plate: { on: true, plate: 'gold', size: 0.8 } }, 'vicePlate') === false);
  check('describeStateChange names a plate change', (() => {
    const a = { plate: { on: false, plate: 'vice', size: 0.8 } };
    const b = { plate: { on: true, plate: 'vice', size: 0.8 } };
    return V.describeStateChange(a, b) === 'Plate';
  })());
  check('snapshot/restore keeps plate', (() => {
    const snap = JSON.parse(JSON.stringify(hState.plate));
    hState.plate.on = false;
    hState.plate = JSON.parse(JSON.stringify(snap));
    return V.plateActive(hState) === true && hState.plate.plate === 'vice' && hState.plate.size === 0.8;
  })());
  const t38c1 = document.createElement('canvas'); t38c1.width = 480; t38c1.height = 270;
  const t38c2 = document.createElement('canvas'); t38c2.width = 480; t38c2.height = 270;
  const t38c3 = document.createElement('canvas'); t38c3.width = 480; t38c3.height = 270;
  const t38c4 = document.createElement('canvas'); t38c4.width = 480; t38c4.height = 270;
  const t38c5 = document.createElement('canvas'); t38c5.width = 480; t38c5.height = 270;
  const t38c6 = document.createElement('canvas'); t38c6.width = 480; t38c6.height = 270;
  V.drawCover(t38c1, { ...hState, plate: { on: false, plate: 'vice', size: 0.8 } });
  V.drawCover(t38c2, { ...hState });
  V.drawCover(t38c3, { ...hState, plate: { on: true, plate: 'gold', size: 0.8 } });
  V.drawCover(t38c4, { ...hState });
  V.drawCover(t38c5, { ...hState, plate: { on: true, plate: 'vice', size: 0.2 } });
  // v38 fix check: sign + tag + plate all on — the three chips stack
  // (plate above tag above sign) instead of the sign and tag sharing
  // one row, and the plate renders over the tag.
  V.drawCover(t38c6, { ...hState, sign: { on: true, sign: 'neon', size: 0.8 }, tag: { on: true, tag: 'vice', size: 0.8 }, plate: { on: true, plate: 'vice', size: 0.8 }, ticker: { on: false, story: 'heist', speed: 0.8 }, timeOfDay: { on: false, hour: 18.5 }, weather: { on: false, kind: 'clear', intensity: 0.8 }, era: { on: false, era: '1986', intensity: 0.8 }, district: { on: false, district: 'ocean', intensity: 0.8 }, moment: { on: false, moment: 'heist', intensity: 0.8 }, wanted: { on: false, level: 0 }, radio: { on: false, station: 'neonwave', volume: 0.8 }, map: { on: false, style: 'radar', zoom: 0.8 }, phone: { on: false, screen: 'messages', size: 0.8 }, cast: { on: false, cast: 'duo', size: 0.8 }, ride: { on: false, ride: 'coupe', size: 0.8 } });
  check('drawCover keyart with plate runs', sumPixels(t38c2) > 0, sumPixels(t38c2));
  check('plate changes the rendered pixels', sumPixels(t38c1) !== sumPixels(t38c2), sumPixels(t38c1) + ' vs ' + sumPixels(t38c2));
  check('gold differs from vice', sumPixels(t38c2) !== sumPixels(t38c3), sumPixels(t38c2) + ' vs ' + sumPixels(t38c3));
  check('size 0.2 differs from 0.8', sumPixels(t38c2) !== sumPixels(t38c5), sumPixels(t38c2) + ' vs ' + sumPixels(t38c5));
  check('plate render is deterministic', sumPixels(t38c2) === sumPixels(t38c4), sumPixels(t38c2) + ' vs ' + sumPixels(t38c4));
  check('sign+tag+plate all on renders', sumPixels(t38c6) > 0, sumPixels(t38c6));
  const t38blob = await V.exportCover({ ...hState }, 540, 540);
  check('exportCover plate returns a PNG blob', t38blob && t38blob.size > 10000, t38blob && t38blob.size);
  check('fs-plate fieldset exists', !!$('fs-plate'));
  check('plate controls exist', !!($('plateOn') && $('plateSize') && $('plateSizeVal') && document.querySelectorAll('.platePreset').length === 5));
  check('plateOn reflects the template', $('plateOn').checked === true);
  check('UI readout follows the size', $('plateSizeVal').textContent.includes('VICE-86') && $('plateSizeVal').textContent.includes('80%'), $('plateSizeVal').textContent);
  document.querySelector('.platePreset[data-plate="gold"]').click();
  check('UI preset restyles to Gold', V.state.plate.plate === 'gold' && V.plateActive(V.state) === true, JSON.stringify(V.state.plate));
  check('UI preset re-syncs the readout', $('plateSizeVal').textContent.includes('GOLD-24'), $('plateSizeVal').textContent);
  $('plateOn').click();
  check('UI uncheck turns plate off', V.plateActive(V.state) === false);
  $('plateOn').click();
  check('UI re-check turns plate on', V.plateActive(V.state) === true);


  // --- v39 Vice Emblem (Emblem dial: 5 emblems + size + VI lockup + VICE CITY word + rule + motif + LEONIDA sub-line + EMBLEM chip) ---
  check('default emblem is off, vice 80%', V.emblemActive(V.state) === false && V.state.emblem.emblem === 'vice' && V.state.emblem.size === 0.8, JSON.stringify(V.state.emblem));
  check('defaultEmblem values', (() => { const g = V.defaultEmblem(); return g.on === false && g.emblem === 'vice' && g.size === 0.8; })());
  check('5 emblems', Object.keys(V.EMBLEMS).length === 5, Object.keys(V.EMBLEMS).join(','));
  check('5 emblem presets', V.EMBLEM_PRESETS.length === 5, V.EMBLEM_PRESETS.map((p) => p.label).join(','));
  check('emblem presets cover all emblems', V.EMBLEM_PRESETS.map((p) => p.emblem).join(',') === 'vice,neon,sunset,gold,palm', V.EMBLEM_PRESETS.map((p) => p.emblem).join(','));
  check('clampEmblemSize clamps below 0', V.clampEmblemSize(-0.5) === 0, V.clampEmblemSize(-0.5));
  check('clampEmblemSize clamps above 1', V.clampEmblemSize(1.5) === 1, V.clampEmblemSize(1.5));
  check('clampEmblemSize snaps to hundredths', V.clampEmblemSize(0.678) === 0.68, V.clampEmblemSize(0.678));
  check('clampEmblemSize NaN defaults to 0.8', V.clampEmblemSize('x') === 0.8, V.clampEmblemSize('x'));
  check('clampEmblem unknown falls back to vice', V.clampEmblem('nowhere') === 'vice', V.clampEmblem('nowhere'));
  check('emblemAt labels', V.emblemAt('vice', 0.8).label === 'VICE CLASSIC' && V.emblemAt('neon', 0.8).label === 'NEON NIGHTS' && V.emblemAt('sunset', 0.8).label === 'SUNSET STRIP' && V.emblemAt('gold', 0.8).label === 'GOLDEN HOUR' && V.emblemAt('palm', 0.8).label === 'PALM COURT', ['vice', 'neon', 'sunset', 'gold', 'palm'].map((k) => V.emblemAt(k, 0.8).label).join(','));
  check('emblemAt motifs differ per emblem', new Set(['vice', 'neon', 'sunset', 'gold', 'palm'].map((k) => V.emblemAt(k, 0.8).motif)).size === 5, ['vice', 'neon', 'sunset', 'gold', 'palm'].map((k) => V.emblemAt(k, 0.8).motif).join(','));
  check('emblemAt deterministic', JSON.stringify(V.emblemAt('gold', 0.8)) === JSON.stringify(V.emblemAt('gold', 0.8)));
  check('applyEmblem turns emblem on at the emblem', (() => { const s2 = {}; V.applyEmblem(s2, 'gold', 0.5); return V.emblemActive(s2) === true && s2.emblem.emblem === 'gold' && s2.emblem.size === 0.5; })());
  check('applyEmblem NaN size falls back to 0.8', (() => { const s2 = {}; V.applyEmblem(s2, 'sunset', 'x'); return s2.emblem.emblem === 'sunset' && s2.emblem.size === 0.8; })());
  check('viceEmblem template exists', !!V.TEMPLATES.viceEmblem);
  const emApplied = V.applyTemplate(hState, 'viceEmblem');
  V.redraw();
  check('applyTemplate viceEmblem returns true', emApplied === true);
  check('template keeps keyart layout', hState.layout === 'keyart', hState.layout);
  check('template keeps skyline backdrop', hState.backdrop === 'skyline', hState.backdrop);
  check('template keeps sunset grade', hState.grade === 'sunset', hState.grade);
  check('template turns emblem on at vice 80%', V.emblemActive(hState) === true && hState.emblem.emblem === 'vice' && hState.emblem.size === 0.8, JSON.stringify(hState.emblem));
  check('template title is VICE CITY', hState.title === 'VICE CITY', hState.title);
  check('templateMatches viceEmblem', V.templateMatches(hState, 'viceEmblem') === true);
  check('templateMatches rejects wrong emblem', V.templateMatches({ ...hState, emblem: { on: true, emblem: 'gold', size: 0.8 } }, 'viceEmblem') === false);
  check('describeStateChange names an emblem change', (() => {
    const a = { emblem: { on: false, emblem: 'vice', size: 0.8 } };
    const b = { emblem: { on: true, emblem: 'vice', size: 0.8 } };
    return V.describeStateChange(a, b) === 'Emblem';
  })());
  check('snapshot/restore keeps emblem', (() => {
    const snap = JSON.parse(JSON.stringify(hState.emblem));
    hState.emblem.on = false;
    hState.emblem = JSON.parse(JSON.stringify(snap));
    return V.emblemActive(hState) === true && hState.emblem.emblem === 'vice' && hState.emblem.size === 0.8;
  })());
  const t39c1 = document.createElement('canvas'); t39c1.width = 480; t39c1.height = 270;
  const t39c2 = document.createElement('canvas'); t39c2.width = 480; t39c2.height = 270;
  const t39c3 = document.createElement('canvas'); t39c3.width = 480; t39c3.height = 270;
  const t39c4 = document.createElement('canvas'); t39c4.width = 480; t39c4.height = 270;
  const t39c5 = document.createElement('canvas'); t39c5.width = 480; t39c5.height = 270;
  const t39c6 = document.createElement('canvas'); t39c6.width = 480; t39c6.height = 270;
  V.drawCover(t39c1, { ...hState, emblem: { on: false, emblem: 'vice', size: 0.8 } });
  V.drawCover(t39c2, { ...hState });
  V.drawCover(t39c3, { ...hState, emblem: { on: true, emblem: 'sunset', size: 0.8 } });
  V.drawCover(t39c4, { ...hState });
  V.drawCover(t39c5, { ...hState, emblem: { on: true, emblem: 'vice', size: 0.2 } });
  // v39 chip check: sign + tag + plate + emblem all on — the four chips
  // stack (emblem above plate above tag above sign) instead of sharing
  // one row, and the emblem renders over the plate.
  V.drawCover(t39c6, { ...hState, sign: { on: true, sign: 'neon', size: 0.8 }, tag: { on: true, tag: 'vice', size: 0.8 }, plate: { on: true, plate: 'vice', size: 0.8 }, emblem: { on: true, emblem: 'vice', size: 0.8 }, ticker: { on: false, story: 'heist', speed: 0.8 }, timeOfDay: { on: false, hour: 18.5 }, weather: { on: false, kind: 'clear', intensity: 0.8 }, era: { on: false, era: '1986', intensity: 0.8 }, district: { on: false, district: 'ocean', intensity: 0.8 }, moment: { on: false, moment: 'heist', intensity: 0.8 }, wanted: { on: false, level: 0 }, radio: { on: false, station: 'neonwave', volume: 0.8 }, map: { on: false, style: 'radar', zoom: 0.8 }, phone: { on: false, screen: 'messages', size: 0.8 }, cast: { on: false, cast: 'duo', size: 0.8 }, ride: { on: false, ride: 'coupe', size: 0.8 } });
  check('drawCover keyart with emblem runs', sumPixels(t39c2) > 0, sumPixels(t39c2));
  check('emblem changes the rendered pixels', sumPixels(t39c1) !== sumPixels(t39c2), sumPixels(t39c1) + ' vs ' + sumPixels(t39c2));
  check('sunset differs from vice', sumPixels(t39c2) !== sumPixels(t39c3), sumPixels(t39c2) + ' vs ' + sumPixels(t39c3));
  check('size 0.2 differs from 0.8', sumPixels(t39c2) !== sumPixels(t39c5), sumPixels(t39c2) + ' vs ' + sumPixels(t39c5));
  check('emblem render is deterministic', sumPixels(t39c2) === sumPixels(t39c4), sumPixels(t39c2) + ' vs ' + sumPixels(t39c4));
  check('sign+tag+plate+emblem all on renders', sumPixels(t39c6) > 0, sumPixels(t39c6));
  const t39blob = await V.exportCover({ ...hState }, 540, 540);
  check('exportCover emblem returns a PNG blob', t39blob && t39blob.size > 10000, t39blob && t39blob.size);
  check('fs-emblem fieldset exists', !!$('fs-emblem'));
  check('emblem controls exist', !!($('emblemOn') && $('emblemSize') && $('emblemSizeVal') && document.querySelectorAll('.emblemPreset').length === 5));
  check('emblemOn reflects the template', $('emblemOn').checked === true);
  check('UI readout follows the size', $('emblemSizeVal').textContent.includes('VICE CLASSIC') && $('emblemSizeVal').textContent.includes('80%'), $('emblemSizeVal').textContent);
  document.querySelector('.emblemPreset[data-emblem="sunset"]').click();
  check('UI preset restyles to Sunset', V.state.emblem.emblem === 'sunset' && V.emblemActive(V.state) === true, JSON.stringify(V.state.emblem));
  check('UI preset re-syncs the readout', $('emblemSizeVal').textContent.includes('SUNSET STRIP'), $('emblemSizeVal').textContent);
  $('emblemOn').click();
  check('UI uncheck turns emblem off', V.emblemActive(V.state) === false);
  $('emblemOn').click();
  check('UI re-check turns emblem on', V.emblemActive(V.state) === true);

  // --- v40 Vice Palm Shade (Shade dial: 5 palm-shadow patterns + intensity + frond shadows + SHADE chip) ---
  check('default shade is off, coconut 80%', V.shadeActive(V.state) === false && V.state.shade.shade === 'coconut' && V.state.shade.size === 0.8, JSON.stringify(V.state.shade));
  check('defaultShade values', (() => { const g = V.defaultShade(); return g.on === false && g.shade === 'coconut' && g.size === 0.8; })());
  check('5 shades', Object.keys(V.SHADES).length === 5, Object.keys(V.SHADES).join(','));
  check('5 shade presets', V.SHADE_PRESETS.length === 5, V.SHADE_PRESETS.map((p) => p.label).join(','));
  check('shade presets cover all shades', V.SHADE_PRESETS.map((p) => p.shade).join(',') === 'coconut,fan,banana,areca,date', V.SHADE_PRESETS.map((p) => p.shade).join(','));
  check('clampShadeSize clamps below 0', V.clampShadeSize(-0.5) === 0, V.clampShadeSize(-0.5));
  check('clampShadeSize clamps above 1', V.clampShadeSize(1.5) === 1, V.clampShadeSize(1.5));
  check('clampShadeSize snaps to hundredths', V.clampShadeSize(0.678) === 0.68, V.clampShadeSize(0.678));
  check('clampShadeSize NaN defaults to 0.8', V.clampShadeSize('x') === 0.8, V.clampShadeSize('x'));
  check('clampShade unknown falls back to coconut', V.clampShade('nowhere') === 'coconut', V.clampShade('nowhere'));
  check('shadeAt labels', V.shadeAt('coconut', 0.8).label === 'COCONUT FRONDS' && V.shadeAt('fan', 0.8).label === 'FAN PALM' && V.shadeAt('banana', 0.8).label === 'BANANA LEAVES' && V.shadeAt('areca', 0.8).label === 'ARECA PALM' && V.shadeAt('date', 0.8).label === 'DATE PALM', ['coconut', 'fan', 'banana', 'areca', 'date'].map((k) => V.shadeAt(k, 0.8).label).join(','));
  check('shadeAt frond counts differ per shade', new Set(['coconut', 'fan', 'banana', 'areca', 'date'].map((k) => V.shadeAt(k, 0.8).fronds)).size >= 3, ['coconut', 'fan', 'banana', 'areca', 'date'].map((k) => V.shadeAt(k, 0.8).fronds).join(','));
  check('shadeAt deterministic', JSON.stringify(V.shadeAt('banana', 0.8)) === JSON.stringify(V.shadeAt('banana', 0.8)));
  check('applyShade turns shade on at the shade', (() => { const s2 = {}; V.applyShade(s2, 'banana', 0.5); return V.shadeActive(s2) === true && s2.shade.shade === 'banana' && s2.shade.size === 0.5; })());
  check('applyShade NaN size falls back to 0.8', (() => { const s2 = {}; V.applyShade(s2, 'date', 'x'); return s2.shade.shade === 'date' && s2.shade.size === 0.8; })());
  check('vicePalmShade template exists', !!V.TEMPLATES.vicePalmShade);
  const shApplied = V.applyTemplate(hState, 'vicePalmShade');
  V.redraw();
  check('applyTemplate vicePalmShade returns true', shApplied === true);
  check('template keeps keyart layout', hState.layout === 'keyart', hState.layout);
  check('template keeps skyline backdrop', hState.backdrop === 'skyline', hState.backdrop);
  check('template keeps sunset grade', hState.grade === 'sunset', hState.grade);
  check('template turns shade on at coconut 80%', V.shadeActive(hState) === true && hState.shade.shade === 'coconut' && hState.shade.size === 0.8, JSON.stringify(hState.shade));
  check('template title is VICE CITY', hState.title === 'VICE CITY', hState.title);
  check('templateMatches vicePalmShade', V.templateMatches(hState, 'vicePalmShade') === true);
  check('templateMatches rejects wrong shade', V.templateMatches({ ...hState, shade: { on: true, shade: 'banana', size: 0.8 } }, 'vicePalmShade') === false);
  check('describeStateChange names a shade change', (() => {
    const a = { shade: { on: false, shade: 'coconut', size: 0.8 } };
    const b = { shade: { on: true, shade: 'coconut', size: 0.8 } };
    return V.describeStateChange(a, b) === 'Shade';
  })());
  check('snapshot/restore keeps shade', (() => {
    const snap = JSON.parse(JSON.stringify(hState.shade));
    hState.shade.on = false;
    hState.shade = JSON.parse(JSON.stringify(snap));
    return V.shadeActive(hState) === true && hState.shade.shade === 'coconut' && hState.shade.size === 0.8;
  })());
  const t40c1 = document.createElement('canvas'); t40c1.width = 480; t40c1.height = 270;
  const t40c2 = document.createElement('canvas'); t40c2.width = 480; t40c2.height = 270;
  const t40c3 = document.createElement('canvas'); t40c3.width = 480; t40c3.height = 270;
  const t40c4 = document.createElement('canvas'); t40c4.width = 480; t40c4.height = 270;
  const t40c5 = document.createElement('canvas'); t40c5.width = 480; t40c5.height = 270;
  const t40c6 = document.createElement('canvas'); t40c6.width = 480; t40c6.height = 270;
  V.drawCover(t40c1, { ...hState, shade: { on: false, shade: 'coconut', size: 0.8 } });
  V.drawCover(t40c2, { ...hState });
  V.drawCover(t40c3, { ...hState, shade: { on: true, shade: 'banana', size: 0.8 } });
  V.drawCover(t40c4, { ...hState });
  V.drawCover(t40c5, { ...hState, shade: { on: true, shade: 'coconut', size: 0.2 } });
  // v40 chip check: sign + tag + plate + emblem + shade all on — the five chips
  // stack (shade above emblem above plate above tag above sign) instead of sharing
  // one row, and the shade renders over the emblem.
  V.drawCover(t40c6, { ...hState, sign: { on: true, sign: 'neon', size: 0.8 }, tag: { on: true, tag: 'vice', size: 0.8 }, plate: { on: true, plate: 'vice', size: 0.8 }, emblem: { on: true, emblem: 'vice', size: 0.8 }, shade: { on: true, shade: 'coconut', size: 0.8 }, ticker: { on: false, story: 'heist', speed: 0.8 }, timeOfDay: { on: false, hour: 18.5 }, weather: { on: false, kind: 'clear', intensity: 0.8 }, era: { on: false, era: '1986', intensity: 0.8 }, district: { on: false, district: 'ocean', intensity: 0.8 }, moment: { on: false, moment: 'heist', intensity: 0.8 }, wanted: { on: false, level: 0 }, radio: { on: false, station: 'neonwave', volume: 0.8 }, map: { on: false, style: 'radar', zoom: 0.8 }, phone: { on: false, screen: 'messages', size: 0.8 }, cast: { on: false, cast: 'duo', size: 0.8 }, ride: { on: false, ride: 'coupe', size: 0.8 } });
  check('drawCover keyart with shade runs', sumPixels(t40c2) > 0, sumPixels(t40c2));
  check('shade changes the rendered pixels', sumPixels(t40c1) !== sumPixels(t40c2), sumPixels(t40c1) + ' vs ' + sumPixels(t40c2));
  check('banana differs from coconut', sumPixels(t40c2) !== sumPixels(t40c3), sumPixels(t40c2) + ' vs ' + sumPixels(t40c3));
  check('size 0.2 differs from 0.8', sumPixels(t40c2) !== sumPixels(t40c5), sumPixels(t40c2) + ' vs ' + sumPixels(t40c5));
  check('shade render is deterministic', sumPixels(t40c2) === sumPixels(t40c4), sumPixels(t40c2) + ' vs ' + sumPixels(t40c4));
  check('sign+tag+plate+emblem+shade all on renders', sumPixels(t40c6) > 0, sumPixels(t40c6));
  const t40blob = await V.exportCover({ ...hState }, 540, 540);
  check('exportCover shade returns a PNG blob', t40blob && t40blob.size > 10000, t40blob && t40blob.size);
  check('fs-shade fieldset exists', !!$('fs-shade'));
  check('shade controls exist', !!($('shadeOn') && $('shadeSize') && $('shadeSizeVal') && document.querySelectorAll('.shadePreset').length === 5));
  check('shadeOn reflects the template', $('shadeOn').checked === true);
  check('UI readout follows the size', $('shadeSizeVal').textContent.includes('COCONUT FRONDS') && $('shadeSizeVal').textContent.includes('80%'), $('shadeSizeVal').textContent);
  document.querySelector('.shadePreset[data-shade="banana"]').click();
  check('UI preset restyles to Banana', V.state.shade.shade === 'banana' && V.shadeActive(V.state) === true, JSON.stringify(V.state.shade));
  check('UI preset re-syncs the readout', $('shadeSizeVal').textContent.includes('BANANA LEAVES'), $('shadeSizeVal').textContent);
  $('shadeOn').click();
  check('UI uncheck turns shade off', V.shadeActive(V.state) === false);
  $('shadeOn').click();
  check('UI re-check turns shade on', V.shadeActive(V.state) === true);

  // --- v41 Vice Seal (Seal dial: 5 rubber-stamp seals + size + double-ring stamp + SEAL chip) ---
  check('default seal is off, vice 80%', V.sealActive(V.state) === false && V.state.seal.seal === 'vice' && V.state.seal.size === 0.8, JSON.stringify(V.state.seal));
  check('defaultSeal values', (() => { const g = V.defaultSeal(); return g.on === false && g.seal === 'vice' && g.size === 0.8; })());
  check('5 seals', Object.keys(V.SEALS).length === 5, Object.keys(V.SEALS).join(','));
  check('5 seal presets', V.SEAL_PRESETS.length === 5, V.SEAL_PRESETS.map((p) => p.label).join(','));
  check('seal presets cover all seals', V.SEAL_PRESETS.map((p) => p.seal).join(',') === 'vice,palm,sunset,neon,wave', V.SEAL_PRESETS.map((p) => p.seal).join(','));
  check('clampSealSize clamps below 0', V.clampSealSize(-0.5) === 0, V.clampSealSize(-0.5));
  check('clampSealSize clamps above 1', V.clampSealSize(1.5) === 1, V.clampSealSize(1.5));
  check('clampSealSize snaps to hundredths', V.clampSealSize(0.678) === 0.68, V.clampSealSize(0.678));
  check('clampSealSize NaN defaults to 0.8', V.clampSealSize('x') === 0.8, V.clampSealSize('x'));
  check('clampSeal unknown falls back to vice', V.clampSeal('nowhere') === 'vice', V.clampSeal('nowhere'));
  check('sealAt labels', V.sealAt('vice', 0.8).label === 'VICE CLASSIC' && V.sealAt('palm', 0.8).label === 'PALM COURT' && V.sealAt('sunset', 0.8).label === 'SUNSET STRIP' && V.sealAt('neon', 0.8).label === 'NEON NIGHTS' && V.sealAt('wave', 0.8).label === 'OCEAN DRIVE', ['vice', 'palm', 'sunset', 'neon', 'wave'].map((k) => V.sealAt(k, 0.8).label).join(','));
  check('sealAt words differ per seal', new Set(['vice', 'palm', 'sunset', 'neon', 'wave'].map((k) => V.sealAt(k, 0.8).word)).size === 5, ['vice', 'palm', 'sunset', 'neon', 'wave'].map((k) => V.sealAt(k, 0.8).word).join(','));
  check('sealAt ring lettering is non-empty', ['vice', 'palm', 'sunset', 'neon', 'wave'].every((k) => V.sealAt(k, 0.8).ring.length > 10), ['vice', 'palm', 'sunset', 'neon', 'wave'].map((k) => V.sealAt(k, 0.8).ring.length).join(','));
  check('sealAt deterministic', JSON.stringify(V.sealAt('sunset', 0.8)) === JSON.stringify(V.sealAt('sunset', 0.8)));
  check('applySeal turns seal on at the seal', (() => { const s2 = {}; V.applySeal(s2, 'sunset', 0.5); return V.sealActive(s2) === true && s2.seal.seal === 'sunset' && s2.seal.size === 0.5; })());
  check('applySeal NaN size falls back to 0.8', (() => { const s2 = {}; V.applySeal(s2, 'neon', 'x'); return s2.seal.seal === 'neon' && s2.seal.size === 0.8; })());
  check('viceSeal template exists', !!V.TEMPLATES.viceSeal);
  const slApplied = V.applyTemplate(hState, 'viceSeal');
  V.redraw();
  check('applyTemplate viceSeal returns true', slApplied === true);
  check('template keeps keyart layout', hState.layout === 'keyart', hState.layout);
  check('template keeps skyline backdrop', hState.backdrop === 'skyline', hState.backdrop);
  check('template keeps sunset grade', hState.grade === 'sunset', hState.grade);
  check('template turns seal on at vice 80%', V.sealActive(hState) === true && hState.seal.seal === 'vice' && hState.seal.size === 0.8, JSON.stringify(hState.seal));
  check('template title is VICE CITY', hState.title === 'VICE CITY', hState.title);
  check('templateMatches viceSeal', V.templateMatches(hState, 'viceSeal') === true);
  check('templateMatches rejects wrong seal', V.templateMatches({ ...hState, seal: { on: true, seal: 'neon', size: 0.8 } }, 'viceSeal') === false);
  check('describeStateChange names a seal change', (() => {
    const a = { seal: { on: false, seal: 'vice', size: 0.8 } };
    const b = { seal: { on: true, seal: 'vice', size: 0.8 } };
    return V.describeStateChange(a, b) === 'Seal';
  })());
  check('snapshot/restore keeps seal', (() => {
    const snap = JSON.parse(JSON.stringify(hState.seal));
    hState.seal.on = false;
    hState.seal = JSON.parse(JSON.stringify(snap));
    return V.sealActive(hState) === true && hState.seal.seal === 'vice' && hState.seal.size === 0.8;
  })());
  const t41c1 = document.createElement('canvas'); t41c1.width = 480; t41c1.height = 270;
  const t41c2 = document.createElement('canvas'); t41c2.width = 480; t41c2.height = 270;
  const t41c3 = document.createElement('canvas'); t41c3.width = 480; t41c3.height = 270;
  const t41c4 = document.createElement('canvas'); t41c4.width = 480; t41c4.height = 270;
  const t41c5 = document.createElement('canvas'); t41c5.width = 480; t41c5.height = 270;
  const t41c6 = document.createElement('canvas'); t41c6.width = 480; t41c6.height = 270;
  V.drawCover(t41c1, { ...hState, seal: { on: false, seal: 'vice', size: 0.8 } });
  V.drawCover(t41c2, { ...hState });
  V.drawCover(t41c3, { ...hState, seal: { on: true, seal: 'neon', size: 0.8 } });
  V.drawCover(t41c4, { ...hState });
  V.drawCover(t41c5, { ...hState, seal: { on: true, seal: 'vice', size: 0.2 } });
  // v41 chip check: sign + tag + plate + emblem + shade + seal all on — the six chips
  // stack (seal above shade above emblem above plate above tag above sign) instead of sharing
  // one row, and the seal renders over the shade.
  V.drawCover(t41c6, { ...hState, sign: { on: true, sign: 'neon', size: 0.8 }, tag: { on: true, tag: 'vice', size: 0.8 }, plate: { on: true, plate: 'vice', size: 0.8 }, emblem: { on: true, emblem: 'vice', size: 0.8 }, shade: { on: true, shade: 'coconut', size: 0.8 }, seal: { on: true, seal: 'vice', size: 0.8 }, ticker: { on: false, story: 'heist', speed: 0.8 }, timeOfDay: { on: false, hour: 18.5 }, weather: { on: false, kind: 'clear', intensity: 0.8 }, era: { on: false, era: '1986', intensity: 0.8 }, district: { on: false, district: 'ocean', intensity: 0.8 }, moment: { on: false, moment: 'heist', intensity: 0.8 }, wanted: { on: false, level: 0 }, radio: { on: false, station: 'neonwave', volume: 0.8 }, map: { on: false, style: 'radar', zoom: 0.8 }, phone: { on: false, screen: 'messages', size: 0.8 }, cast: { on: false, cast: 'duo', size: 0.8 }, ride: { on: false, ride: 'coupe', size: 0.8 } });
  check('drawCover keyart with seal runs', sumPixels(t41c2) > 0, sumPixels(t41c2));
  check('seal changes the rendered pixels', sumPixels(t41c1) !== sumPixels(t41c2), sumPixels(t41c1) + ' vs ' + sumPixels(t41c2));
  check('neon differs from vice', sumPixels(t41c2) !== sumPixels(t41c3), sumPixels(t41c2) + ' vs ' + sumPixels(t41c3));
  check('size 0.2 differs from 0.8', sumPixels(t41c2) !== sumPixels(t41c5), sumPixels(t41c2) + ' vs ' + sumPixels(t41c5));
  check('seal render is deterministic', sumPixels(t41c2) === sumPixels(t41c4), sumPixels(t41c2) + ' vs ' + sumPixels(t41c4));
  check('sign+tag+plate+emblem+shade+seal all on renders', sumPixels(t41c6) > 0, sumPixels(t41c6));
  const t41blob = await V.exportCover({ ...hState }, 540, 540);
  check('exportCover seal returns a PNG blob', t41blob && t41blob.size > 10000, t41blob && t41blob.size);
  check('fs-seal fieldset exists', !!$('fs-seal'));
  check('seal controls exist', !!($('sealOn') && $('sealSize') && $('sealSizeVal') && document.querySelectorAll('.sealPreset').length === 5));
  check('sealOn reflects the template', $('sealOn').checked === true);
  check('UI readout follows the size', $('sealSizeVal').textContent.includes('VICE CLASSIC') && $('sealSizeVal').textContent.includes('80%'), $('sealSizeVal').textContent);
  document.querySelector('.sealPreset[data-seal="sunset"]').click();
  check('UI preset restyles to Sunset', V.state.seal.seal === 'sunset' && V.sealActive(V.state) === true, JSON.stringify(V.state.seal));
  check('UI preset re-syncs the readout', $('sealSizeVal').textContent.includes('SUNSET STRIP'), $('sealSizeVal').textContent);
  $('sealOn').click();
  check('UI uncheck turns seal off', V.sealActive(V.state) === false);
  $('sealOn').click();
  check('UI re-check turns seal on', V.sealActive(V.state) === true);

  // --- v1–v23 spot checks ---
  check('v23 template viceKeyArt exists', !!V.TEMPLATES.viceKeyArt);
  check('v24 template viceGoldenHour exists', !!V.TEMPLATES.viceGoldenHour);
  check('v25 template viceStorm exists', !!V.TEMPLATES.viceStorm);
  check('v26 template vice1986 exists', !!V.TEMPLATES.vice1986);
  check('v27 template viceOceanDrive exists', !!V.TEMPLATES.viceOceanDrive);
  check('v28 template viceSunsetHeist exists', !!V.TEMPLATES.viceSunsetHeist);
  check('v29 template viceFiveStar exists', !!V.TEMPLATES.viceFiveStar);
  check('v30 template viceRadio exists', !!V.TEMPLATES.viceRadio);
  check('v31 template viceMap exists', !!V.TEMPLATES.viceMap);
  check('v32 template vicePhone exists', !!V.TEMPLATES.vicePhone);
  check('v21 layout bottomheavy exists', V.LAYOUTS.bottomheavy && V.LAYOUTS.bottomheavy.panels === 3);
  check('v20 layout centerstage exists', V.LAYOUTS.centerstage && V.LAYOUTS.centerstage.panels === 3);
  check('v19 layout heroleft exists', V.LAYOUTS.heroleft && V.LAYOUTS.heroleft.panels === 3);
  check('v18 layouts splitscreen + quadgrid exist', !!V.LAYOUTS.splitscreen && !!V.LAYOUTS.quadgrid);
  check('v17 frames neon + vhs exist', !!V.FRAMES.neon && !!V.FRAMES.vhs);
  check('v20 frames gold + blueprint exist', !!V.FRAMES.gold && !!V.FRAMES.blueprint);
  check('v19 frames comic + retro exist', !!V.FRAMES.comic && !!V.FRAMES.retro);
  check('v21 template viceBottomHeavy exists', !!V.TEMPLATES.viceBottomHeavy);
  check('v22 template viceDoubleExposure exists', !!V.TEMPLATES.viceDoubleExposure);
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
    await shot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceKeyArt&furniture=1&furnitureIssue=08&bubbles=0`, { waitUntil: 'load' });
    await shot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const d = await shot.evaluate(() => ({
      layout: window.__viceState.layout, grade: window.__viceState.grade,
      furniture: window.__vice.furnitureActive(window.__viceState),
      issue: window.__viceState.furniture.issue,
    }));
    const okShot = d.layout === 'keyart' && d.grade === 'bluehour' && d.furniture === true && d.issue === '08';
    console.log(`${okShot ? 'PASS' : 'FAIL'}  shot param template=viceKeyArt&furniture=1 sets Key Art + furniture  :: ${JSON.stringify(d)}`);
    if (!okShot) failures++;
    const ed = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await ed.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceKeyArt&focus=furniture&bubbles=0`, { waitUntil: 'load' });
    await ed.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const vis = await ed.evaluate(() => {
      const r = document.getElementById('fs-furniture').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('furnitureOn').checked };
    });
    const okEd = vis.top >= -50 && vis.top < 1280 && vis.checked === true;
    console.log(`${okEd ? 'PASS' : 'FAIL'}  editor shot focus=furniture shows the fieldset, checked  :: ${JSON.stringify(vis)}`);
    if (!okEd) failures++;
    const clockShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await clockShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceGoldenHour&clock=21&bubbles=0`, { waitUntil: 'load' });
    await clockShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const cd = await clockShot.evaluate(() => ({
      layout: window.__viceState.layout, grade: window.__viceState.grade,
      clock: window.__vice.timeOfDayActive(window.__viceState),
      hour: window.__viceState.timeOfDay.hour,
      label: window.__vice.timeOfDayAt(window.__viceState.timeOfDay.hour).label,
    }));
    const okClock = cd.layout === 'keyart' && cd.grade === 'sunset' && cd.clock === true && cd.hour === 21 && cd.label === 'BLUE HOUR';
    console.log(`${okClock ? 'PASS' : 'FAIL'}  shot param template=viceGoldenHour&clock=21 sets Golden Hour + Blue Hour clock  :: ${JSON.stringify(cd)}`);
    if (!okClock) failures++;
    const edClock = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edClock.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceGoldenHour&focus=clock&bubbles=0`, { waitUntil: 'load' });
    await edClock.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visClock = await edClock.evaluate(() => {
      const r = document.getElementById('fs-clock').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('clockOn').checked, readout: document.getElementById('clockHourVal').textContent };
    });
    const okEdClock = visClock.top >= -50 && visClock.top < 1280 && visClock.checked === true && visClock.readout.includes('18:30');
    console.log(`${okEdClock ? 'PASS' : 'FAIL'}  editor shot focus=clock shows the fieldset, checked, 18:30  :: ${JSON.stringify(visClock)}`);
    if (!okEdClock) failures++;
    const weatherShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await weatherShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceStorm&weather=rain&weatherInt=40&bubbles=0`, { waitUntil: 'load' });
    await weatherShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const wd = await weatherShot.evaluate(() => ({
      layout: window.__viceState.layout, grade: window.__viceState.grade,
      weather: window.__vice.weatherActive(window.__viceState),
      kind: window.__viceState.weather.kind,
      intensity: window.__viceState.weather.intensity,
      label: window.__vice.weatherAt(window.__viceState.weather.kind, window.__viceState.weather.intensity).label,
    }));
    const okWeather = wd.layout === 'keyart' && wd.grade === 'bluehour' && wd.weather === true && wd.kind === 'rain' && wd.intensity === 0.4 && wd.label === 'RAIN';
    console.log(`${okWeather ? 'PASS' : 'FAIL'}  shot param template=viceStorm&weather=rain&weatherInt=40 sets Storm + Rain 40%  :: ${JSON.stringify(wd)}`);
    if (!okWeather) failures++;
    const edWeather = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edWeather.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceStorm&focus=weather&bubbles=0`, { waitUntil: 'load' });
    await edWeather.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visWeather = await edWeather.evaluate(() => {
      const r = document.getElementById('fs-weather').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('weatherOn').checked, readout: document.getElementById('weatherIntVal').textContent };
    });
    const okEdWeather = visWeather.top >= -50 && visWeather.top < 1280 && visWeather.checked === true && visWeather.readout.includes('STORM') && visWeather.readout.includes('80%');
    console.log(`${okEdWeather ? 'PASS' : 'FAIL'}  editor shot focus=weather shows the fieldset, checked, STORM 80%  :: ${JSON.stringify(visWeather)}`);
    if (!okEdWeather) failures++;
    const districtShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await districtShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceOceanDrive&district=havana&districtInt=40&bubbles=0`, { waitUntil: 'load' });
    await districtShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const dd = await districtShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      district: window.__vice.districtActive(window.__viceState),
      kind: window.__viceState.district.district,
      intensity: window.__viceState.district.intensity,
      label: window.__vice.districtAt(window.__viceState.district.district, window.__viceState.district.intensity).label,
    }));
    const okDistrict = dd.layout === 'keyart' && dd.backdrop === 'beach' && dd.district === true && dd.kind === 'havana' && dd.intensity === 0.4 && dd.label === 'LITTLE HAVANA';
    console.log(`${okDistrict ? 'PASS' : 'FAIL'}  shot param template=viceOceanDrive&district=havana&districtInt=40 sets Ocean Drive + Havana 40%  :: ${JSON.stringify(dd)}`);
    if (!okDistrict) failures++;
    const edDistrict = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edDistrict.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceOceanDrive&focus=district&bubbles=0`, { waitUntil: 'load' });
    await edDistrict.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visDistrict = await edDistrict.evaluate(() => {
      const r = document.getElementById('fs-district').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('districtOn').checked, readout: document.getElementById('districtIntVal').textContent };
    });
    const okEdDistrict = visDistrict.top >= -50 && visDistrict.top < 1280 && visDistrict.checked === true && visDistrict.readout.includes('OCEAN DRIVE') && visDistrict.readout.includes('80%');
    console.log(`${okEdDistrict ? 'PASS' : 'FAIL'}  editor shot focus=district shows the fieldset, checked, OCEAN DRIVE 80%  :: ${JSON.stringify(visDistrict)}`);
    if (!okEdDistrict) failures++;
    const momentShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await momentShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceSunsetHeist&moment=neonrain&momentInt=40&bubbles=0`, { waitUntil: 'load' });
    await momentShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const md = await momentShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop, grade: window.__viceState.grade,
      moment: window.__vice.momentActive(window.__viceState),
      kind: window.__viceState.moment.moment,
      intensity: window.__viceState.moment.intensity,
      hour: window.__viceState.timeOfDay.hour,
      weather: window.__viceState.weather.kind,
      era: window.__viceState.era.era,
      district: window.__viceState.district.district,
      label: window.__vice.momentAt(window.__viceState.moment.moment, window.__viceState.moment.intensity).label,
    }));
    const okMoment = md.layout === 'keyart' && md.backdrop === 'street' && md.grade === 'neon' && md.moment === true && md.kind === 'neonrain' && md.intensity === 0.4 && md.hour === 22 && md.weather === 'rain' && md.era === '1986' && md.district === 'ocean' && md.label === 'NEON RAIN 1986';
    console.log(`${okMoment ? 'PASS' : 'FAIL'}  shot param template=viceSunsetHeist&moment=neonrain&momentInt=40 conducts Neon Rain 40%  :: ${JSON.stringify(md)}`);
    if (!okMoment) failures++;
    const edMoment = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edMoment.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceSunsetHeist&focus=moment&bubbles=0`, { waitUntil: 'load' });
    await edMoment.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visMoment = await edMoment.evaluate(() => {
      const r = document.getElementById('fs-moment').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('momentOn').checked, readout: document.getElementById('momentIntVal').textContent };
    });
    const okEdMoment = visMoment.top >= -50 && visMoment.top < 1280 && visMoment.checked === true && visMoment.readout.includes('SUNSET HEIST') && visMoment.readout.includes('80%');
    console.log(`${okEdMoment ? 'PASS' : 'FAIL'}  editor shot focus=moment shows the fieldset, checked, SUNSET HEIST 80%  :: ${JSON.stringify(visMoment)}`);
    if (!okEdMoment) failures++;
    const mapShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await mapShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceMap&map=neon&mapZoom=40&bubbles=0`, { waitUntil: 'load' });
    await mapShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const mpd = await mapShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      map: window.__vice.mapActive(window.__viceState),
      style: window.__viceState.map.style,
      zoom: window.__viceState.map.zoom,
      label: window.__vice.mapAt(window.__viceState.map.style, window.__viceState.map.zoom).label,
    }));
    const okMap = mpd.layout === 'keyart' && mpd.backdrop === 'skyline' && mpd.map === true && mpd.style === 'neon' && mpd.zoom === 0.4 && mpd.label === 'NEON';
    console.log(`${okMap ? 'PASS' : 'FAIL'}  shot param template=viceMap&map=neon&mapZoom=40 sets Map + Neon 40%  :: ${JSON.stringify(mpd)}`);
    if (!okMap) failures++;
    const edMap = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edMap.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceMap&focus=map&bubbles=0`, { waitUntil: 'load' });
    await edMap.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visMap = await edMap.evaluate(() => {
      const r = document.getElementById('fs-map').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('mapOn').checked, readout: document.getElementById('mapZoomVal').textContent };
    });
    const okEdMap = visMap.top >= -50 && visMap.top < 1280 && visMap.checked === true && visMap.readout.includes('RADAR') && visMap.readout.includes('80%');
    console.log(`${okEdMap ? 'PASS' : 'FAIL'}  editor shot focus=map shows the fieldset, checked, RADAR 80%  :: ${JSON.stringify(visMap)}`);
    if (!okEdMap) failures++;
    const phoneShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await phoneShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=vicePhone&phone=calls&phoneSize=40&bubbles=0`, { waitUntil: 'load' });
    await phoneShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const phd = await phoneShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      phone: window.__vice.phoneActive(window.__viceState),
      screen: window.__viceState.phone.screen,
      size: window.__viceState.phone.size,
      label: window.__vice.phoneAt(window.__viceState.phone.screen, window.__viceState.phone.size).label,
    }));
    const okPhone = phd.layout === 'keyart' && phd.backdrop === 'skyline' && phd.phone === true && phd.screen === 'calls' && phd.size === 0.4 && phd.label === 'CALLS';
    console.log(`${okPhone ? 'PASS' : 'FAIL'}  shot param template=vicePhone&phone=calls&phoneSize=40 sets Phone + Calls 40%  :: ${JSON.stringify(phd)}`);
    if (!okPhone) failures++;
    const edPhone = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edPhone.goto(`http://127.0.0.1:${port}/?shot=editor&template=vicePhone&focus=phone&bubbles=0`, { waitUntil: 'load' });
    await edPhone.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visPhone = await edPhone.evaluate(() => {
      const r = document.getElementById('fs-phone').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('phoneOn').checked, readout: document.getElementById('phoneSizeVal').textContent };
    });
    const okEdPhone = visPhone.top >= -50 && visPhone.top < 1280 && visPhone.checked === true && visPhone.readout.includes('MESSAGES') && visPhone.readout.includes('80%');
    console.log(`${okEdPhone ? 'PASS' : 'FAIL'}  editor shot focus=phone shows the fieldset, checked, MESSAGES 80%  :: ${JSON.stringify(visPhone)}`);
    if (!okEdPhone) failures++;
    const tickerShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await tickerShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceTicker&ticker=storm&tickerSpeed=40&bubbles=0`, { waitUntil: 'load' });
    await tickerShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const tkd = await tickerShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      ticker: window.__vice.tickerActive(window.__viceState),
      story: window.__viceState.ticker.story,
      speed: window.__viceState.ticker.speed,
      label: window.__vice.tickerAt(window.__viceState.ticker.story, window.__viceState.ticker.speed).label,
    }));
    const okTicker = tkd.layout === 'keyart' && tkd.backdrop === 'skyline' && tkd.ticker === true && tkd.story === 'storm' && tkd.speed === 0.4 && tkd.label === 'STORM';
    console.log(`${okTicker ? 'PASS' : 'FAIL'}  shot param template=viceTicker&ticker=storm&tickerSpeed=40 sets Ticker + Storm 40%  :: ${JSON.stringify(tkd)}`);
    if (!okTicker) failures++;
    const edTicker = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edTicker.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceTicker&focus=ticker&bubbles=0`, { waitUntil: 'load' });
    await edTicker.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visTicker = await edTicker.evaluate(() => {
      const r = document.getElementById('fs-ticker').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('tickerOn').checked, readout: document.getElementById('tickerSpeedVal').textContent };
    });
    const okEdTicker = visTicker.top >= -50 && visTicker.top < 1280 && visTicker.checked === true && visTicker.readout.includes('BREAKING') && visTicker.readout.includes('80%');
    console.log(`${okEdTicker ? 'PASS' : 'FAIL'}  editor shot focus=ticker shows the fieldset, checked, BREAKING 80%  :: ${JSON.stringify(visTicker)}`);
    if (!okEdTicker) failures++;
    const castShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await castShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceCast&cast=detective&castSize=40&bubbles=0`, { waitUntil: 'load' });
    await castShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const cdCast = await castShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      cast: window.__vice.castActive(window.__viceState),
      castName: window.__viceState.cast.cast,
      size: window.__viceState.cast.size,
      label: window.__vice.castAt(window.__viceState.cast.cast, window.__viceState.cast.size).label,
    }));
    const okCast = cdCast.layout === 'keyart' && cdCast.backdrop === 'skyline' && cdCast.cast === true && cdCast.castName === 'detective' && cdCast.size === 0.4 && cdCast.label === 'DETECTIVE';
    console.log(`${okCast ? 'PASS' : 'FAIL'}  shot param template=viceCast&cast=detective&castSize=40 sets Cast + Detective 40%  :: ${JSON.stringify(cdCast)}`);
    if (!okCast) failures++;
    const edCast = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edCast.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceCast&focus=cast&bubbles=0`, { waitUntil: 'load' });
    await edCast.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visCast = await edCast.evaluate(() => {
      const r = document.getElementById('fs-cast').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('castOn').checked, readout: document.getElementById('castSizeVal').textContent };
    });
    const okEdCast = visCast.top >= -50 && visCast.top < 1280 && visCast.checked === true && visCast.readout.includes('DUO') && visCast.readout.includes('80%');
    console.log(`${okEdCast ? 'PASS' : 'FAIL'}  editor shot focus=cast shows the fieldset, checked, DUO 80%  :: ${JSON.stringify(visCast)}`);
    if (!okEdCast) failures++;
    const rideShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await rideShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceRide&ride=muscle&rideSize=40&bubbles=0`, { waitUntil: 'load' });
    await rideShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const rd = await rideShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      ride: window.__vice.rideActive(window.__viceState),
      rideName: window.__viceState.ride.ride,
      size: window.__viceState.ride.size,
      label: window.__vice.rideAt(window.__viceState.ride.ride, window.__viceState.ride.size).label,
    }));
    const okRide = rd.layout === 'keyart' && rd.backdrop === 'skyline' && rd.ride === true && rd.rideName === 'muscle' && rd.size === 0.4 && rd.label === 'MUSCLE';
    console.log(`${okRide ? 'PASS' : 'FAIL'}  shot param template=viceRide&ride=muscle&rideSize=40 sets Ride + Muscle 40%  :: ${JSON.stringify(rd)}`);
    if (!okRide) failures++;
    const edRide = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edRide.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceRide&focus=ride&bubbles=0`, { waitUntil: 'load' });
    await edRide.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visRide = await edRide.evaluate(() => {
      const r = document.getElementById('fs-ride').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('rideOn').checked, readout: document.getElementById('rideSizeVal').textContent };
    });
    const okEdRide = visRide.top >= -50 && visRide.top < 1280 && visRide.checked === true && visRide.readout.includes('COUPE') && visRide.readout.includes('80%');
    console.log(`${okEdRide ? 'PASS' : 'FAIL'}  editor shot focus=ride shows the fieldset, checked, COUPE 80%  :: ${JSON.stringify(visRide)}`);
    if (!okEdRide) failures++;
    const signShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await signShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceNeonSign&sign=ocean&signSize=40&bubbles=0`, { waitUntil: 'load' });
    await signShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const sd = await signShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      sign: window.__vice.signActive(window.__viceState),
      signName: window.__viceState.sign.sign,
      size: window.__viceState.sign.size,
      label: window.__vice.signAt(window.__viceState.sign.sign, window.__viceState.sign.size).label,
    }));
    const okSign = sd.layout === 'keyart' && sd.backdrop === 'skyline' && sd.sign === true && sd.signName === 'ocean' && sd.size === 0.4 && sd.label === 'OCEAN DRIVE';
    console.log(`${okSign ? 'PASS' : 'FAIL'}  shot param template=viceNeonSign&sign=ocean&signSize=40 sets Sign + Ocean Drive 40%  :: ${JSON.stringify(sd)}`);
    if (!okSign) failures++;
    const edSign = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edSign.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceNeonSign&focus=sign&bubbles=0`, { waitUntil: 'load' });
    await edSign.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visSign = await edSign.evaluate(() => {
      const r = document.getElementById('fs-sign').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('signOn').checked, readout: document.getElementById('signSizeVal').textContent };
    });
    const okEdSign = visSign.top >= -50 && visSign.top < 1280 && visSign.checked === true && visSign.readout.includes('NEON NIGHTS') && visSign.readout.includes('80%');
    console.log(`${okEdSign ? 'PASS' : 'FAIL'}  editor shot focus=sign shows the fieldset, checked, NEON NIGHTS 80%  :: ${JSON.stringify(visSign)}`);
    if (!okEdSign) failures++;
    const tagShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await tagShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceTag&tag=gold&tagSize=40&bubbles=0`, { waitUntil: 'load' });
    await tagShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const td = await tagShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      tag: window.__vice.tagActive(window.__viceState),
      tagName: window.__viceState.tag.tag,
      size: window.__viceState.tag.size,
      label: window.__vice.tagAt(window.__viceState.tag.tag, window.__viceState.tag.size).label,
    }));
    const okTag = td.layout === 'keyart' && td.backdrop === 'skyline' && td.tag === true && td.tagName === 'gold' && td.size === 0.4 && td.label === 'GOLD';
    console.log(`${okTag ? 'PASS' : 'FAIL'}  shot param template=viceTag&tag=gold&tagSize=40 sets Tag + Gold 40%  :: ${JSON.stringify(td)}`);
    if (!okTag) failures++;
    const edTag = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edTag.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceTag&focus=tag&bubbles=0`, { waitUntil: 'load' });
    await edTag.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visTag = await edTag.evaluate(() => {
      const r = document.getElementById('fs-tag').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('tagOn').checked, readout: document.getElementById('tagSizeVal').textContent };
    });
    const okEdTag = visTag.top >= -50 && visTag.top < 1280 && visTag.checked === true && visTag.readout.includes('VICE') && visTag.readout.includes('80%');
    console.log(`${okEdTag ? 'PASS' : 'FAIL'}  editor shot focus=tag shows the fieldset, checked, VICE 80%  :: ${JSON.stringify(visTag)}`);
    if (!okEdTag) failures++;
    const plateShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await plateShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=vicePlate&plate=gold&plateSize=40&bubbles=0`, { waitUntil: 'load' });
    await plateShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const pd = await plateShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      plate: window.__vice.plateActive(window.__viceState),
      plateName: window.__viceState.plate.plate,
      size: window.__viceState.plate.size,
      label: window.__vice.plateAt(window.__viceState.plate.plate, window.__viceState.plate.size).label,
    }));
    const okPlate = pd.layout === 'keyart' && pd.backdrop === 'skyline' && pd.plate === true && pd.plateName === 'gold' && pd.size === 0.4 && pd.label === 'GOLD-24';
    console.log(`${okPlate ? 'PASS' : 'FAIL'}  shot param template=vicePlate&plate=gold&plateSize=40 sets Plate + Gold-24 40%  :: ${JSON.stringify(pd)}`);
    if (!okPlate) failures++;
    const edPlate = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edPlate.goto(`http://127.0.0.1:${port}/?shot=editor&template=vicePlate&focus=plate&bubbles=0`, { waitUntil: 'load' });
    await edPlate.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visPlate = await edPlate.evaluate(() => {
      const r = document.getElementById('fs-plate').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('plateOn').checked, readout: document.getElementById('plateSizeVal').textContent };
    });
    const okEdPlate = visPlate.top >= -50 && visPlate.top < 1280 && visPlate.checked === true && visPlate.readout.includes('VICE-86') && visPlate.readout.includes('80%');
    console.log(`${okEdPlate ? 'PASS' : 'FAIL'}  editor shot focus=plate shows the fieldset, checked, VICE-86 80%  :: ${JSON.stringify(visPlate)}`);
    if (!okEdPlate) failures++;
    const emblemShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await emblemShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceEmblem&emblem=sunset&emblemSize=40&bubbles=0`, { waitUntil: 'load' });
    await emblemShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const emd = await emblemShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      emblem: window.__vice.emblemActive(window.__viceState),
      emblemName: window.__viceState.emblem.emblem,
      size: window.__viceState.emblem.size,
      label: window.__vice.emblemAt(window.__viceState.emblem.emblem, window.__viceState.emblem.size).label,
    }));
    const okEmblem = emd.layout === 'keyart' && emd.backdrop === 'skyline' && emd.emblem === true && emd.emblemName === 'sunset' && emd.size === 0.4 && emd.label === 'SUNSET STRIP';
    console.log(`${okEmblem ? 'PASS' : 'FAIL'}  shot param template=viceEmblem&emblem=sunset&emblemSize=40 sets Emblem + Sunset Strip 40%  :: ${JSON.stringify(emd)}`);
    if (!okEmblem) failures++;
    const edEmblem = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edEmblem.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceEmblem&focus=emblem&bubbles=0`, { waitUntil: 'load' });
    await edEmblem.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visEmblem = await edEmblem.evaluate(() => {
      const r = document.getElementById('fs-emblem').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('emblemOn').checked, readout: document.getElementById('emblemSizeVal').textContent };
    });
    const okEdEmblem = visEmblem.top >= -50 && visEmblem.top < 1280 && visEmblem.checked === true && visEmblem.readout.includes('VICE CLASSIC') && visEmblem.readout.includes('80%');
    console.log(`${okEdEmblem ? 'PASS' : 'FAIL'}  editor shot focus=emblem shows the fieldset, checked, VICE CLASSIC 80%  :: ${JSON.stringify(visEmblem)}`);
    if (!okEdEmblem) failures++;
    const shadeShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await shadeShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=vicePalmShade&shade=banana&shadeSize=40&bubbles=0`, { waitUntil: 'load' });
    await shadeShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const shd = await shadeShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      shade: window.__vice.shadeActive(window.__viceState),
      shadeName: window.__viceState.shade.shade,
      size: window.__viceState.shade.size,
      label: window.__vice.shadeAt(window.__viceState.shade.shade, window.__viceState.shade.size).label,
    }));
    const okShade = shd.layout === 'keyart' && shd.backdrop === 'skyline' && shd.shade === true && shd.shadeName === 'banana' && shd.size === 0.4 && shd.label === 'BANANA LEAVES';
    console.log(`${okShade ? 'PASS' : 'FAIL'}  shot param template=vicePalmShade&shade=banana&shadeSize=40 sets Shade + Banana Leaves 40%  :: ${JSON.stringify(shd)}`);
    if (!okShade) failures++;
    const edShade = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edShade.goto(`http://127.0.0.1:${port}/?shot=editor&template=vicePalmShade&focus=shade&bubbles=0`, { waitUntil: 'load' });
    await edShade.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visShade = await edShade.evaluate(() => {
      const r = document.getElementById('fs-shade').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('shadeOn').checked, readout: document.getElementById('shadeSizeVal').textContent };
    });
    const okEdShade = visShade.top >= -50 && visShade.top < 1280 && visShade.checked === true && visShade.readout.includes('COCONUT FRONDS') && visShade.readout.includes('80%');
    console.log(`${okEdShade ? 'PASS' : 'FAIL'}  editor shot focus=shade shows the fieldset, checked, COCONUT FRONDS 80%  :: ${JSON.stringify(visShade)}`);
    if (!okEdShade) failures++;
    const sealShot = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await sealShot.goto(`http://127.0.0.1:${port}/?shot=cover&template=viceSeal&seal=sunset&sealSize=40&bubbles=0`, { waitUntil: 'load' });
    await sealShot.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const sld = await sealShot.evaluate(() => ({
      layout: window.__viceState.layout, backdrop: window.__viceState.backdrop,
      seal: window.__vice.sealActive(window.__viceState),
      sealName: window.__viceState.seal.seal,
      size: window.__viceState.seal.size,
      label: window.__vice.sealAt(window.__viceState.seal.seal, window.__viceState.seal.size).label,
    }));
    const okSeal = sld.layout === 'keyart' && sld.backdrop === 'skyline' && sld.seal === true && sld.sealName === 'sunset' && sld.size === 0.4 && sld.label === 'SUNSET STRIP';
    console.log(`${okSeal ? 'PASS' : 'FAIL'}  shot param template=viceSeal&seal=sunset&sealSize=40 sets Seal + Sunset Strip 40%  :: ${JSON.stringify(sld)}`);
    if (!okSeal) failures++;
    const edSeal = await browser.newPage({ viewport: { width: 1280, height: 1280 } });
    await edSeal.goto(`http://127.0.0.1:${port}/?shot=editor&template=viceSeal&focus=seal&bubbles=0`, { waitUntil: 'load' });
    await edSeal.waitForFunction(() => window.__shotReady === true, null, { timeout: 30000 });
    const visSeal = await edSeal.evaluate(() => {
      const r = document.getElementById('fs-seal').getBoundingClientRect();
      return { top: Math.round(r.top), height: Math.round(r.height), checked: document.getElementById('sealOn').checked, readout: document.getElementById('sealSizeVal').textContent };
    });
    const okEdSeal = visSeal.top >= -50 && visSeal.top < 1280 && visSeal.checked === true && visSeal.readout.includes('VICE CLASSIC') && visSeal.readout.includes('80%');
    console.log(`${okEdSeal ? 'PASS' : 'FAIL'}  editor shot focus=seal shows the fieldset, checked, VICE CLASSIC 80%  :: ${JSON.stringify(visSeal)}`);
    if (!okEdSeal) failures++;
    console.log(`\n${results.length + 32} checks, ${failures} failed`);
  } finally {
    await browser.close();
    server.close();
  }
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
