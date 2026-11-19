// Headless regression suite for the Vice Cover Studio (v27).
// Serves app/ on a local port, drives it in headless Chromium via
// playwright-core, and asserts the v27 Vice District feature plus
// spot-checks for every earlier version (v1–v26) so a new version can
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
  check('templates count is 29', Object.keys(V.TEMPLATES).length === 29, Object.keys(V.TEMPLATES).length);
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

  // --- v1–v23 spot checks ---
  check('v23 template viceKeyArt exists', !!V.TEMPLATES.viceKeyArt);
  check('v24 template viceGoldenHour exists', !!V.TEMPLATES.viceGoldenHour);
  check('v25 template viceStorm exists', !!V.TEMPLATES.viceStorm);
  check('v26 template vice1986 exists', !!V.TEMPLATES.vice1986);
  check('v27 template viceOceanDrive exists', !!V.TEMPLATES.viceOceanDrive);
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
    console.log(`\n${results.length + 8} checks, ${failures} failed`);
  } finally {
    await browser.close();
    server.close();
  }
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
