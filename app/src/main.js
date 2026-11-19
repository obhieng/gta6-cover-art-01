// Vice Palette Cover Studio — page wiring (v8).
// Uploads stay local (FileReader only, nothing is sent anywhere), the two
// bundled samples load by default, and every control re-renders the live
// preview canvas. `?shot=` sets up a fixed scene for screenshots.
// v3 adds: one-click Looks, title engine v2 controls, treatments, the
// before/after compare slider, Surprise me + undo history (20 steps).
// v4 adds: Series mode (3 covers, one theme), Photo Lab (blur / spotlight /
// color-pop / vintage film), a template gallery with painted thumbnails, and
// a 3-step guided wizard — all on top of v1/v2/v3, nothing removed.
// v5 adds: Procedural Art Kit controls, speech/thought bubbles (editable,
// draggable on the canvas), save/load project (JSON + localStorage autosave).
// v6 adds: the Darkroom (draggable tone curves, light sliders, per-channel
// HSL, Golden/Blue Hour presets) and Smart Suggest (pixel-based grade +
// layout + title recommendations).
// v7 adds: Glitch / CRT effects (chromatic aberration, scanlines, tracking
// noise, glitch slices, title RGB shift), Auto-caption (deterministic
// titles from the photo reading), procedural stickers (draggable, up to 6),
// and a 4th export size (1080x1920 story).
// v8 adds: Custom Palette Builder (extract 5 dominant colours from the
// photo, pick 3 stops, save up to 4 palettes), the Moodboard layout,
// Cover of the Day (deterministic daily remix), and a contact-sheet export.
import {
  drawCover, exportCover, exportSeries, EXPORT_SIZES, GRADES, LAYOUTS, BACKDROPS,
  TREATMENTS, TITLE_STYLES, LOOKS, applyLook, snapshotState, restoreState,
  defaultState, layoutPanels, TEMPLATES, applyTemplate, templateMatches,
  COLORPOPS, FILMS, ART_ELEMENTS, BUBBLE_STYLES, BUBBLE_KINDS, defaultArt,
  defaultBubbles, serializeProject, deserializeProject, layoutBubbles,
  DARKROOM_CHANNELS, HSL_CHANNELS, defaultDarkroom, applyDarkroomPreset,
  darkroomActive, analyzePhoto, suggestCovers,
  defaultGlitch, glitchActive, STICKER_KINDS, defaultStickers,
  layoutStickers, suggestCaptions,
  PALETTE_PRESETS, extractPalette, defaultPalette, coverOfTheDay,
  applyCoverOfTheDay, exportContactSheet, CONTACT_SHEET,
} from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const state = defaultState();
let selectedPanel = 0;

// Exposed for the headless regression test (read-only use in tests, plus
// the redraw / export / analysis entry points so the test can drive the app).
window.__viceState = state;
window.__vice = {
  state, redraw: () => redraw(), exportCover, exportSeries,
  analyzePhoto, suggestCovers, serializeProject, deserializeProject,
  applyDarkroomPreset, darkroomActive, suggestCaptions, glitchActive,
  extractPalette, coverOfTheDay, applyCoverOfTheDay, exportContactSheet,
  PALETTE_PRESETS, CONTACT_SHEET,
};

const $ = (id) => document.getElementById(id);

// --- Undo history -----------------------------------------------------------
// A snapshot is pushed at the START of each user gesture (button click, or
// pointerdown/focus on a slider, checkbox, select or text field), so the
// stored state is always the pre-change one. Identical consecutive snapshots
// are skipped, so one gesture never pushes twice.
const history = [];
let lastSnapJson = '';
function pushHistory() {
  const snap = snapshotState(state);
  const json = JSON.stringify(snap);
  if (json === lastSnapJson) return;
  lastSnapJson = json;
  history.push(snap);
  if (history.length > 20) history.shift();
}
function undo() {
  const snap = history.pop();
  if (!snap) {
    status.textContent = 'Nothing to undo yet — change something first.';
    return;
  }
  lastSnapJson = '';
  restoreState(state, snap);
  syncAll();
  redraw();
  status.textContent = 'Undid the last change.';
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  drawCover(canvas, state);
  syncPanelControls();
  syncSeriesStrip();
  scheduleAutosave();
}

// Series mode (v4): when on, the square + portrait variants render live
// beside the main cover, each in its own variant layout, same theme.
function syncSeriesStrip() {
  const strip = $('seriesStrip');
  strip.hidden = !state.series;
  if (!state.series) return;
  const layouts = state.seriesLayouts || ['magazine', 'triptych'];
  drawCover($('coverSquare'), { ...state, compare: 1, layout: layouts[0] || 'magazine' });
  drawCover($('coverPortrait'), { ...state, compare: 1, layout: layouts[1] || 'triptych' });
}

// --- Project autosave (v5) -------------------------------------------------
// Every redraw schedules a debounced save of the serializable state to
// localStorage (photos included as data URLs, via state.photoData). Restored
// once at boot, before the samples load. Shot mode (?shot=) still wins: the
// shot scene applies its own settings after loadDefaults.
const AUTOSAVE_KEY = 'viceCanvasProject.v8';
const AUTOSAVE_KEY_V7 = 'viceCanvasProject.v7';
const AUTOSAVE_KEY_V6 = 'viceCanvasProject.v6';
const AUTOSAVE_KEY_V5 = 'viceCanvasProject.v5';
let autosaveTimer = null;
function scheduleAutosave() {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(serializeProject(state)));
      const el = $('autosaveStatus');
      if (el) el.textContent = `Autosave: on — saved ${new Date().toLocaleTimeString()}.`;
    } catch {
      // Private mode / full storage: autosave is a convenience, never fatal.
    }
  }, 600);
}

function restoreAutosave() {
  let raw = null;
  // v7 first, then v6/v5 autosaves (their state has no glitch/stickers or
  // no darkroom — restoreState keeps the defaults, so an older cover still
  // comes back intact).
  try { raw = localStorage.getItem(AUTOSAVE_KEY) || localStorage.getItem(AUTOSAVE_KEY_V7) || localStorage.getItem(AUTOSAVE_KEY_V6) || localStorage.getItem(AUTOSAVE_KEY_V5); } catch { return false; }
  if (!raw) return false;
  try {
    const { state: saved, photoData } = deserializeProject(JSON.parse(raw));
    restoreState(state, saved);
    state.photoData = (photoData || [null, null, null]).slice(0, 3);
    return true;
  } catch {
    return false;
  }
}

// --- Procedural Art Kit controls (v5) ---------------------------------------
// One row per element: on/off, opacity, colour, horizontal position, scale.
function buildArtKit() {
  const wrap = $('artKit');
  wrap.innerHTML = '';
  for (const { key, label } of ART_ELEMENTS) {
    const row = document.createElement('div');
    row.className = 'art-row';
    row.dataset.element = key;
    const check = document.createElement('label');
    check.className = 'check art-name';
    check.innerHTML = `<input type="checkbox" data-art="${key}" data-field="on"> ${label}`;
    const opacity = document.createElement('label');
    opacity.innerHTML = `Opacity <span data-art-val="${key}-opacity"></span><input type="range" min="0" max="1" step="0.05" value="0.5" data-art="${key}" data-field="opacity">`;
    const color = document.createElement('label');
    color.innerHTML = `Colour <input type="color" value="#ffb400" data-art="${key}" data-field="color">`;
    const pos = document.createElement('label');
    pos.innerHTML = `Position <input type="range" min="0" max="1" step="0.05" value="0.5" data-art="${key}" data-field="x">`;
    const scale = document.createElement('label');
    scale.innerHTML = `Scale <input type="range" min="0.5" max="1.6" step="0.1" value="1" data-art="${key}" data-field="scale">`;
    row.append(check, opacity, color, pos, scale);
    wrap.appendChild(row);
  }
  wrap.querySelectorAll('input[data-art]').forEach((el) => {
    el.addEventListener('pointerdown', pushHistory);
    el.addEventListener('focus', pushHistory);
    el.addEventListener('input', (e) => {
      const key = e.target.dataset.art;
      const field = e.target.dataset.field;
      const art = state.art[key];
      if (!art) return;
      if (field === 'on') art.on = e.target.checked;
      else if (field === 'color') art.color = e.target.value;
      else art[field] = Number(e.target.value);
      syncArtKitValues();
      redraw();
    });
    el.addEventListener('change', (e) => {
      if (e.target.dataset.field === 'on') {
        status.textContent = `${ART_ELEMENTS.find((a) => a.key === e.target.dataset.art)?.label || 'Art'} ${e.target.checked ? 'on' : 'off'}.`;
      }
    });
  });
}

function syncArtKitValues() {
  document.querySelectorAll('#artKit input[data-art]').forEach((el) => {
    const art = state.art[el.dataset.art];
    if (!art) return;
    const field = el.dataset.field;
    if (field === 'on') el.checked = !!art.on;
    else if (field === 'color') el.value = art.color || '#ffb400';
    else el.value = String(art[field] == null ? (field === 'scale' ? 1 : 0.5) : art[field]);
    const val = document.querySelector(`[data-art-val="${el.dataset.art}-opacity"]`);
    if (val && field === 'opacity') val.textContent = `${Math.round((art.opacity || 0) * 100)}%`;
  });
}

// --- Speech bubbles controls (v5) -------------------------------------------
// One row per bubble: text, kind, style, size, remove. Dragging happens on
// the preview canvas. The list is NOT rebuilt while the user is typing in it.
function buildBubbleList() {
  const wrap = $('bubbleList');
  const active = document.activeElement;
  if (wrap.contains(active)) return;
  wrap.innerHTML = '';
  (state.bubbles || []).forEach((b, i) => {
    const row = document.createElement('div');
    row.className = 'bubble-row';
    row.dataset.index = String(i);
    const text = document.createElement('input');
    text.type = 'text';
    text.maxLength = 48;
    text.value = b.text || '';
    text.placeholder = 'Bubble text…';
    text.setAttribute('aria-label', `Bubble ${i + 1} text`);
    text.addEventListener('input', (e) => { b.text = e.target.value; redraw(); });
    text.addEventListener('pointerdown', pushHistory);
    text.addEventListener('focus', pushHistory);
    const kind = document.createElement('select');
    kind.setAttribute('aria-label', `Bubble ${i + 1} kind`);
    for (const [k, def] of Object.entries(BUBBLE_KINDS)) {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = def.label;
      if (b.kind === k) o.selected = true;
      kind.appendChild(o);
    }
    kind.addEventListener('change', (e) => { pushHistory(); b.kind = e.target.value; redraw(); });
    const style = document.createElement('select');
    style.setAttribute('aria-label', `Bubble ${i + 1} style`);
    for (const [k, def] of Object.entries(BUBBLE_STYLES)) {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = def.label;
      if (b.style === k) o.selected = true;
      style.appendChild(o);
    }
    style.addEventListener('change', (e) => { pushHistory(); b.style = e.target.value; redraw(); });
    const size = document.createElement('input');
    size.type = 'range';
    size.min = '0.6';
    size.max = '1.6';
    size.step = '0.1';
    size.value = String(b.size || 1);
    size.setAttribute('aria-label', `Bubble ${i + 1} size`);
    size.addEventListener('input', (e) => { b.size = Number(e.target.value); redraw(); });
    size.addEventListener('pointerdown', pushHistory);
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '✕';
    del.setAttribute('aria-label', `Remove bubble ${i + 1}`);
    del.addEventListener('click', () => {
      pushHistory();
      state.bubbles.splice(i, 1);
      buildBubbleList();
      redraw();
      status.textContent = 'Bubble removed.';
    });
    row.append(text, kind, style, size, del);
    wrap.appendChild(row);
  });
  if (!(state.bubbles || []).length) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = 'No bubbles yet — add one, type the line, then drag it on the preview.';
    wrap.appendChild(p);
  }
}

// --- Darkroom controls (v6) -------------------------------------------------
// Sliders, per-channel HSL rows and the draggable tone-curve canvas. Every
// control re-renders the live preview; the curve editor edits the control
// points of the selected channel directly in state.darkroom.curves.
const DARKROOM_SLIDERS = [
  { key: 'exposure', label: 'Exposure', min: -2, max: 2, step: 0.05, fmt: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)} EV` },
  { key: 'contrast', label: 'Contrast', min: -1, max: 1, step: 0.05, fmt: (v) => `${v >= 0 ? '+' : ''}${Math.round(v * 100)}%` },
  { key: 'saturation', label: 'Saturation', min: -1, max: 1, step: 0.05, fmt: (v) => `${v >= 0 ? '+' : ''}${Math.round(v * 100)}%` },
  { key: 'temperature', label: 'Temperature', min: -1, max: 1, step: 0.05, fmt: (v) => (v > 0 ? `Warm +${Math.round(v * 100)}%` : v < 0 ? `Cool ${Math.round(-v * 100)}%` : 'Neutral') },
  { key: 'highlights', label: 'Highlights', min: -1, max: 1, step: 0.05, fmt: (v) => `${v >= 0 ? '+' : ''}${Math.round(v * 100)}%` },
  { key: 'shadows', label: 'Shadows', min: -1, max: 1, step: 0.05, fmt: (v) => `${v >= 0 ? '+' : ''}${Math.round(v * 100)}%` },
  { key: 'sharpen', label: 'Sharpen', min: 0, max: 1, step: 0.05, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: 'clarity', label: 'Clarity', min: 0, max: 1, step: 0.05, fmt: (v) => `${Math.round(v * 100)}%` },
];

let curveChannel = 'luma';

function buildDarkroomSliders() {
  const wrap = $('darkroomSliders');
  wrap.innerHTML = '';
  for (const def of DARKROOM_SLIDERS) {
    const row = document.createElement('label');
    row.className = 'dr-row';
    row.innerHTML = `${def.label} <span data-dr-val="${def.key}"></span><input type="range" min="${def.min}" max="${def.max}" step="${def.step}" value="0" data-dr="${def.key}" aria-label="${def.label}">`;
    wrap.appendChild(row);
  }
  wrap.querySelectorAll('input[data-dr]').forEach((el) => {
    el.addEventListener('pointerdown', pushHistory);
    el.addEventListener('focus', pushHistory);
    el.addEventListener('input', (e) => {
      state.darkroom[e.target.dataset.dr] = Number(e.target.value);
      syncDarkroomValues();
      redraw();
    });
  });
}

function buildHslRows() {
  const wrap = $('darkroomHsl');
  wrap.innerHTML = '';
  const head = document.createElement('p');
  head.className = 'hint';
  head.textContent = 'HSL per colour — shift one colour family\u2019s hue and saturation without touching the rest.';
  wrap.appendChild(head);
  for (const ch of HSL_CHANNELS) {
    const row = document.createElement('div');
    row.className = 'hsl-row';
    row.innerHTML = `<span>${ch.label}</span>`
      + `<label>Hue <span data-hsl-val="${ch.key}-hue"></span><input type="range" min="-30" max="30" step="1" value="0" data-hsl="${ch.key}" data-field="hue" aria-label="${ch.label} hue shift"></label>`
      + `<label>Sat <span data-hsl-val="${ch.key}-sat"></span><input type="range" min="-1" max="1" step="0.05" value="0" data-hsl="${ch.key}" data-field="sat" aria-label="${ch.label} saturation"></label>`;
    wrap.appendChild(row);
  }
  wrap.querySelectorAll('input[data-hsl]').forEach((el) => {
    el.addEventListener('pointerdown', pushHistory);
    el.addEventListener('focus', pushHistory);
    el.addEventListener('input', (e) => {
      const adj = state.darkroom.hsl[e.target.dataset.hsl];
      if (!adj) return;
      adj[e.target.dataset.field] = Number(e.target.value);
      syncDarkroomValues();
      redraw();
    });
  });
}

function buildCurveChannelButtons() {
  const wrap = $('curveChannelPick');
  wrap.innerHTML = '';
  for (const [key, def] of Object.entries(DARKROOM_CHANNELS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = def.label;
    b.classList.toggle('active', curveChannel === key);
    b.addEventListener('click', () => {
      curveChannel = key;
      buildCurveChannelButtons();
      drawToneCurve();
    });
    wrap.appendChild(b);
  }
}

const CURVE_COLORS = { luma: '#ffffff', red: '#ff6b6b', green: '#7cff6b', blue: '#6bb8ff' };

function drawToneCurve() {
  const c = $('toneCurve');
  const ctx = c.getContext('2d');
  const W = c.width;
  const H = c.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#1a0e2e';
  ctx.fillRect(0, 0, W, H);
  // Grid + diagonal reference.
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo((W / 4) * i, 0); ctx.lineTo((W / 4) * i, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, (H / 4) * i); ctx.lineTo(W, (H / 4) * i); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(W, 0); ctx.stroke();
  ctx.setLineDash([]);
  const pts = (state.darkroom.curves || {})[curveChannel] || [];
  const color = CURVE_COLORS[curveChannel] || '#ffffff';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach(([x, y], i) => {
    const px = x * W;
    const py = H - y * H;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  for (const [x, y] of pts) {
    ctx.beginPath();
    ctx.arc(x * W, H - y * H, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff2e88';
    ctx.stroke();
  }
}

function curvePointAt(px, py) {
  const c = $('toneCurve');
  const rect = c.getBoundingClientRect();
  const x = ((px - rect.left) * c.width) / rect.width;
  const y = ((py - rect.top) * c.height) / rect.height;
  const pts = state.darkroom.curves[curveChannel];
  for (let i = 0; i < pts.length; i++) {
    const dx = pts[i][0] * c.width - x;
    const dy = (c.height - pts[i][1] * c.height) - y;
    if (Math.sqrt(dx * dx + dy * dy) <= 12) return i;
  }
  return -1;
}

let curveDrag = -1;
function bindToneCurve() {
  const c = $('toneCurve');
  const toCurve = (e) => {
    const rect = c.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, ((e.clientX - rect.left) * 1) / rect.width)),
      y: Math.max(0, Math.min(1, 1 - ((e.clientY - rect.top) * 1) / rect.height)),
    };
  };
  c.addEventListener('pointerdown', (e) => {
    pushHistory();
    const hit = curvePointAt(e.clientX, e.clientY);
    if (hit >= 0) {
      curveDrag = hit;
    } else {
      const pts = state.darkroom.curves[curveChannel];
      if (pts.length >= 8) {
        status.textContent = 'Up to 8 curve points — remove one first (double-click it).';
        return;
      }
      const { x, y } = toCurve(e);
      pts.push([x, y]);
      pts.sort((a, b) => a[0] - b[0]);
      curveDrag = pts.findIndex((p) => p[0] === x && p[1] === y);
    }
    c.setPointerCapture(e.pointerId);
    drawToneCurve();
    redraw();
  });
  c.addEventListener('pointermove', (e) => {
    if (curveDrag < 0) return;
    const pts = state.darkroom.curves[curveChannel];
    const p = pts[curveDrag];
    if (!p) return;
    const { x, y } = toCurve(e);
    // Endpoints stay pinned at x = 0 and x = 1; middle points stay ordered.
    if (curveDrag === 0) p[0] = 0;
    else if (curveDrag === pts.length - 1) p[0] = 1;
    else p[0] = Math.max(pts[curveDrag - 1][0] + 0.01, Math.min(pts[curveDrag + 1][0] - 0.01, x));
    p[1] = y;
    drawToneCurve();
    redraw();
  });
  c.addEventListener('pointerup', () => { curveDrag = -1; });
  c.addEventListener('dblclick', (e) => {
    const hit = curvePointAt(e.clientX, e.clientY);
    const pts = state.darkroom.curves[curveChannel];
    if (hit >= 0 && pts.length > 2) {
      pushHistory();
      pts.splice(hit, 1);
      drawToneCurve();
      redraw();
      status.textContent = 'Curve point removed.';
    }
  });
}

function syncDarkroomValues() {
  const dr = state.darkroom || defaultDarkroom();
  document.querySelectorAll('#darkroomSliders input[data-dr]').forEach((el) => {
    const def = DARKROOM_SLIDERS.find((d2) => d2.key === el.dataset.dr);
    if (!def) return;
    const v = dr[def.key] || 0;
    el.value = String(v);
    const val = document.querySelector(`[data-dr-val="${def.key}"]`);
    if (val) val.textContent = def.fmt(v);
  });
  document.querySelectorAll('#darkroomHsl input[data-hsl]').forEach((el) => {
    const adj = (dr.hsl || {})[el.dataset.hsl] || { hue: 0, sat: 0 };
    const v = adj[el.dataset.field] || 0;
    el.value = String(v);
    const val = document.querySelector(`[data-hsl-val="${el.dataset.hsl}-${el.dataset.field}"]`);
    if (val) val.textContent = el.dataset.field === 'hue' ? `${v >= 0 ? '+' : ''}${v}°` : `${v >= 0 ? '+' : ''}${Math.round(v * 100)}%`;
  });
  drawToneCurve();
}

function syncDarkroom() {
  syncDarkroomValues();
  buildCurveChannelButtons();
}

// --- Smart Suggest (v6) ----------------------------------------------------
// Samples the first panel's photo, scores every grade against the measured
// pixels, and shows the 3 best recipes as one-click cards.
function runSuggest() {
  const img = state.photos[(state.panels[0] || {}).photo || 0] || state.photos[0];
  if (!img) {
    $('suggestSummary').textContent = 'No photo loaded yet — use a sample first.';
    return;
  }
  const analysis = analyzePhoto(img);
  const suggestions = suggestCovers(analysis);
  $('suggestSummary').textContent = `Photo reads: brightness ${analysis.brightness.toFixed(2)}, contrast ${analysis.contrast.toFixed(2)}, `
    + `${analysis.warmth >= 0 ? 'warm' : 'cool'} ${Math.abs(analysis.warmth).toFixed(2)}, `
    + `${analysis.dominantHueName} dominates (${Math.round(analysis.dominantHueShare * 100)}% of coloured pixels).`;
  const wrap = $('suggestCards');
  wrap.innerHTML = '';
  suggestions.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'suggest-card';
    b.dataset.grade = s.grade;
    const titleEl = document.createElement('b');
    titleEl.textContent = `${i + 1} · ${s.gradeLabel}`;
    b.append(titleEl, document.createTextNode(` — ${s.layoutLabel} · “${s.title}”`));
    const small = document.createElement('small');
    small.textContent = s.reason;
    b.appendChild(small);
    b.addEventListener('click', () => {
      pushHistory();
      state.grade = s.grade;
      state.layout = s.layout;
      state.title = s.title;
      state.titleStyle = s.titleStyle;
      selectedPanel = 0;
      syncAll();
      redraw();
      status.textContent = `Smart Suggest applied: ${s.gradeLabel} + ${s.layoutLabel}.`;
    });
    wrap.appendChild(b);
  });
  // Auto-caption rides along: the same photo reading also yields titles.
  runCaptions();
}

// --- Glitch / CRT controls (v7) --------------------------------------------
// One row per effect: on/off, intensity. Presets set a whole recipe at once.
const GLITCH_FX = [
  { key: 'chromatic', label: 'Chromatic aberration — RGB split', min: 0, max: 20, step: 1, fmt: (v) => `${v}px` },
  { key: 'scanlines', label: 'Scanlines — CRT lines', min: 0, max: 1, step: 0.05, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: 'noise', label: 'Tracking noise — VHS streaks', min: 0, max: 1, step: 0.05, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: 'slices', label: 'Glitch slices — shifted bands', min: 0, max: 1, step: 0.05, fmt: (v) => `${Math.round(v * 100)}%` },
  { key: 'titleShift', label: 'Title RGB shift', min: 0, max: 16, step: 1, fmt: (v) => `${v}px` },
];

function buildGlitchControls() {
  const wrap = $('glitchControls');
  wrap.innerHTML = '';
  for (const def of GLITCH_FX) {
    const row = document.createElement('div');
    row.className = 'glitch-row';
    row.dataset.fx = def.key;
    const check = document.createElement('label');
    check.className = 'check';
    check.innerHTML = `<input type="checkbox" data-glitch="${def.key}" data-field="on"> ${def.label}`;
    const slider = document.createElement('label');
    slider.innerHTML = `Strength <span data-glitch-val="${def.key}"></span><input type="range" min="${def.min}" max="${def.max}" step="${def.step}" value="0" data-glitch="${def.key}" data-field="amount" aria-label="${def.label} strength">`;
    row.append(check, slider);
    wrap.appendChild(row);
  }
  wrap.querySelectorAll('input[data-glitch]').forEach((el) => {
    el.addEventListener('pointerdown', pushHistory);
    el.addEventListener('focus', pushHistory);
    el.addEventListener('input', (e) => {
      const fx = state.glitch[e.target.dataset.glitch];
      if (!fx) return;
      if (e.target.dataset.field === 'on') fx.on = e.target.checked;
      else fx.amount = Number(e.target.value);
      syncGlitchValues();
      redraw();
    });
  });
}

function syncGlitchValues() {
  const g = state.glitch || defaultGlitch();
  document.querySelectorAll('#glitchControls input[data-glitch]').forEach((el) => {
    const fx = g[el.dataset.glitch];
    if (!fx) return;
    if (el.dataset.field === 'on') el.checked = !!fx.on;
    else el.value = String(fx.amount || 0);
    const val = document.querySelector(`[data-glitch-val="${el.dataset.glitch}"]`);
    if (val && el.dataset.field === 'amount') {
      const def = GLITCH_FX.find((d2) => d2.key === el.dataset.glitch);
      val.textContent = def ? def.fmt(fx.amount || 0) : '';
    }
  });
}

function applyGlitchPreset(name) {
  pushHistory();
  const g = state.glitch;
  const off = () => { for (const fx of Object.values(g)) fx.on = false; };
  if (name === 'vhs') {
    off();
    g.scanlines = { on: true, amount: 0.6 };
    g.noise = { on: true, amount: 0.5 };
    g.slices = { on: true, amount: 0.5 };
  } else if (name === 'crt') {
    off();
    g.chromatic = { on: true, amount: 10 };
    g.titleShift = { on: true, amount: 8 };
  } else if (name === 'full') {
    g.chromatic = { on: true, amount: 10 };
    g.scanlines = { on: true, amount: 0.6 };
    g.noise = { on: true, amount: 0.45 };
    g.slices = { on: true, amount: 0.6 };
    g.titleShift = { on: true, amount: 8 };
  } else {
    off();
  }
  syncGlitchValues();
  redraw();
  status.textContent = name === 'off' ? 'Glitch off.' : `Glitch preset: ${name === 'vhs' ? 'VHS Tracking' : name === 'crt' ? 'CRT Split' : 'Full Glitch'}.`;
}

// --- Auto-caption (v7) -----------------------------------------------------
// Same pixel reading as Smart Suggest, turned into three ready titles.
// One click applies a caption's title + tagline.
function runCaptions() {
  const img = state.photos[(state.panels[0] || {}).photo || 0] || state.photos[0];
  if (!img) {
    $('captionSummary').textContent = 'No photo loaded yet — use a sample first.';
    return;
  }
  const analysis = analyzePhoto(img);
  const caps = suggestCaptions(analysis);
  $('captionSummary').textContent = `From the same photo reading as Smart Suggest — ${caps.length} captions, same photo, same three every time.`;
  const wrap = $('captionCards');
  wrap.innerHTML = '';
  caps.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'caption-card';
    b.dataset.title = c.title;
    const titleEl = document.createElement('b');
    titleEl.textContent = `${i + 1} · ${c.title}`;
    b.append(titleEl, document.createTextNode(` — “${c.tagline}”`));
    const small = document.createElement('small');
    small.textContent = c.reason;
    b.appendChild(small);
    b.addEventListener('click', () => {
      pushHistory();
      state.title = c.title;
      state.tagline = c.tagline;
      syncAll();
      redraw();
      status.textContent = `Caption applied: ${c.title}`;
    });
    wrap.appendChild(b);
  });
}

// --- Stickers controls (v7) ------------------------------------------------
// One row per sticker: kind, size, rotation, remove. Dragging happens on
// the preview canvas. The list is NOT rebuilt while the user is typing in it.
// --- Custom Palette Builder (v8) ------------------------------------------
// Extract the photo's 5 dominant colours, pick 3 stops, and the grade
// becomes a gradient in your colours. Saved palettes (up to 4) live in the
// state (autosaved) and in localStorage under vicePalettes.v8.
const PALETTE_STORE_KEY = 'vicePalettes.v8';
let dominantColors = [];
let activeStop = 0;

function loadSavedPalettes() {
  try {
    const raw = localStorage.getItem(PALETTE_STORE_KEY);
    if (!raw) return;
    const list = JSON.parse(raw);
    if (Array.isArray(list) && !(state.customPalettes || []).length) {
      state.customPalettes = list.slice(0, 4);
    }
  } catch { /* ignore */ }
}

function storeSavedPalettes() {
  try { localStorage.setItem(PALETTE_STORE_KEY, JSON.stringify(state.customPalettes || [])); } catch { /* ignore */ }
}

function renderDominantSwatches() {
  const wrap = $('paletteSwatches');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (!dominantColors.length) {
    wrap.innerHTML = '<span class="hint">No palette extracted yet — press “Extract palette from photo”.</span>';
    return;
  }
  dominantColors.forEach((hex) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'swatch';
    b.style.background = hex;
    b.title = `${hex} — click to set stop ${activeStop + 1}`;
    b.textContent = hex;
    b.addEventListener('click', () => {
      pushHistory();
      const stops = [...(state.palette.stops || ['#ffb400', '#ff6b35', '#d62678'])];
      stops[activeStop] = hex;
      state.palette.stops = stops;
      state.palette.enabled = true;
      state.palette.name = 'From photo';
      state.palette.preset = null;
      activeStop = (activeStop + 1) % 3;
      syncPaletteUI();
      redraw();
    });
    wrap.appendChild(b);
  });
}

function renderSavedPalettes() {
  const wrap = $('paletteSaved');
  if (!wrap) return;
  wrap.innerHTML = '';
  const list = state.customPalettes || [];
  if (!list.length) {
    wrap.innerHTML = '<span class="hint">No saved palettes yet — save up to 4.</span>';
    return;
  }
  list.forEach((pal, i) => {
    const row = document.createElement('div');
    row.className = 'saved-palette';
    const dots = document.createElement('span');
    dots.className = 'swatch-row';
    (pal.stops || []).forEach((hex) => {
      const d = document.createElement('span');
      d.className = 'swatch-dot';
      d.style.background = hex;
      d.title = hex;
      dots.appendChild(d);
    });
    const name = document.createElement('span');
    name.textContent = pal.name || `Palette ${i + 1}`;
    const apply = document.createElement('button');
    apply.type = 'button';
    apply.textContent = 'Apply';
    apply.addEventListener('click', () => {
      pushHistory();
      state.palette = { enabled: true, stops: [...pal.stops], name: pal.name || 'Saved', preset: pal.preset || null };
      syncPaletteUI();
      redraw();
      status.textContent = `Applied palette “${pal.name || 'Saved'}”.`;
    });
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      pushHistory();
      state.customPalettes.splice(i, 1);
      storeSavedPalettes();
      renderSavedPalettes();
    });
    row.append(dots, name, apply, del);
    wrap.appendChild(row);
  });
}

function syncPaletteUI() {
  const pal = state.palette || defaultPalette();
  for (let i = 0; i < 3; i++) {
    const input = $(`paletteStop${i}`);
    if (input) input.value = (pal.stops && pal.stops[i]) || '#000000';
  }
  const use = $('paletteUse');
  if (use) use.checked = !!pal.enabled;
  const label = $('paletteName');
  if (label) label.textContent = pal.enabled ? `Custom palette on — ${pal.name || 'Custom'} (${(pal.stops || []).join(' · ')})` : 'Custom palette off — the grade below is used as-is.';
  renderDominantSwatches();
  renderSavedPalettes();
}

function runPaletteExtract() {
  const img = state.photos[0] || state.photos[1] || null;
  if (!img) {
    const el = $('extractStatus');
    if (el) el.textContent = 'No photo loaded yet.';
    return false;
  }
  pushHistory();
  dominantColors = extractPalette(img);
  if (dominantColors.length >= 3) {
    state.palette.stops = dominantColors.slice(0, 3);
    state.palette.enabled = true;
    state.palette.name = 'From photo';
    state.palette.preset = null;
  }
  const el = $('extractStatus');
  if (el) el.textContent = dominantColors.length
    ? `5 dominant colours: ${dominantColors.join(' · ')} — stops set to the first 3. Click a swatch to replace stop ${activeStop + 1}.`
    : 'Could not read the photo.';
  syncPaletteUI();
  redraw();
  return dominantColors.length > 0;
}

function runCoverOfTheDay() {
  pushHistory();
  const recipe = applyCoverOfTheDay(state);
  const label = $('cotdLabel');
  if (label) label.textContent = `Today ${recipe.date} — ${LAYOUTS[recipe.layout].label} + ${GRADES[recipe.grade].label} + ${PALETTE_PRESETS[recipe.palette].label} palette · “${recipe.title}”`;
  syncAll();
  redraw();
  status.textContent = `Cover of the Day applied — ${recipe.date}: ${recipe.title}.`;
  return recipe;
}

function buildPaletteUI() {
  loadSavedPalettes();
  const presets = $('palettePresets');
  if (presets) {
    presets.innerHTML = '';
    for (const [key, preset] of Object.entries(PALETTE_PRESETS)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.palette = key;
      b.textContent = preset.label;
      b.title = preset.stops.join(' · ');
      b.addEventListener('click', () => {
        pushHistory();
        state.palette = { enabled: true, stops: [...preset.stops], name: preset.label, preset: key };
        syncPaletteUI();
        redraw();
        status.textContent = `Palette “${preset.label}” applied — ${preset.stops.join(' · ')}.`;
      });
      presets.appendChild(b);
    }
  }
  $('extractPalette').addEventListener('click', runPaletteExtract);
  $('paletteApply').addEventListener('click', () => {
    pushHistory();
    const stops = [0, 1, 2].map((i) => $(`paletteStop${i}`).value);
    state.palette.stops = stops;
    state.palette.enabled = true;
    state.palette.name = 'Custom';
    state.palette.preset = null;
    syncPaletteUI();
    redraw();
    status.textContent = `Custom palette applied — ${stops.join(' · ')}.`;
  });
  $('paletteUse').addEventListener('change', (e) => {
    pushHistory();
    state.palette.enabled = e.target.checked;
    syncPaletteUI();
    redraw();
  });
  for (let i = 0; i < 3; i++) {
    const input = $(`paletteStop${i}`);
    input.addEventListener('focus', () => { activeStop = i; renderDominantSwatches(); });
    input.addEventListener('click', () => { activeStop = i; renderDominantSwatches(); });
  }
  $('paletteSave').addEventListener('click', () => {
    const list = state.customPalettes || (state.customPalettes = []);
    if (list.length >= 4) {
      status.textContent = 'Up to 4 saved palettes — delete one first.';
      return;
    }
    pushHistory();
    const name = $('paletteSaveName').value.trim() || `Palette ${list.length + 1}`;
    list.push({ name, stops: [...(state.palette.stops || [])], preset: state.palette.preset || null });
    storeSavedPalettes();
    renderSavedPalettes();
    status.textContent = `Saved palette “${name}” (${list.length}/4).`;
  });
  $('cotdApply').addEventListener('click', runCoverOfTheDay);
  const label = $('cotdLabel');
  if (label) {
    const today = coverOfTheDay();
    label.textContent = `Today ${today.date} — ${LAYOUTS[today.layout].label} + ${GRADES[today.grade].label} + ${PALETTE_PRESETS[today.palette].label} palette. One click applies the whole recipe.`;
  }
  syncPaletteUI();
}

function buildStickerList() {
  const wrap = $('stickerList');
  const active = document.activeElement;
  if (wrap.contains(active)) return;
  wrap.innerHTML = '';
  (state.stickers || []).forEach((st, i) => {
    const row = document.createElement('div');
    row.className = 'sticker-row';
    row.dataset.index = String(i);
    const kind = document.createElement('select');
    kind.setAttribute('aria-label', `Sticker ${i + 1} kind`);
    for (const [k, def] of Object.entries(STICKER_KINDS)) {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = def.label;
      if (st.kind === k) o.selected = true;
      kind.appendChild(o);
    }
    kind.addEventListener('change', (e) => { pushHistory(); st.kind = e.target.value; redraw(); });
    const size = document.createElement('input');
    size.type = 'range';
    size.min = '0.5';
    size.max = '2';
    size.step = '0.1';
    size.value = String(st.size || 1);
    size.setAttribute('aria-label', `Sticker ${i + 1} size`);
    size.addEventListener('input', (e) => { st.size = Number(e.target.value); redraw(); });
    size.addEventListener('pointerdown', pushHistory);
    const rot = document.createElement('input');
    rot.type = 'range';
    rot.min = '-45';
    rot.max = '45';
    rot.step = '1';
    rot.value = String(st.rot || 0);
    rot.setAttribute('aria-label', `Sticker ${i + 1} rotation`);
    rot.addEventListener('input', (e) => { st.rot = Number(e.target.value); redraw(); });
    rot.addEventListener('pointerdown', pushHistory);
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '✕';
    del.setAttribute('aria-label', `Remove sticker ${i + 1}`);
    del.addEventListener('click', () => {
      pushHistory();
      state.stickers.splice(i, 1);
      buildStickerList();
      redraw();
      status.textContent = 'Sticker removed.';
    });
    row.append(kind, size, rot, del);
    wrap.appendChild(row);
  });
  if (!(state.stickers || []).length) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = 'No stickers yet — add one, then drag it on the preview.';
    wrap.appendChild(p);
  }
}

function syncPanelControls() {
  const p = state.panels[selectedPanel];
  $('panelLabel').textContent = `Panel ${selectedPanel + 1} of ${layoutPanelsCount()}`;
  $('panelPhoto').value = String(p.photo);
  $('panelZoom').value = String(p.zoom);
  $('zoomVal').textContent = `${Math.round(p.zoom * 100)}%`;
  $('panelCaption').value = p.caption || '';
  $('panelInk').checked = !!p.ink;
  $('inkLevel').value = String(state.inkLevel || 3);
  $('inkLevelVal').textContent = String(state.inkLevel || 3);
  document.querySelectorAll('#panelPick button').forEach((b, i) => {
    b.classList.toggle('active', i === selectedPanel);
    b.disabled = i >= layoutPanelsCount();
  });
}

function syncEditorInputs() {
  $('title').value = state.title || '';
  $('tagline').value = state.tagline || '';
  $('credits').value = state.credits || '';
  $('issue').value = state.issue || '';
  $('mastheadName').value = state.mastheadName || '';
  $('masthead').checked = !!state.masthead;
  $('coverLinesOn').checked = !!state.coverLinesOn;
  (state.coverLines || []).forEach((line, i) => {
    const el = $(`coverLine${i}`);
    if (el) el.value = line || '';
  });
  $('halftone').checked = !!state.halftone;
  $('grain').checked = !!state.grain;
  $('lightLeak').checked = !!state.lightLeak;
  $('vignette').checked = state.vignette !== false;
  $('titleCurve').value = String(state.titleCurve == null ? 0.6 : state.titleCurve);
  $('curveVal').textContent = `${Math.round((state.titleCurve == null ? 0.6 : state.titleCurve) * 100)}%`;
  $('backdropBlend').value = state.blend || 'screen';
  $('compare').value = String(Math.round((state.compare == null ? 1 : state.compare) * 100));
  // Photo Lab (v4) + Series mode (v4).
  $('labBlur').value = String(state.blur || 0);
  $('blurVal').textContent = `${state.blur || 0}px`;
  $('labSpotlight').value = String(state.spotlight || 0);
  $('spotlightVal').textContent = `${Math.round((state.spotlight || 0) * 100)}%`;
  $('seriesOn').checked = !!state.series;
  const sl = state.seriesLayouts || ['magazine', 'triptych'];
  $('seriesLayout2').value = sl[0] || 'magazine';
  $('seriesLayout3').value = sl[1] || 'triptych';
}

function layoutPanelsCount() {
  return LAYOUTS[state.layout].panels;
}

function lookMatches(key) {
  const look = LOOKS[key];
  if (!look) return false;
  for (const f of ['layout', 'grade', 'backdrop', 'blend', 'titleStyle', 'treatment', 'masthead', 'coverLinesOn', 'title']) {
    if (look[f] !== undefined && state[f] !== look[f]) return false;
  }
  return state.panels.every((p) => p.ink === !!look.ink);
}

function buildPickButtons(wrapId, entries, current, onPick) {
  const wrap = $(wrapId);
  wrap.innerHTML = '';
  for (const [key, def] of Object.entries(entries)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = def.label;
    b.classList.toggle('active', current === key);
    b.addEventListener('click', () => {
      pushHistory();
      onPick(key);
      syncAll();
      redraw();
    });
    wrap.appendChild(b);
  }
}

function buildLayoutButtons() {
  buildPickButtons('layoutPick', LAYOUTS, state.layout, (key) => {
    state.layout = key;
    selectedPanel = 0;
  });
}

function buildGradeButtons() {
  buildPickButtons('gradePick', GRADES, state.grade, (key) => { state.grade = key; });
}

function buildBackdropButtons() {
  buildPickButtons('backdropPick', BACKDROPS, state.backdrop, (key) => { state.backdrop = key; });
}

function buildTreatmentButtons() {
  buildPickButtons('treatmentPick', TREATMENTS, state.treatment, (key) => { state.treatment = key; });
}

function buildTitleStyleButtons() {
  buildPickButtons('titleStylePick', TITLE_STYLES, state.titleStyle, (key) => { state.titleStyle = key; });
}

function buildColorPopButtons() {
  buildPickButtons('colorPopPick', COLORPOPS, state.colorPop, (key) => { state.colorPop = key; });
}

function buildFilmButtons() {
  buildPickButtons('filmPick', FILMS, state.film, (key) => { state.film = key; });
}

// Template gallery (v4): one button per template with a painted thumbnail
// (a real render of that template on the loaded photos), built once; the
// active ring is refreshed by updateTemplateActive() on every sync.
function buildTemplateGallery() {
  const wrap = $('templateGallery');
  wrap.innerHTML = '';
  for (const [key, def] of Object.entries(TEMPLATES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.template = key;
    const c = document.createElement('canvas');
    c.width = 168;
    c.height = 168;
    const s = document.createElement('span');
    s.textContent = def.label;
    b.append(c, s);
    b.addEventListener('click', () => {
      pushHistory();
      applyTemplate(state, key);
      syncAll();
      redraw();
      status.textContent = `Template applied: ${def.label}`;
    });
    wrap.appendChild(b);
  }
}

function renderTemplateThumbs() {
  document.querySelectorAll('#templateGallery button').forEach((b) => {
    const key = b.dataset.template;
    if (!TEMPLATES[key]) return;
    const tmp = { ...state, compare: 1 };
    tmp.panels = state.panels.map((p) => ({ ...p }));
    tmp.coverLines = [...(state.coverLines || [])];
    applyTemplate(tmp, key);
    drawCover(b.querySelector('canvas'), tmp);
  });
  updateTemplateActive();
}

function updateTemplateActive() {
  document.querySelectorAll('#templateGallery button').forEach((b) => {
    b.classList.toggle('active', templateMatches(state, b.dataset.template));
  });
}

function buildLookButtons() {
  const wrap = $('lookPick');
  wrap.innerHTML = '';
  for (const [key, def] of Object.entries(LOOKS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = def.label;
    b.classList.toggle('active', lookMatches(key));
    b.addEventListener('click', () => {
      pushHistory();
      applyLook(state, key);
      syncAll();
      redraw();
      status.textContent = `Look applied: ${def.label}`;
    });
    wrap.appendChild(b);
  }
}

function buildPanelPick() {
  const wrap = $('panelPick');
  wrap.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(i + 1);
    b.addEventListener('click', () => {
      selectedPanel = i;
      redraw();
    });
    wrap.appendChild(b);
  }
}

function syncAll() {
  buildLayoutButtons();
  buildGradeButtons();
  buildBackdropButtons();
  buildTreatmentButtons();
  buildTitleStyleButtons();
  buildLookButtons();
  buildColorPopButtons();
  buildFilmButtons();
  updateTemplateActive();
  syncEditorInputs();
  syncPanelControls();
  syncArtKitValues();
  buildBubbleList();
  buildStickerList();
  syncGlitchValues();
  syncDarkroom();
  syncPaletteUI();
}

function downloadBlob(blob, file) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function buildExportButtons() {
  const wrap = $('exportPick');
  wrap.innerHTML = '';
  for (const size of EXPORT_SIZES) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Export ${size.label} PNG`;
    b.addEventListener('click', async () => {
      status.textContent = `Rendering ${size.label}…`;
      const blob = await exportCover(state, size.w, size.h);
      downloadBlob(blob, size.file);
      status.textContent = `Saved ${size.file}`;
    });
    wrap.appendChild(b);
  }
  // Export-all: all four sizes, one after another, so the cover is ready
  // for every post format in a single click.
  const all = document.createElement('button');
  all.type = 'button';
  all.id = 'exportAll';
  all.textContent = 'Export all 4 sizes (PNG)';
  all.addEventListener('click', async () => {
    for (const size of EXPORT_SIZES) {
      status.textContent = `Rendering ${size.label}…`;
      const blob = await exportCover(state, size.w, size.h);
      downloadBlob(blob, size.file);
    }
    status.textContent = `Saved all 4 sizes (${EXPORT_SIZES.map((s) => s.file).join(', ')})`;
  });
  wrap.appendChild(all);
  // Contact sheet (v8): all four sizes on one sheet, one PNG.
  const sheet = document.createElement('button');
  sheet.type = 'button';
  sheet.id = 'exportContactSheet';
  sheet.textContent = 'Export contact sheet — 1 PNG';
  sheet.addEventListener('click', async () => {
    status.textContent = 'Rendering contact sheet…';
    const blob = await exportContactSheet(state);
    downloadBlob(blob, CONTACT_SHEET.file);
    status.textContent = `Saved ${CONTACT_SHEET.file}`;
  });
  wrap.appendChild(sheet);
}

async function loadSample(slot, name) {
  try {
    // A saved project photo wins over the bundled sample in this slot.
    const dataUrl = state.photoData && state.photoData[slot];
    if (dataUrl) {
      state.photos[slot] = await loadImage(dataUrl);
      return;
    }
    state.photos[slot] = await loadImage(`samples/${name}.jpg`);
    // Remember the sample as a data URL so autosave / project export can
    // carry the photo along (fetch is local, same origin, no network out).
    try {
      const res = await fetch(`samples/${name}.jpg`);
      const blob = await res.blob();
      state.photoData[slot] = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch {
      // Photo still loaded; only the project copy is missing.
    }
  } catch {
    state.photos[slot] = null;
  }
}

async function loadDefaults() {
  await Promise.all([loadSample(0, 'boulevard'), loadSample(1, 'pier')]);
  if (!state.photos[2]) state.photos[2] = state.photos[0];
  if (!state.photoData[2]) state.photoData[2] = state.photoData[0];
  state.backdropImgs = {};
  for (const [key, def] of Object.entries(BACKDROPS)) {
    if (!def.file) continue;
    try {
      state.backdropImgs[key] = await loadImage(def.file);
    } catch {
      // A missing backdrop just means that option draws nothing.
    }
  }
  redraw();
  renderTemplateThumbs();
}

// Surprise me: a random cover — random layout, grade, title style,
// treatment, backdrop and title. One click, always a complete cover.
const SURPRISE_TITLES = ['VICE TYPE', 'NEON NIGHTS', 'HEATWAVE', 'PALM NOIR', 'SUNSET CHASE', 'VICE CITY'];
function surpriseMe() {
  pushHistory();
  const pick = (obj) => {
    const keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
  };
  state.layout = pick(LAYOUTS);
  state.grade = pick(GRADES);
  state.titleStyle = pick(TITLE_STYLES);
  state.backdrop = pick(BACKDROPS);
  state.title = SURPRISE_TITLES[Math.floor(Math.random() * SURPRISE_TITLES.length)];
  // Treatments are strong; use one only about 40% of the time.
  state.treatment = Math.random() < 0.4 ? pick(TREATMENTS) : 'none';
  state.masthead = Math.random() < 0.8;
  state.coverLinesOn = Math.random() < 0.7;
  selectedPanel = 0;
  syncAll();
  redraw();
  status.textContent = `Surprise: ${state.title} — ${LAYOUTS[state.layout].label} + ${GRADES[state.grade].label}`;
}

// Uploads: up to 3 photos, read locally with FileReader, never uploaded.
document.querySelectorAll('input[data-slot]').forEach((input) => {
  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      state.photos[Number(input.dataset.slot)] = await loadImage(reader.result);
      state.photoData[Number(input.dataset.slot)] = reader.result;
      redraw();
      status.textContent = `Loaded ${file.name} into photo slot ${Number(input.dataset.slot) + 1}`;
    };
    reader.readAsDataURL(file);
  });
});

$('sampleBoulevard').addEventListener('click', async () => {
  state.photoData[0] = null; // force the bundled sample, not a saved photo
  await loadSample(0, 'boulevard');
  state.photos[2] = state.photos[2] || state.photos[0];
  redraw();
});
$('samplePier').addEventListener('click', async () => {
  state.photoData[1] = null; // force the bundled sample, not a saved photo
  await loadSample(1, 'pier');
  redraw();
});

$('surprise').addEventListener('click', surpriseMe);
$('undo').addEventListener('click', undo);

// Darkroom presets + reset (v6).
$('darkroomGolden').addEventListener('click', () => {
  pushHistory();
  applyDarkroomPreset(state, 'goldenHour');
  syncAll();
  redraw();
  status.textContent = 'Darkroom preset: Golden Hour.';
});
$('darkroomBlue').addEventListener('click', () => {
  pushHistory();
  applyDarkroomPreset(state, 'blueHour');
  syncAll();
  redraw();
  status.textContent = 'Darkroom preset: Blue Hour.';
});
$('darkroomReset').addEventListener('click', () => {
  pushHistory();
  state.darkroom = defaultDarkroom();
  syncAll();
  redraw();
  status.textContent = 'Darkroom reset to defaults.';
});
$('analyzePhoto').addEventListener('click', runSuggest);
$('suggestCaptions').addEventListener('click', runCaptions);

// Glitch presets (v7).
$('glitchPresetVhs').addEventListener('click', () => applyGlitchPreset('vhs'));
$('glitchPresetCrt').addEventListener('click', () => applyGlitchPreset('crt'));
$('glitchPresetFull').addEventListener('click', () => applyGlitchPreset('full'));
$('glitchPresetOff').addEventListener('click', () => applyGlitchPreset('off'));

// Add sticker (v7): up to 6, placed centre-top by default, draggable on
// the preview. Kinds cycle so a fresh sticker is never a duplicate of the
// last one added.
const STICKER_CYCLE = ['star', 'bolt', 'palm', 'sun', 'heart'];
$('addSticker').addEventListener('click', () => {
  pushHistory();
  state.stickers = state.stickers || [];
  if (state.stickers.length >= 6) {
    status.textContent = 'Up to 6 stickers — remove one first.';
    return;
  }
  const last = state.stickers[state.stickers.length - 1];
  const nextKind = STICKER_CYCLE[(STICKER_CYCLE.indexOf(last ? last.kind : 'heart') + 1) % STICKER_CYCLE.length];
  state.stickers.push({
    kind: nextKind,
    x: 0.2 + 0.12 * state.stickers.length,
    y: 0.2 + 0.1 * state.stickers.length,
    size: 1,
    rot: 0,
  });
  buildStickerList();
  redraw();
  status.textContent = 'Sticker added — drag it on the preview to place it.';
});

// Guided wizard (v4): 3 steps — Foto, Gaya, Export. Each step highlights the
// fieldset it talks about and moves the progress bar; the full editor below
// stays live, so jumping ahead costs nothing.
const WIZARD_HINTS = [
  'Step 1 — load a photo (or use a sample), then press Next. Jump to the full editor any time: every control below stays live.',
  'Step 2 — pick a template or a Look, then tune the title, grade and Photo Lab. Press Next when the cover looks right.',
  'Step 3 — export your cover as a PNG in any size — or all four at once. Series mode exports all 3 covers in one click.',
];
let wizardStep = 1;
function setWizardStep(n) {
  wizardStep = Math.min(3, Math.max(1, n));
  $('wizardFill').style.width = `${wizardStep * 33}%`;
  [1, 2, 3].forEach((i) => $(`wizardStep${i}`).classList.toggle('active', i === wizardStep));
  $('wizardHint').textContent = WIZARD_HINTS[wizardStep - 1];
  document.querySelectorAll('fieldset.wizard-focus').forEach((f) => f.classList.remove('wizard-focus'));
  const target = { 1: 'fs-photos', 2: 'fs-style', 3: 'fs-export' }[wizardStep];
  const el = $(target);
  if (el) {
    el.classList.add('wizard-focus');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
$('wizardStep1').addEventListener('click', () => setWizardStep(1));
$('wizardStep2').addEventListener('click', () => setWizardStep(2));
$('wizardStep3').addEventListener('click', () => setWizardStep(3));
$('wizardNext').addEventListener('click', () => setWizardStep(wizardStep + 1));

// Photo Lab sliders (v4).
$('labBlur').addEventListener('input', (e) => {
  state.blur = Number(e.target.value);
  $('blurVal').textContent = `${state.blur}px`;
  redraw();
});
$('labSpotlight').addEventListener('input', (e) => {
  state.spotlight = Number(e.target.value);
  $('spotlightVal').textContent = `${Math.round(state.spotlight * 100)}%`;
  redraw();
});

// Series mode (v4): toggle, per-variant layouts, one-click 3-PNG export.
$('seriesOn').addEventListener('change', (e) => {
  pushHistory();
  state.series = e.target.checked;
  redraw();
  status.textContent = state.series ? 'Series mode on — 3 covers, one theme.' : 'Series mode off.';
});
$('seriesLayout2').addEventListener('change', (e) => {
  state.seriesLayouts[0] = e.target.value;
  redraw();
});
$('seriesLayout3').addEventListener('change', (e) => {
  state.seriesLayouts[1] = e.target.value;
  redraw();
});
$('exportSeries').addEventListener('click', async () => {
  status.textContent = 'Rendering series…';
  const files = await exportSeries(state);
  for (const f of files) downloadBlob(f.blob, f.file);
  status.textContent = `Saved series: ${files.map((f) => f.file).join(', ')}`;
});

// Arm the history at the start of a gesture on every free-form control, so
// undo always restores the pre-change state.
function armHistory(el) {
  if (!el) return;
  el.addEventListener('pointerdown', pushHistory);
  el.addEventListener('focus', pushHistory);
}
[
  'title', 'tagline', 'credits', 'issue', 'mastheadName',
  'coverLine0', 'coverLine1', 'coverLine2',
  'titleCurve', 'panelZoom', 'panelCaption', 'inkLevel',
  'halftone', 'grain', 'lightLeak', 'vignette', 'masthead', 'coverLinesOn',
  'panelPhoto', 'panelInk', 'backdropBlend',
  'labBlur', 'labSpotlight', 'seriesOn', 'seriesLayout2', 'seriesLayout3',
].forEach((id) => armHistory($(id)));

$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
$('credits').addEventListener('input', (e) => { state.credits = e.target.value; redraw(); });
$('issue').addEventListener('input', (e) => { state.issue = e.target.value.replace(/[^0-9]/g, '').slice(0, 2); redraw(); });
$('mastheadName').addEventListener('input', (e) => { state.mastheadName = e.target.value; redraw(); });
$('coverLine0').addEventListener('input', (e) => { state.coverLines[0] = e.target.value; redraw(); });
$('coverLine1').addEventListener('input', (e) => { state.coverLines[1] = e.target.value; redraw(); });
$('coverLine2').addEventListener('input', (e) => { state.coverLines[2] = e.target.value; redraw(); });
$('titleCurve').addEventListener('input', (e) => {
  state.titleCurve = Number(e.target.value);
  $('curveVal').textContent = `${Math.round(state.titleCurve * 100)}%`;
  redraw();
});
$('masthead').addEventListener('change', (e) => { state.masthead = e.target.checked; redraw(); });
$('coverLinesOn').addEventListener('change', (e) => { state.coverLinesOn = e.target.checked; redraw(); });
$('halftone').addEventListener('change', (e) => { state.halftone = e.target.checked; redraw(); });
$('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
$('lightLeak').addEventListener('change', (e) => { state.lightLeak = e.target.checked; redraw(); });
$('vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; redraw(); });
$('panelPhoto').addEventListener('change', (e) => {
  state.panels[selectedPanel].photo = Number(e.target.value);
  redraw();
});
$('panelZoom').addEventListener('input', (e) => {
  state.panels[selectedPanel].zoom = Number(e.target.value);
  redraw();
});
$('panelCaption').addEventListener('input', (e) => {
  state.panels[selectedPanel].caption = e.target.value;
  redraw();
});
$('panelInk').addEventListener('change', (e) => {
  state.panels[selectedPanel].ink = e.target.checked;
  redraw();
});
$('inkLevel').addEventListener('input', (e) => {
  state.inkLevel = Number(e.target.value);
  redraw();
});
$('backdropBlend').addEventListener('change', (e) => {
  state.blend = e.target.value;
  redraw();
});
$('compare').addEventListener('input', (e) => {
  state.compare = Number(e.target.value) / 100;
  redraw();
});

// Project save / load / reset (v5).
$('addBubble').addEventListener('click', () => {
  pushHistory();
  state.bubbles = state.bubbles || [];
  if (state.bubbles.length >= 4) {
    status.textContent = 'Up to 4 bubbles — remove one first.';
    return;
  }
  state.bubbles.push({ kind: 'speech', text: 'SAY SOMETHING!', x: 0.5, y: 0.5, size: 1, style: 'classic' });
  buildBubbleList();
  redraw();
  status.textContent = 'Bubble added — drag it on the preview to place it.';
});

$('saveProject').addEventListener('click', () => {
  const project = serializeProject(state);
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'vice-canvas-project.json');
  status.textContent = 'Saved vice-canvas-project.json';
});

$('loadProjectBtn').addEventListener('click', () => $('loadProjectFile').click());
$('loadProjectFile').addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const { state: saved, photoData } = deserializeProject(JSON.parse(await file.text()));
    pushHistory();
    restoreState(state, saved);
    state.photoData = (photoData || [null, null, null]).slice(0, 3);
    // Reload the project's photos from their data URLs.
    for (let i = 0; i < 3; i++) {
      if (state.photoData[i]) {
        try { state.photos[i] = await loadImage(state.photoData[i]); } catch { state.photos[i] = null; }
      }
    }
    if (!state.photos[2]) state.photos[2] = state.photos[0];
    syncAll();
    redraw();
    status.textContent = `Loaded project ${file.name}.`;
  } catch (err) {
    status.textContent = `Could not load that project: ${err.message}`;
  }
  e.target.value = '';
});

$('resetProject').addEventListener('click', () => {
  pushHistory();
  const fresh = defaultState();
  for (const key of Object.keys(fresh)) state[key] = fresh[key];
  state.art = defaultArt();
  state.bubbles = defaultBubbles();
  try { localStorage.removeItem(AUTOSAVE_KEY); } catch { /* ignore */ }
  state.photoData = [null, null, null];
  selectedPanel = 0;
  loadDefaults();
  syncAll();
  status.textContent = 'Reset to defaults — autosave cleared.';
});

// Drag on the preview to reposition the photo inside the selected panel.
let dragging = null;
let draggingBubble = null;
let draggingSticker = null;
function canvasPoint(x, y) {
  const rect = canvas.getBoundingClientRect();
  return {
    px: (x - rect.left) * (canvas.width / rect.width),
    py: (y - rect.top) * (canvas.height / rect.height),
  };
}
canvas.addEventListener('pointerdown', (e) => {
  pushHistory();
  const { px, py } = canvasPoint(e.clientX, e.clientY);
  // Stickers first: they sit on top of everything, so a sticker under the
  // pointer wins over a bubble or a panel.
  const stItems = layoutStickers(canvas.width, canvas.height, state);
  for (let i = stItems.length - 1; i >= 0; i--) {
    const it = stItems[i];
    if (px >= it.x && px <= it.x + it.w && py >= it.y && py <= it.y + it.h) {
      draggingSticker = { index: i, dx: px - it.cx, dy: py - it.cy };
      canvas.setPointerCapture(e.pointerId);
      return;
    }
  }
  // Bubbles first: they sit on top, so a bubble under the pointer wins.
  const items = layoutBubbles(canvas.width, canvas.height, state);
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    if (px >= it.x && px <= it.x + it.w && py >= it.y && py <= it.y + it.h) {
      draggingBubble = { index: i, dx: px - it.x, dy: py - it.y };
      canvas.setPointerCapture(e.pointerId);
      return;
    }
  }
  dragging = { x: px, y: py, panel: selectedPanel };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (draggingSticker) {
    const { px, py } = canvasPoint(e.clientX, e.clientY);
    const st = state.stickers[draggingSticker.index];
    if (st) {
      st.x = Math.max(0.03, Math.min(0.97, (px - draggingSticker.dx) / canvas.width));
      st.y = Math.max(0.03, Math.min(0.97, (py - draggingSticker.dy) / canvas.height));
    }
    redraw();
    return;
  }
  if (draggingBubble) {
    const { px, py } = canvasPoint(e.clientX, e.clientY);
    const b = state.bubbles[draggingBubble.index];
    if (b) {
      b.x = Math.max(0, Math.min(0.9, (px - draggingBubble.dx) / canvas.width));
      b.y = Math.max(0, Math.min(0.9, (py - draggingBubble.dy) / canvas.height));
    }
    redraw();
    return;
  }
  if (!dragging) return;
  const { px, py } = canvasPoint(e.clientX, e.clientY);
  const p = state.panels[dragging.panel];
  const r = layoutPanels(state.layout, canvas.width, canvas.height)[dragging.panel];
  p.dx = (p.dx || 0) + (px - dragging.x) / r.w;
  p.dy = (p.dy || 0) + (py - dragging.y) / r.h;
  dragging.x = px;
  dragging.y = py;
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; draggingBubble = null; draggingSticker = null; });

syncAll();
buildPanelPick();
buildExportButtons();
buildTemplateGallery();
buildPaletteUI();
buildArtKit();
syncArtKitValues();
buildBubbleList();
buildGlitchControls();
syncGlitchValues();
buildStickerList();
buildDarkroomSliders();
buildHslRows();
buildCurveChannelButtons();
bindToneCurve();
syncDarkroomValues();
const restoredAutosave = restoreAutosave();
if (restoredAutosave) syncAll();
redraw();

const params = new URLSearchParams(location.search);
if (params.get('shot')) {
  runShot(params.get('shot'), params, {
    state,
    loadImage,
    loadDefaults,
    redraw,
    canvas,
    runSuggest,
    runCaptions,
    runPaletteExtract,
    runCoverOfTheDay,
    setTitle: (t) => { state.title = t; $('title').value = t; },
    syncButtons: () => { syncAll(); },
  });
} else {
  loadDefaults();
}
