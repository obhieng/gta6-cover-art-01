// Vice Ink Cover Studio — page wiring.
// Uploads stay local (FileReader only, nothing is sent anywhere), the two
// bundled samples load by default, and every control re-renders the live
// preview canvas. `?shot=` sets up a fixed scene for screenshots.
import { drawCover, exportCover, EXPORT_SIZES, GRADES, LAYOUTS, BACKDROPS, defaultState, layoutPanels } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const state = defaultState();
let selectedPanel = 0;

const $ = (id) => document.getElementById(id);

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

function layoutPanelsCount() {
  return LAYOUTS[state.layout].panels;
}

function buildLayoutButtons() {
  const wrap = $('layoutPick');
  wrap.innerHTML = '';
  for (const [key, def] of Object.entries(LAYOUTS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = def.label;
    b.classList.toggle('active', state.layout === key);
    b.addEventListener('click', () => {
      state.layout = key;
      selectedPanel = 0;
      buildLayoutButtons();
      redraw();
    });
    wrap.appendChild(b);
  }
}

function buildGradeButtons() {
  const wrap = $('gradePick');
  wrap.innerHTML = '';
  for (const [key, def] of Object.entries(GRADES)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = def.label;
    b.classList.toggle('active', state.grade === key);
    b.addEventListener('click', () => {
      state.grade = key;
      buildGradeButtons();
      redraw();
    });
    wrap.appendChild(b);
  }
}

function buildBackdropButtons() {
  const wrap = $('backdropPick');
  wrap.innerHTML = '';
  for (const [key, def] of Object.entries(BACKDROPS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = def.label;
    b.classList.toggle('active', state.backdrop === key);
    b.addEventListener('click', () => {
      state.backdrop = key;
      buildBackdropButtons();
      redraw();
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

$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
$('credits').addEventListener('input', (e) => { state.credits = e.target.value; redraw(); });
$('issue').addEventListener('input', (e) => { state.issue = e.target.value.replace(/[^0-9]/g, '').slice(0, 2); redraw(); });
$('halftone').addEventListener('change', (e) => { state.halftone = e.target.checked; redraw(); });
$('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
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

buildLayoutButtons();
buildGradeButtons();
buildBackdropButtons();
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
    syncButtons: () => { buildLayoutButtons(); buildGradeButtons(); buildBackdropButtons(); },
  });
} else {
  loadDefaults();
}
