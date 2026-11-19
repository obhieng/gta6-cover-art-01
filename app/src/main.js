// Vice Type Cover Studio — page wiring (v3).
// Uploads stay local (FileReader only, nothing is sent anywhere), the two
// bundled samples load by default, and every control re-renders the live
// preview canvas. `?shot=` sets up a fixed scene for screenshots.
// v3 adds: one-click Looks, title engine v2 controls, treatments, the
// before/after compare slider, Surprise me + undo history (20 steps).
import {
  drawCover, exportCover, EXPORT_SIZES, GRADES, LAYOUTS, BACKDROPS,
  TREATMENTS, TITLE_STYLES, LOOKS, applyLook, snapshotState, restoreState,
  defaultState, layoutPanels,
} from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const state = defaultState();
let selectedPanel = 0;

// Exposed for the headless regression test (read-only use in tests).
window.__viceState = state;

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
  syncEditorInputs();
  syncPanelControls();
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
  // Export-all: all three sizes, one after another, so the cover is ready
  // for every post format in a single click.
  const all = document.createElement('button');
  all.type = 'button';
  all.id = 'exportAll';
  all.textContent = 'Export all 3 sizes (PNG)';
  all.addEventListener('click', async () => {
    for (const size of EXPORT_SIZES) {
      status.textContent = `Rendering ${size.label}…`;
      const blob = await exportCover(state, size.w, size.h);
      downloadBlob(blob, size.file);
    }
    status.textContent = `Saved all 3 sizes (${EXPORT_SIZES.map((s) => s.file).join(', ')})`;
  });
  wrap.appendChild(all);
}

async function loadSample(slot, name) {
  try {
    state.photos[slot] = await loadImage(`samples/${name}.jpg`);
  } catch {
    state.photos[slot] = null;
  }
}

async function loadDefaults() {
  await Promise.all([loadSample(0, 'boulevard'), loadSample(1, 'pier')]);
  if (!state.photos[2]) state.photos[2] = state.photos[0];
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
      redraw();
      status.textContent = `Loaded ${file.name} into photo slot ${Number(input.dataset.slot) + 1}`;
    };
    reader.readAsDataURL(file);
  });
});

$('sampleBoulevard').addEventListener('click', async () => {
  await loadSample(0, 'boulevard');
  state.photos[2] = state.photos[2] || state.photos[0];
  redraw();
});
$('samplePier').addEventListener('click', async () => {
  await loadSample(1, 'pier');
  redraw();
});

$('surprise').addEventListener('click', surpriseMe);
$('undo').addEventListener('click', undo);

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

// Drag on the preview to reposition the photo inside the selected panel.
let dragging = null;
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
  dragging = { x: px, y: py, panel: selectedPanel };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
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
canvas.addEventListener('pointerup', () => { dragging = null; });

syncAll();
buildPanelPick();
buildExportButtons();
redraw();

const params = new URLSearchParams(location.search);
if (params.get('shot')) {
  runShot(params.get('shot'), params, {
    state,
    loadImage,
    loadDefaults,
    redraw,
    canvas,
    setTitle: (t) => { state.title = t; $('title').value = t; },
    syncButtons: () => { syncAll(); },
  });
} else {
  loadDefaults();
}
