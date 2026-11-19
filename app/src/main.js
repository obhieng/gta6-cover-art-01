// Vice Canvas Cover Studio — page wiring (v5).
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
import {
  drawCover, exportCover, exportSeries, EXPORT_SIZES, GRADES, LAYOUTS, BACKDROPS,
  TREATMENTS, TITLE_STYLES, LOOKS, applyLook, snapshotState, restoreState,
  defaultState, layoutPanels, TEMPLATES, applyTemplate, templateMatches,
  COLORPOPS, FILMS, ART_ELEMENTS, BUBBLE_STYLES, BUBBLE_KINDS, defaultArt,
  defaultBubbles, serializeProject, deserializeProject, layoutBubbles,
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
const AUTOSAVE_KEY = 'viceCanvasProject.v5';
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
  try { raw = localStorage.getItem(AUTOSAVE_KEY); } catch { return false; }
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

// Guided wizard (v4): 3 steps — Foto, Gaya, Export. Each step highlights the
// fieldset it talks about and moves the progress bar; the full editor below
// stays live, so jumping ahead costs nothing.
const WIZARD_HINTS = [
  'Step 1 — load a photo (or use a sample), then press Next. Jump to the full editor any time: every control below stays live.',
  'Step 2 — pick a template or a Look, then tune the title, grade and Photo Lab. Press Next when the cover looks right.',
  'Step 3 — export your cover as a PNG in any size — or all three at once. Series mode exports all 3 covers in one click.',
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
canvas.addEventListener('pointerup', () => { dragging = null; draggingBubble = null; });

syncAll();
buildPanelPick();
buildExportButtons();
buildTemplateGallery();
buildArtKit();
syncArtKitValues();
buildBubbleList();
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
    setTitle: (t) => { state.title = t; $('title').value = t; },
    syncButtons: () => { syncAll(); },
  });
} else {
  loadDefaults();
}
