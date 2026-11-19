// Vice District Cover Studio — page wiring (v27).
// v27 adds: Vice District — a District dial (Ocean Drive / Little Havana /
// Downtown / Port Vice / Everglades + an intensity slider 0–100%) that
// sets the whole cover in one corner of Vice City (district tint + seeded
// skyline silhouette + lit windows + district chip), 5 one-click district
// presets, the 29th template (Vice Ocean Drive), and the History
// Timeline's own "District" label. Everything from v1–v26 is kept.
// v25 adds: Vice Weather — a Weather dial (Clear / Golden Haze / Rain /
// Storm / Fog + an intensity slider 0–100%) that weathers the whole cover
// (mood tint + seeded rain streaks + fog bands + lightning + weather chip),
// 5 one-click weather presets, the 27th template (Vice Storm), and the
// History Timeline's own "Weather" label. Everything from v1–v24 is kept.
// v24 adds: Vice Clock — a Time-of-Day dial (05:00–24:00) that morphs the
// whole cover (sky tint + travelling sun/moon + clock chip), 5 one-click
// time presets, the 26th template (Vice Golden Hour), and the History
// Timeline's own "Time of day" label. Everything from v1–v23 is kept.
// v23 adds: Magazine Furniture — barcode + issue / date / price strip, the
// Key Art layout, the Blue Hour grade, and the 25th template (Vice Key
// Art). Everything from v1–v22 is kept.
// v22 adds: Double Exposure — a second photo blended into the selected
// panel (5 modes, strength slider, swap button), the 24th template (Vice
// Double Exposure), and the History Timeline's own "Double exposure"
// label. Everything from v1–v21 is kept.
// v21 adds: the Bottom Heavy layout, Auto-caption v3 (Retro Ad /
// Breaking News / Album Liner — 9 caption cards in all), Tilt Pro
// (three new presets — Poster Lean, Billboard, Phone Tilt — plus a
// shadow-style picker: soft / hard / neon glow), and the 23rd template
// (Vice Bottom Heavy). Everything from v1–v20 is kept.
// v20 adds: the Center Stage layout, two new frames (Gold Foil +
// Blueprint — 11 total), three new stickers (palm tree, smiling sun,
// cassette — 13 total), and the 22nd template (Vice Center Stage).
// Everything from v1–v19 is kept.
// v19 adds: the History Timeline strip (every undo step as a labelled
// thumbnail — click any step to jump straight back to it), the Hero Left
// layout, two new frames (Comic Burst + Retro TV), and the 21st template
// (Vice Timeline). Everything from v1–v18 is kept.
// v18 adds: two layouts (Quad Grid + Split Screen — 19 total), Auto-caption
// v2 (Tagline Punch / Movie Credit Line / Neon Slogan — 6 caption cards in
// all, each v2 card also sets the cover lines), two new Looks (Vice Noir +
// Golden Coast — 8 total), and the 20th template (Vice Layouts).
// Everything from v1–v17 is kept.
// v17 adds: Custom export size (any W x H up to 4096, aspect-lock toggle,
// X header / LinkedIn / ultrawide presets), Color harmony (Complementary /
// Analogous / Triadic from the dominant colour), Neon Border + VHS frames,
// and the 19th template (Vice Studio Pro). Everything from v1–v16 is kept.
// v12 adds: 3D Tilt & Mockups — tilt sliders + presets (state.tilt, undo
// covered), mockup export buttons (framed / phone / billboard, all three),
// and the Showcase layout auto-arming its gallery lean on pick.
// v13 adds: Print-size export (A4 / A3 / Poster PNGs), logo/watermark
// upload (the user's own PNG, 5 positions, size + opacity, baked into
// every export), and a session gallery (every exported cover saved in
// memory with a thumbnail — click to load it back into the editor).
// v14 adds: Bebas Neue (third OFL display font) + font pairing cards
// (three one-click title + tagline pairs), Export everything (all 11
// outputs in one click, live progress bar), and two layouts — Grid 2x2
// and Banner Cinema. Templates now apply their named fonts (v11-v13
// templates silently kept the old faces before this fix).
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
// v9 adds: Batch mode (up to 6 photos -> 6 different covers, each recipe
// picked deterministically from that photo's own pixels), the Frames pack
// (5 procedural border treatments, baked into the PNG), and Smart Crop
// (the focus point of a photo steers the panel crop onto the subject).
import {
  drawCover, exportCover, exportSeries, EXPORT_SIZES, GRADES, LAYOUTS, BACKDROPS,
  TREATMENTS, TITLE_STYLES, LOOKS, applyLook, snapshotState, restoreState,
  defaultState, layoutPanels, TEMPLATES, applyTemplate, templateMatches,
  COLORPOPS, FILMS, ART_ELEMENTS, BUBBLE_STYLES, BUBBLE_KINDS, defaultArt,
  defaultBubbles, serializeProject, deserializeProject, layoutBubbles,
  DARKROOM_CHANNELS, HSL_CHANNELS, defaultDarkroom, applyDarkroomPreset,
  darkroomActive, analyzePhoto, suggestCovers,
  defaultGlitch, glitchActive, STICKER_KINDS, defaultStickers,
  layoutStickers, suggestCaptions, suggestCaptionsV2, suggestCaptionsV3,
  PALETTE_PRESETS, extractPalette, defaultPalette, coverOfTheDay,
  applyCoverOfTheDay, exportContactSheet, CONTACT_SHEET,
  FRAMES, FRAME_KEYS, analyzeFocus, applySmartCrop, buildBatchVariants, exportBatch,
  CANVAS_BGS, defaultCanvasBg, defaultFreeform, freeformItemsFor,
  titleBlockCenter, FONTS, ensureDisplayFonts,
  FONT_PAIRINGS, exportEverything, EXPORT_EVERYTHING_COUNT,
  exportEverythingZip, createZipBlob, ZIP_FILE, crc32,
  STICKER_DEFAULT_COLORS, stickerColor,
  defaultTilt, TILT_PRESETS, tiltActive,
  MOCKUPS, exportMockup, exportAllMockups,
  PRINT_SIZES, exportPrintSizes,
  defaultLogo, LOGO_POSITIONS, logoActive, makeSampleLogoDataURL,
  defaultTitleFx, FILMS as FILM_PRESETS,
  // v17: color harmony + custom export size + new frames.
  HARMONY_SCHEMES, colorHarmonies, applyHarmony, defaultHarmony,
  CUSTOM_SIZE_PRESETS, CUSTOM_SIZE_MAX, clampCustomSize, exportCustomSize,
  // v19: History Timeline labels + the new layout / frames ride in
  // LAYOUTS / FRAMES / TEMPLATES (imported above).
  describeStateChange,
  // v22: Double Exposure — a second photo blended into a panel.
  BLEND_MODES, BLEND_MODE_KEYS, doubleExposureActive, applyDoubleExposure,
  clearDoubleExposure, clampBlendOpacity,
  // v23: Magazine Furniture — barcode + issue / date / price strip.
  defaultFurniture, furnitureActive, barcodeBars, drawFurniture,
  clampFurnitureIssue, clampFurnitureDate, clampFurniturePrice,
  // v24: Vice Clock — Time-of-Day dial + travelling sun/moon + clock chip.
  defaultTimeOfDay, timeOfDayActive, timeOfDayAt, clampTimeHour,
  formatClockHour, TIME_STOPS, TIME_PRESETS, drawTimeOfDay,
  // v25: Vice Weather — Weather dial + seeded rain/fog/lightning + chip.
  defaultWeather, weatherActive, weatherAt, clampWeatherIntensity,
  clampWeatherKind, WEATHER_KINDS, WEATHER_PRESETS, drawWeather,
  // v26: Vice Era — Era dial + seeded film grain + VHS scanlines + chip.
  defaultEra, eraActive, eraAt, clampEraIntensity,
  clampEra, ERA_KINDS, ERA_PRESETS, drawEra,
  // v27: Vice District — District dial + skyline silhouette + lit windows + chip.
  defaultDistrict, districtActive, districtAt, clampDistrictIntensity,
  clampDistrict, DISTRICT_KINDS, DISTRICT_PRESETS, drawDistrict,
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
  state, redraw: () => redraw(), drawCover, exportCover, exportSeries, LAYOUTS, GRADES, LOOKS,
  analyzePhoto, suggestCovers, serializeProject, deserializeProject,
  applyDarkroomPreset, darkroomActive, suggestCaptions, suggestCaptionsV2, suggestCaptionsV3, glitchActive,
  extractPalette, coverOfTheDay, applyCoverOfTheDay, exportContactSheet,
  PALETTE_PRESETS, CONTACT_SHEET,
  FRAMES, FRAME_KEYS, analyzeFocus, applySmartCrop, buildBatchVariants, exportBatch,
  FONTS, ensureDisplayFonts,
  FONT_PAIRINGS, exportEverything, EXPORT_EVERYTHING_COUNT,
  batchVariants: () => batchVariants, batchPhotos: () => batchPhotos,
  CANVAS_BGS, freeformItemsFor, defaultFreeform,
  enableFreeform, freeformSelected: () => selectedFree,
  snapGuides: () => snapGuides,
  defaultTilt, TILT_PRESETS, tiltActive,
  MOCKUPS, exportMockup, exportAllMockups,
  PRINT_SIZES, exportPrintSizes,
  defaultLogo, LOGO_POSITIONS, logoActive, makeSampleLogoDataURL,
  gallery: () => gallery,
  saveToGallery, loadGalleryItem, removeGalleryItem,
  loadLogoImage, setLogoFromDataUrl,
  applyTemplate, TEMPLATES, templateMatches,
  // v15: Title FX + films + A/B compare + shortcuts, for the regression test.
  defaultTitleFx, FILMS: FILM_PRESETS,
  // v16: ZIP export + new stickers, for the regression test.
  exportEverythingZip, createZipBlob, ZIP_FILE,
  STICKER_DEFAULT_COLORS, stickerColor, crc32, STICKER_KINDS,
  // v17: harmony + custom size + new frames, for the regression test.
  HARMONY_SCHEMES, colorHarmonies, applyHarmony, defaultHarmony,
  CUSTOM_SIZE_PRESETS, CUSTOM_SIZE_MAX, clampCustomSize, exportCustomSize,
  runHarmony, renderHarmonyCards, harmonyBase: () => lastHarmonyBase,
  runExportCustom, syncCustomSizeUI,
  // v19: History Timeline + new layout/frames, for the regression test.
  describeStateChange, EXPORT_SIZES,
  historyEntries: () => history,
  historyLabels: () => history.map((e, i) => describeStateChange(e.snap, history[i + 1] ? history[i + 1].snap : snapshotState(state))),
  jumpHistory, renderTimeline, runTimelineDemo,
  openAB, renderAB, abVisible: () => abOpen,
  selectedSticker: () => selectedSticker,
  selectedBubble: () => selectedBubble,
  deleteSelectedDecoration, nudgeSelectedFree,
  // v22: Double Exposure, for the regression test.
  BLEND_MODES, BLEND_MODE_KEYS, doubleExposureActive, applyDoubleExposure,
  clearDoubleExposure, clampBlendOpacity,
  // v23: Key Art + Magazine Furniture, for the regression test.
  defaultFurniture, furnitureActive, barcodeBars, drawFurniture,
  clampFurnitureIssue, clampFurnitureDate, clampFurniturePrice,
  // v24: Vice Clock, for the regression test.
  defaultTimeOfDay, timeOfDayActive, timeOfDayAt, clampTimeHour,
  formatClockHour, TIME_STOPS, TIME_PRESETS, drawTimeOfDay,
  // v25: Vice Weather, for the regression test.
  defaultWeather, weatherActive, weatherAt, clampWeatherIntensity,
  clampWeatherKind, WEATHER_KINDS, WEATHER_PRESETS, drawWeather,
  // v26: Vice Era, for the regression test.
  defaultEra, eraActive, eraAt, clampEraIntensity,
  clampEra, ERA_KINDS, ERA_PRESETS, drawEra,
  // v27: Vice District, for the regression test.
  defaultDistrict, districtActive, districtAt, clampDistrictIntensity,
  clampDistrict, DISTRICT_KINDS, DISTRICT_PRESETS, drawDistrict,
  layoutPanels,
};

const $ = (id) => document.getElementById(id);

// --- Undo history + History Timeline (v19) --------------------------------
// A snapshot is pushed at the START of each user gesture (button click, or
// pointerdown/focus on a slider, checkbox, select or text field), so the
// stored state is always the pre-change one. Identical consecutive snapshots
// are skipped, so one gesture never pushes twice.
//
// v19: the history is no longer blind — every entry is shown in the
// History Timeline strip (fieldset 2d) as a small painted thumbnail with
// a one-line label of what that step changed ("Layout: Hero Left",
// "Grade: Neon Nights"), computed by describeStateChange between the
// entry's snapshot and the next state. Clicking a thumbnail jumps the
// editor straight back to that state (and drops the steps after it, the
// way a timeline scrub does); the last item is always the current cover,
// marked "Now".
const history = [];
let lastSnapJson = '';
function pushHistory() {
  const snap = snapshotState(state);
  const json = JSON.stringify(snap);
  if (json === lastSnapJson) return;
  lastSnapJson = json;
  history.push({ snap });
  if (history.length > 20) history.shift();
}
function undo() {
  const entry = history.pop();
  if (!entry) {
    status.textContent = 'Nothing to undo yet — change something first.';
    return;
  }
  lastSnapJson = '';
  restoreState(state, entry.snap);
  syncAll();
  redraw();
  status.textContent = 'Undid the last change.';
}

// Paints one history entry (or the live state) as a 96x54 thumbnail.
function paintTimelineThumb(canvasEl, snap) {
  const tmp = { ...snap, compare: 1, photos: state.photos, backdropImgs: state.backdropImgs, logoImg: state.logoImg };
  tmp.panels = (snap.panels || []).map((p) => ({ ...p }));
  tmp.coverLines = [...(snap.coverLines || [])];
  canvasEl.width = 96;
  canvasEl.height = 54;
  try {
    drawCover(canvasEl, tmp);
  } catch { /* a stale snapshot never breaks the editor */ }
}

function renderTimeline() {
  const wrap = $('historyTimeline');
  if (!wrap) return;
  wrap.innerHTML = '';
  history.forEach((entry, i) => {
    const next = history[i + 1] ? history[i + 1].snap : snapshotState(state);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tl-item';
    b.title = `Jump back to step ${i + 1}: ${describeStateChange(entry.snap, next)}`;
    const c = document.createElement('canvas');
    paintTimelineThumb(c, entry.snap);
    const lab = document.createElement('span');
    lab.className = 'tl-label';
    lab.textContent = describeStateChange(entry.snap, next);
    const num = document.createElement('span');
    num.className = 'tl-num';
    num.textContent = String(i + 1);
    b.append(c, num, lab);
    b.addEventListener('click', () => jumpHistory(i));
    wrap.appendChild(b);
  });
  // The live cover, always last — the "Now" you are standing on.
  const now = document.createElement('button');
  now.type = 'button';
  now.className = 'tl-item tl-now';
  now.title = 'The cover as it is now';
  const c = document.createElement('canvas');
  paintTimelineThumb(c, snapshotState(state));
  const lab = document.createElement('span');
  lab.className = 'tl-label';
  lab.textContent = 'Now';
  const num = document.createElement('span');
  num.className = 'tl-num';
  num.textContent = '●';
  now.append(c, num, lab);
  wrap.appendChild(now);
  const count = $('historyCount');
  if (count) count.textContent = history.length
    ? `${history.length} step${history.length === 1 ? '' : 's'} in history — click any thumbnail to jump back to it. The last tile is the cover as it is now.`
    : 'No steps yet — change something (a Look, a layout, a frame) and each step appears here as a thumbnail you can jump back to.';
}

// Jump the editor back to history step i (0-based): restore that
// snapshot and drop every step after it, like scrubbing a timeline.
function jumpHistory(i) {
  const entry = history[i];
  if (!entry) return;
  lastSnapJson = '';
  restoreState(state, entry.snap);
  history.length = i;
  syncAll();
  redraw();
  renderTimeline();
  status.textContent = `Jumped back to step ${i + 1} of the timeline.`;
}

// Demo for screenshots (?shot=editor&timeline=1): four real gestures,
// each preceded by a history push, so the strip shows four labelled
// thumbnails plus the Now tile. Each gesture is a REAL change from the
// default state (a no-op gesture would label itself "Edit"): the Golden
// Coast Look (layout flips to Quad Grid), the Hero Left layout, the
// Comic Burst frame, and the Tagline Punch tagline.
function runTimelineDemo() {
  pushHistory();
  applyLook(state, 'goldenCoast');
  pushHistory();
  state.layout = 'heroleft';
  pushHistory();
  state.frame = 'comic';
  pushHistory();
  state.tagline = 'Faster than the sunset.';
  syncAll();
  redraw();
  renderTimeline();
}

// --- Keyboard shortcuts (v15) ------------------------------------------------
// Ctrl/Cmd+Z undo · Ctrl/Cmd+S export-all (4 sizes) · arrow keys nudge the
// selected freeform item (1px, Shift+arrow 10px) · Delete removes the
// selected sticker or bubble. Shortcuts never fire while typing in a text
// field (except Ctrl/Cmd+S, which still exports), and never while the
// A/B divider has focus (its own arrows move the divider instead).
let selectedSticker = null; // index into state.stickers, or null
let selectedBubble = null; // index into state.bubbles, or null
let lastNudgePush = 0;

function deleteSelectedDecoration() {
  if (selectedSticker != null && state.stickers && state.stickers[selectedSticker]) {
    pushHistory();
    state.stickers.splice(selectedSticker, 1);
    selectedSticker = null;
    buildStickerList();
    redraw();
    status.textContent = 'Sticker removed.';
    return true;
  }
  if (selectedBubble != null && state.bubbles && state.bubbles[selectedBubble]) {
    pushHistory();
    state.bubbles.splice(selectedBubble, 1);
    selectedBubble = null;
    buildBubbleList();
    redraw();
    status.textContent = 'Bubble removed.';
    return true;
  }
  return false;
}

function nudgeSelectedFree(dxPx, dyPx) {
  if (!selectedFree || !state.freeform || !state.freeform.on) return false;
  const W = canvas.width || 1080;
  const H = canvas.height || 1080;
  // One undo step per burst of nudges, not one per keypress.
  const now = Date.now();
  if (now - lastNudgePush > 600) {
    pushHistory();
    lastNudgePush = now;
  }
  if (selectedFree.kind === 'panel') {
    const it = (state.freeform.items || [])[selectedFree.index];
    if (!it) return false;
    it.x += dxPx / W;
    it.y += dyPx / H;
    it.modified = true;
  } else if (selectedFree.kind === 'title') {
    const t = state.freeform.title;
    if (!t) return false;
    t.x = (t.x == null ? 0.5 : t.x) + dxPx / W;
    t.y = (t.y == null ? 0.32 : t.y) + dyPx / H;
    state.freeform.titleMoved = true;
  } else {
    return false;
  }
  syncFreeformUI();
  redraw();
  return true;
}

document.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;
  const key = e.key || '';
  if (mod && (key === 's' || key === 'S')) {
    e.preventDefault();
    const b = $('exportAll');
    if (b) b.click();
    return;
  }
  const tag = (e.target && e.target.tagName) || '';
  const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
    || (e.target && e.target.isContentEditable)
    || (e.target && e.target.id === 'abDivider');
  if (typing) return;
  if (mod && (key === 'z' || key === 'Z')) {
    e.preventDefault();
    undo();
    return;
  }
  if (key === 'Delete' || key === 'Backspace') {
    if (deleteSelectedDecoration()) e.preventDefault();
    return;
  }
  if (key.startsWith('Arrow')) {
    const step = e.shiftKey ? 10 : 1;
    const dx = key === 'ArrowLeft' ? -step : key === 'ArrowRight' ? step : 0;
    const dy = key === 'ArrowUp' ? -step : key === 'ArrowDown' ? step : 0;
    if (nudgeSelectedFree(dx, dy)) e.preventDefault();
  }
});

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  // Freeform mode (v10): the items belong to one layout — if the layout
  // changed under them (Look, template, layout button), re-derive them so
  // the editor never drags a stale arrangement. The title keeps its spot.
  const ff = state.freeform;
  if (ff && ff.on && (ff.layout !== state.layout || !ff.items || ff.items.length !== layoutPanelsCount())) {
    const title = ff.title || { x: 0.5, y: 0.32, rot: 0 };
    state.freeform = { on: true, snap: ff.snap !== false, layout: state.layout, items: freeformItemsFor(state.layout), title, titleMoved: !!ff.titleMoved };
    if (selectedFree && selectedFree.kind === 'panel' && selectedFree.index >= layoutPanelsCount()) selectedFree = null;
  }
  drawCover(canvas, state);
  if (state.freeform && state.freeform.on) drawFreeformOverlay();
  syncPanelControls();
  syncFurnitureUI();
  syncTimeOfDayUI();
  syncWeatherUI();
  syncEraUI();
  syncDistrictUI();
  syncSeriesStrip();
  scheduleAutosave();
}

// --- Logo / watermark + session gallery (v13) --------------------------------
// Logo: the user's own PNG, loaded with FileReader (local only). The data
// URL lives in state.logo.dataUrl (snapshotted / autosaved / in projects);
// the Image lives on state.logoImg and is rebuilt from the data URL after
// any restore (autosave, project load, gallery load).
async function loadLogoImage() {
  const dataUrl = state.logo && state.logo.dataUrl;
  if (!dataUrl) {
    state.logoImg = null;
    return false;
  }
  try {
    state.logoImg = await loadImage(dataUrl);
    redraw();
    return true;
  } catch {
    state.logoImg = null;
    return false;
  }
}

async function setLogoFromDataUrl(dataUrl) {
  pushHistory();
  state.logo = state.logo || defaultLogo();
  state.logo.dataUrl = dataUrl;
  const ok = await loadLogoImage();
  syncLogoUI();
  redraw();
  status.textContent = ok ? 'Logo on the cover — pick a corner, size and opacity.' : 'That file did not load as an image.';
  return ok;
}

function syncLogoUI() {
  const logo = state.logo || defaultLogo();
  state.logo = logo;
  const pos = $('logoPos');
  if (pos) pos.value = logo.position || 'bottom-right';
  const size = $('logoSize');
  if (size) size.value = String(logo.size || 0.12);
  const sizeVal = $('logoSizeVal');
  if (sizeVal) sizeVal.textContent = `${Math.round((logo.size || 0.12) * 100)}% of the short side`;
  const op = $('logoOpacity');
  if (op) op.value = String(logo.opacity == null ? 0.85 : logo.opacity);
  const opVal = $('logoOpacityVal');
  if (opVal) opVal.textContent = `${Math.round((logo.opacity == null ? 0.85 : logo.opacity) * 100)}%`;
  const label = $('logoStatus');
  if (label) {
    label.textContent = logo.dataUrl
      ? `Logo on — ${(LOGO_POSITIONS[logo.position] || {}).label || logo.position}, ${Math.round((logo.size || 0.12) * 100)}% size, ${Math.round((logo.opacity == null ? 0.85 : logo.opacity) * 100)}% opacity. It exports into every PNG.`
      : 'No logo yet — upload your own PNG and it stamps onto the cover (nothing is uploaded anywhere).';
  }
  const preview = $('logoPreview');
  if (preview) {
    preview.innerHTML = '';
    if (logo.dataUrl) {
      const img = document.createElement('img');
      img.src = logo.dataUrl;
      img.alt = 'Your logo';
      preview.appendChild(img);
    } else {
      preview.textContent = 'No logo';
    }
  }
}

function buildLogoUI() {
  const pos = $('logoPos');
  if (pos) {
    pos.innerHTML = '';
    for (const [key, def] of Object.entries(LOGO_POSITIONS)) {
      const o = document.createElement('option');
      o.value = key;
      o.textContent = def.label;
      pos.appendChild(o);
    }
  }
  $('logoFile').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!/^image\/png$/i.test(file.type || '')) {
      status.textContent = 'Logo must be a PNG — pick a .png file (transparency works).';
      e.target.value = '';
      return;
    }
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    await setLogoFromDataUrl(dataUrl);
    e.target.value = '';
  });
  $('logoPos').addEventListener('change', (e) => {
    pushHistory();
    state.logo.position = e.target.value;
    syncLogoUI();
    redraw();
  });
  $('logoSize').addEventListener('input', (e) => {
    state.logo.size = Number(e.target.value);
    syncLogoUI();
    redraw();
  });
  $('logoSize').addEventListener('pointerdown', pushHistory);
  $('logoOpacity').addEventListener('input', (e) => {
    state.logo.opacity = Number(e.target.value);
    syncLogoUI();
    redraw();
  });
  $('logoOpacity').addEventListener('pointerdown', pushHistory);
  $('logoRemove').addEventListener('click', () => {
    pushHistory();
    state.logo.dataUrl = null;
    state.logoImg = null;
    syncLogoUI();
    redraw();
    status.textContent = 'Logo removed — the cover is clean again.';
  });
  syncLogoUI();
}

// Session gallery: every cover made or exported in THIS session, kept in
// memory only (never localStorage — the photos are data URLs and a
// session's worth of thumbnails stays light). Each entry holds a state
// snapshot + the photos' data URLs + a 270px thumbnail, so clicking it
// restores that exact cover into the editor. Exports auto-save here;
// the button saves the current cover by hand.
let gallery = [];
let gallerySeq = 0;

function galleryThumb() {
  const c = document.createElement('canvas');
  c.width = 270;
  c.height = 270;
  drawCover(c, { ...state, compare: 1 });
  return c.toDataURL('image/jpeg', 0.82);
}

function addCurrentToGallery(name) {
  const entry = {
    id: ++gallerySeq,
    name: name || (state.title || 'VICE'),
    time: new Date().toLocaleTimeString(),
    thumb: galleryThumb(),
    snap: snapshotState(state),
    photoData: [...(state.photoData || [null, null, null])],
  };
  gallery.push(entry);
  renderGallery();
  // v15: a fresh export refreshes the A/B compare's "last" side live.
  if (abOpen) renderAB();
  return entry;
}

function saveToGallery(name) {
  const entry = addCurrentToGallery(name || (state.title || 'VICE'));
  status.textContent = `Saved “${entry.name}” to the session gallery (${gallery.length} cover${gallery.length === 1 ? '' : 's'} this session).`;
  return entry;
}

async function loadGalleryItem(id) {
  const entry = gallery.find((g) => g.id === id);
  if (!entry) return false;
  pushHistory();
  restoreState(state, entry.snap);
  state.photoData = [...(entry.photoData || [null, null, null])];
  for (let i = 0; i < 3; i++) {
    if (state.photoData[i]) {
      try { state.photos[i] = await loadImage(state.photoData[i]); } catch { state.photos[i] = null; }
    }
  }
  if (!state.photos[2]) state.photos[2] = state.photos[0];
  await loadLogoImage();
  syncAll();
  redraw();
  status.textContent = `Loaded “${entry.name}” from the gallery (${entry.time}).`;
  return true;
}

function removeGalleryItem(id) {
  const i = gallery.findIndex((g) => g.id === id);
  if (i < 0) return false;
  const [removed] = gallery.splice(i, 1);
  renderGallery();
  status.textContent = `Removed “${removed.name}” from the gallery.`;
  return true;
}

function renderGallery() {
  const wrap = $('galleryGrid');
  if (!wrap) return;
  wrap.innerHTML = '';
  const count = $('galleryCount');
  if (count) {
    count.textContent = gallery.length
      ? `${gallery.length} cover${gallery.length === 1 ? '' : 's'} this session — click one to load it back into the editor.`
      : 'Nothing saved yet — export a cover, or press “Save current cover to gallery”.';
  }
  gallery.forEach((entry) => {
    const fig = document.createElement('figure');
    fig.className = 'gallery-cell';
    const img = document.createElement('img');
    img.src = entry.thumb;
    img.alt = entry.name;
    img.addEventListener('click', () => loadGalleryItem(entry.id));
    const cap = document.createElement('figcaption');
    const nameEl = document.createElement('b');
    nameEl.textContent = entry.name;
    cap.append(nameEl, document.createTextNode(` · ${entry.time}`));
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '✕';
    del.setAttribute('aria-label', `Remove ${entry.name} from gallery`);
    del.addEventListener('click', (e) => { e.stopPropagation(); removeGalleryItem(entry.id); });
    fig.append(img, cap, del);
    wrap.appendChild(fig);
  });
}

function buildGalleryUI() {
  $('saveGallery').addEventListener('click', () => saveToGallery());
  renderGallery();
}

// --- A/B compare (v15) -------------------------------------------------------
// Current cover (live editor state) vs the last exported cover (session
// gallery), side by side in one frame with a draggable divider: the LAST
// cover is clipped by the divider position, so dragging wipes between
// before and after. The last cover is re-rendered from its gallery
// snapshot + photo data URLs, at the same size as the live preview, so
// the two line up pixel for pixel. With no exported cover yet, the panel
// says so plainly instead of showing an empty frame.
let abOpen = false;
let abPos = 50;

function applyABPos() {
  const last = $('abLast');
  if (last) last.style.clipPath = `inset(0 ${100 - abPos}% 0 0)`;
  const d = $('abDivider');
  if (d) {
    d.style.left = `${abPos}%`;
    d.setAttribute('aria-valuenow', String(Math.round(abPos)));
  }
}

async function renderAB() {
  const wrap = $('abWrap');
  const empty = $('abEmpty');
  if (!wrap || !empty) return false;
  const last = gallery[gallery.length - 1];
  if (!last) {
    wrap.hidden = true;
    empty.hidden = false;
    empty.textContent = 'No exported cover yet — export a cover (or save one to the gallery) and the last one appears here for comparison.';
    return false;
  }
  empty.hidden = true;
  wrap.hidden = false;
  drawCover($('abCurrent'), { ...state, compare: 1 });
  const photos = [null, null, null];
  for (let i = 0; i < 3; i++) {
    if (last.photoData && last.photoData[i]) {
      try { photos[i] = await loadImage(last.photoData[i]); } catch { photos[i] = null; }
    }
  }
  if (!photos[2]) photos[2] = photos[0];
  const s = {
    ...last.snap,
    photos,
    photoData: [...(last.photoData || [null, null, null])],
    backdropImgs: state.backdropImgs,
    logoImg: null,
  };
  if (last.snap && last.snap.logo && last.snap.logo.dataUrl) {
    try { s.logoImg = await loadImage(last.snap.logo.dataUrl); } catch { s.logoImg = null; }
  }
  drawCover($('abLast'), { ...s, compare: 1 });
  applyABPos();
  return true;
}

async function openAB(scroll = true) {
  abOpen = true;
  $('abToggle').textContent = 'Hide A/B compare';
  await renderAB();
  if (scroll) $('fs-compare').scrollIntoView({ block: 'start' });
}

function closeAB() {
  abOpen = false;
  $('abWrap').hidden = true;
  $('abToggle').textContent = 'Show A/B compare';
}

function buildABUI() {
  $('abToggle').addEventListener('click', () => {
    if (abOpen) closeAB();
    else openAB();
  });
  const wrap = $('abWrap');
  const div = $('abDivider');
  let dragging = false;
  const setFromEvent = (e) => {
    const r = wrap.getBoundingClientRect();
    if (!r.width) return;
    abPos = Math.max(2, Math.min(98, ((e.clientX - r.left) / r.width) * 100));
    applyABPos();
  };
  div.addEventListener('pointerdown', (e) => {
    dragging = true;
    div.setPointerCapture(e.pointerId);
  });
  div.addEventListener('pointermove', (e) => { if (dragging) setFromEvent(e); });
  div.addEventListener('pointerup', () => { dragging = false; });
  wrap.addEventListener('pointerdown', (e) => {
    if (e.target === div) return;
    setFromEvent(e);
  });
  div.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { abPos = Math.max(2, abPos - 2); applyABPos(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { abPos = Math.min(98, abPos + 2); applyABPos(); e.preventDefault(); }
  });
  applyABPos();
}

// --- Freeform mode (v10) ---------------------------------------------------
// The preview canvas is also the editor: drag a panel to move it, drag a
// corner handle to resize it, drag the ring above it to rotate it, drag the
// title block to move the lettering. Snap guides (pink lines) appear when a
// panel's centre or edge lines up with the canvas centre or edge, and the
// panel snaps onto it. The overlay lives only on the preview canvas —
// exportCover renders on a fresh canvas, so guides and handles never reach
// the PNG, while every move, resize and rotation does.
let selectedFree = null; // { kind: 'panel', index } | { kind: 'title' }
let snapGuides = []; // [{ axis: 'v'|'h', pos }] — drawn by the overlay only

function enableFreeform(preset) {
  const ff = state.freeform || defaultFreeform();
  ff.on = true;
  ff.layout = state.layout;
  ff.items = freeformItemsFor(state.layout);
  if (preset) {
    const tilts = [-6, 5, -4, 3, -5];
    ff.items.forEach((it, i) => {
      it.rot = (it.rot || 0) + tilts[i % tilts.length];
      if (i === 1) it.x = Math.min(0.95 - it.w, it.x + 0.02);
      if (i === 3) it.y = Math.max(0, it.y - 0.02);
      it.modified = true;
    });
    ff.title = { x: 0.5, y: 0.55, rot: -4 };
    ff.titleMoved = true;
  } else {
    // The title stays exactly where it was: its freeform centre starts at
    // the title block's natural centre on this canvas, unmoved.
    const nat = titleBlockCenter(state, canvas.width, canvas.height);
    ff.title = { x: nat.x / canvas.width, y: nat.y / canvas.height, rot: 0 };
    ff.titleMoved = false;
  }
  state.freeform = ff;
  selectedFree = { kind: 'panel', index: 0 };
  return ff;
}

function freeformItemRect(i, W, H) {
  const ff = state.freeform;
  const it = ff && ff.items && ff.items[i];
  if (!it) return null;
  return { x: it.x * W, y: it.y * H, w: it.w * W, h: it.h * H, rot: it.rot || 0, cx: (it.x + it.w / 2) * W, cy: (it.y + it.h / 2) * H };
}

function titleBox(W, H) {
  const ff = state.freeform || {};
  const t = ff.title || { x: 0.5, y: 0.32, rot: 0 };
  const S = Math.min(W, H);
  const words = (state.title || 'VICE').trim().split(/\s+/).filter(Boolean).length || 1;
  const h = Math.min(H * 0.4, S * 0.115 * words + S * 0.075);
  return { x: t.x * W - W * 0.46, y: t.y * H - h / 2, w: W * 0.92, h, cx: t.x * W, cy: t.y * H, rot: t.rot || 0 };
}

function pointInRotated(px, py, r) {
  // Rotate the point back around the rect centre, then test the axis box.
  const rad = (-(r.rot || 0) * Math.PI) / 180;
  const dx = px - r.cx;
  const dy = py - r.cy;
  const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
  return { lx, ly, inside: Math.abs(lx) <= r.w / 2 && Math.abs(ly) <= r.h / 2 };
}

function snapValue(v, targets, threshold) {
  for (const t of targets) {
    if (Math.abs(v - t) <= threshold) return { value: t, guide: t };
  }
  return { value: v, guide: null };
}

function drawFreeformOverlay() {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.save();
  // Snap guides first, under the handles.
  for (const g of snapGuides) {
    ctx.strokeStyle = '#ff2e88';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    if (g.axis === 'v') { ctx.moveTo(g.pos, 0); ctx.lineTo(g.pos, H); }
    else { ctx.moveTo(0, g.pos); ctx.lineTo(W, g.pos); }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // Selection: dashed outline + corner handles + rotate ring above.
  const drawSelection = (r) => {
    ctx.save();
    ctx.translate(r.cx, r.cy);
    ctx.rotate(((r.rot || 0) * Math.PI) / 180);
    ctx.translate(-r.cx, -r.cy);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.setLineDash([]);
    const hs = Math.max(10, Math.round(Math.min(W, H) * 0.012));
    ctx.fillStyle = '#ff2e88';
    ctx.strokeStyle = '#ffffff';
    for (const [hx, hy] of [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]]) {
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
      ctx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
    }
    // Rotate handle: ring above the top edge, joined by a stem.
    const ringY = r.y - Math.max(24, Math.round(Math.min(W, H) * 0.03));
    ctx.beginPath();
    ctx.moveTo(r.cx, r.y);
    ctx.lineTo(r.cx, ringY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r.cx, ringY, hs * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };
  if (selectedFree && selectedFree.kind === 'panel') {
    const r = freeformItemRect(selectedFree.index, W, H);
    if (r) drawSelection(r);
  } else if (selectedFree && selectedFree.kind === 'title') {
    drawSelection(titleBox(W, H));
  }
  ctx.restore();
}

function freeformDemo() {
  // For the editor screenshot: freeform on with a tilt, the bottom-middle
  // panel selected (the vertical snap guide runs straight through it), and
  // a vertical snap guide through the canvas centre, as if the panel had
  // just been dragged onto it.
  if (!state.freeform || !state.freeform.on) enableFreeform(true);
  const n = (state.freeform.items || []).length;
  selectedFree = { kind: 'panel', index: Math.max(0, Math.min(2, n - 1)) };
  snapGuides = [{ axis: 'v', pos: canvas.width / 2 }];
  redraw();
}

function syncFreeformUI() {
  const ff = state.freeform || defaultFreeform();
  const on = $('freeformOn');
  if (on) on.checked = !!ff.on;
  const snap = $('freeformSnap');
  if (snap) snap.checked = ff.snap !== false;
  const pm = $('printMarks');
  if (pm) pm.checked = !!state.printMarks;
  const bg = state.canvasBg || defaultCanvasBg();
  const kind = $('canvasBgKind');
  if (kind) kind.value = bg.kind || 'none';
  const c1 = $('canvasBgColor1');
  if (c1) c1.value = bg.color || '#ff2e88';
  const c2 = $('canvasBgColor2');
  if (c2) c2.value = bg.color2 || '#00e5ff';
  const sel = $('freeformSelected');
  if (sel) {
    sel.textContent = !ff.on
      ? 'Freeform off — the layout grid rules the cover.'
      : selectedFree && selectedFree.kind === 'title'
        ? 'Selected: title block — drag it anywhere, rotate with the ring.'
        : selectedFree
          ? `Selected: panel ${selectedFree.index + 1} of ${layoutPanelsCount()} — drag to move, corner to resize, ring to rotate.`
          : 'Freeform on — click a panel or the title to select it.';
  }
  const sec = $('fs-freeform');
  if (sec) sec.classList.toggle('freeform-on', !!ff.on);
}

function buildFreeformUI() {
  $('freeformOn').addEventListener('change', (e) => {
    pushHistory();
    if (e.target.checked) {
      enableFreeform(false);
      status.textContent = 'Freeform on — drag any panel or the title on the preview.';
    } else {
      state.freeform.on = false;
      selectedFree = null;
      snapGuides = [];
      status.textContent = 'Freeform off — back to the fixed layout.';
    }
    syncFreeformUI();
    redraw();
  });
  $('freeformSnap').addEventListener('change', (e) => {
    pushHistory();
    if (!state.freeform) state.freeform = defaultFreeform();
    state.freeform.snap = e.target.checked;
    redraw();
  });
  $('freeformReset').addEventListener('click', () => {
    pushHistory();
    const nat = titleBlockCenter(state, canvas.width, canvas.height);
    state.freeform = { on: true, snap: state.freeform ? state.freeform.snap !== false : true, layout: state.layout, items: freeformItemsFor(state.layout), title: { x: nat.x / canvas.width, y: nat.y / canvas.height, rot: 0 }, titleMoved: false };
    selectedFree = { kind: 'panel', index: 0 };
    snapGuides = [];
    syncFreeformUI();
    redraw();
    status.textContent = 'Freeform reset — panels back on the layout grid.';
  });
  const moveZ = (dir) => {
    if (!selectedFree || selectedFree.kind !== 'panel') {
      status.textContent = 'Select a panel first — z-order moves panels, not the title.';
      return;
    }
    const items = (state.freeform && state.freeform.items) || [];
    const idx = selectedFree.index;
    const z = items.map((it, i) => ({ i, z: it.z != null ? it.z : i })).sort((a, b) => a.z - b.z);
    const pos = z.findIndex((e) => e.i === idx);
    const swapWith = z[pos + dir];
    if (!swapWith) {
      status.textContent = dir > 0 ? 'Already at the front.' : 'Already at the back.';
      return;
    }
    pushHistory();
    const a = items[idx].z != null ? items[idx].z : idx;
    const b = items[swapWith.i].z != null ? items[swapWith.i].z : swapWith.i;
    items[idx].z = b;
    items[swapWith.i].z = a;
    redraw();
    status.textContent = dir > 0 ? `Panel ${idx + 1} brought forward.` : `Panel ${idx + 1} sent backward.`;
  };
  $('freeformFwd').addEventListener('click', () => moveZ(1));
  $('freeformBack').addEventListener('click', () => moveZ(-1));
  const rotateSel = (deg) => {
    if (!selectedFree) {
      status.textContent = 'Select a panel or the title first.';
      return;
    }
    pushHistory();
    if (selectedFree.kind === 'title') {
      const t = state.freeform.title || (state.freeform.title = { x: 0.5, y: 0.32, rot: 0 });
      t.rot = ((t.rot || 0) + deg + 180) % 360 - 180;
      state.freeform.titleMoved = true;
    } else {
      const it = state.freeform.items[selectedFree.index];
      if (it) {
        it.rot = (((it.rot || 0) + deg + 180) % 360) - 180;
        it.modified = true;
      }
    }
    redraw();
  };
  $('freeformRotL').addEventListener('click', () => rotateSel(-15));
  $('freeformRotR').addEventListener('click', () => rotateSel(15));
  $('printMarks').addEventListener('change', (e) => {
    pushHistory();
    state.printMarks = e.target.checked;
    redraw();
    status.textContent = e.target.checked
      ? 'Print marks on — bleed, crop marks and safe area will export with the PNG.'
      : 'Print marks off — clean export.';
  });
  const bgChanged = () => {
    pushHistory();
    const kind = $('canvasBgKind').value;
    state.canvasBg = {
      kind,
      color: $('canvasBgColor1').value,
      color2: $('canvasBgColor2').value,
    };
    redraw();
  };
  $('canvasBgKind').addEventListener('change', bgChanged);
  $('canvasBgColor1').addEventListener('input', () => {
    state.canvasBg = { ...(state.canvasBg || defaultCanvasBg()), color: $('canvasBgColor1').value };
    redraw();
  });
  $('canvasBgColor2').addEventListener('input', () => {
    state.canvasBg = { ...(state.canvasBg || defaultCanvasBg()), color2: $('canvasBgColor2').value };
    redraw();
  });
  $('canvasBgPalette').addEventListener('click', () => {
    pushHistory();
    const pal = state.palette;
    if (pal && pal.enabled && pal.stops && pal.stops.length >= 3) {
      state.canvasBg = { kind: 'gradient', color: pal.stops[0], color2: pal.stops[2] };
      $('canvasBgKind').value = 'gradient';
      $('canvasBgColor1').value = pal.stops[0];
      $('canvasBgColor2').value = pal.stops[2];
      redraw();
      status.textContent = `Canvas gradient from your palette — ${pal.stops[0]} → ${pal.stops[2]}.`;
    } else {
      status.textContent = 'No custom palette on — extract or pick one first, then use it as the canvas gradient.';
    }
  });
  syncFreeformUI();
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
    loadLogoImage();
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
    row.className = 'bubble-row' + (selectedBubble === i ? ' selected' : '');
    row.dataset.index = String(i);
    // v15: clicking a row selects that bubble — Delete removes it.
    row.addEventListener('click', () => {
      selectedBubble = i;
      selectedSticker = null;
      buildBubbleList();
      buildStickerList();
    });
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
      if (selectedBubble === i) selectedBubble = null;
      else if (selectedBubble != null && selectedBubble > i) selectedBubble--;
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
  $('captionSummary').textContent = `From the same photo reading as Smart Suggest — ${caps.length + 6} captions (3 classic + 3 v2 styles + 3 new v3 styles), same photo, same nine every time.`;
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
  // Auto-caption v2 (v18): three NEW styles on the same reading — each
  // card applies title + tagline + cover lines in one click, so the whole
  // cover voice changes together (the v7 cards only set title + tagline).
  const caps2 = suggestCaptionsV2(analysis);
  const wrap2 = $('captionCardsV2');
  if (wrap2) {
    wrap2.innerHTML = '';
    caps2.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'caption-card caption-card-v2';
      b.dataset.title = c.title;
      b.dataset.style = c.style;
      const titleEl = document.createElement('b');
      titleEl.textContent = `${c.style} · ${c.title}`;
      b.append(titleEl, document.createTextNode(` — “${c.tagline}”`));
      const small = document.createElement('small');
      small.textContent = `${c.reason} Cover lines: ${(c.coverLines || []).join(' / ')}`;
      b.appendChild(small);
      b.addEventListener('click', () => {
        pushHistory();
        state.title = c.title;
        state.tagline = c.tagline;
        if (c.coverLines) {
          state.coverLines = [...c.coverLines];
          state.coverLinesOn = true;
        }
        syncAll();
        redraw();
        status.textContent = `Caption applied: ${c.style} — ${c.title}`;
      });
      wrap2.appendChild(b);
    });
  }
  // Auto-caption v3 (v21): three NEW styles on the same reading — each
  // card applies title + tagline + cover lines in one click, like v2.
  const caps3 = suggestCaptionsV3(analysis);
  const wrap3 = $('captionCardsV3');
  if (wrap3) {
    wrap3.innerHTML = '';
    caps3.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'caption-card caption-card-v3';
      b.dataset.title = c.title;
      b.dataset.style = c.style;
      const titleEl = document.createElement('b');
      titleEl.textContent = `${c.style} · ${c.title}`;
      b.append(titleEl, document.createTextNode(` — “${c.tagline}”`));
      const small = document.createElement('small');
      small.textContent = `${c.reason} Cover lines: ${(c.coverLines || []).join(' / ')}`;
      b.appendChild(small);
      b.addEventListener('click', () => {
        pushHistory();
        state.title = c.title;
        state.tagline = c.tagline;
        if (c.coverLines) {
          state.coverLines = [...c.coverLines];
          state.coverLinesOn = true;
        }
        syncAll();
        redraw();
        status.textContent = `Caption applied: ${c.style} — ${c.title}`;
      });
      wrap3.appendChild(b);
    });
  }
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

// --- Batch mode (v9) -----------------------------------------------------
// Up to 6 photos in, 6 different covers out. Each photo is read by the same
// pixel analysis as Smart Suggest, and its grade + layout + title + frame
// are picked FOR that photo — deterministic, so the same six photos always
// build the same six covers. The grid shows every variant live; Export batch
// saves all six as 1080x1080 PNGs.
let batchPhotos = [];
let batchVariants = [];

function batchSources() {
  // Uploaded batch photos first; without uploads, fall back to the editor's
  // photos + scene backdrops (5 distinct images) + a repeat of the first,
  // so the grid still fills all 6 slots for a screenshot or a first try.
  const uploaded = batchPhotos.filter(Boolean);
  if (uploaded.length) return uploaded.slice(0, 6);
  const pool = [];
  for (const img of state.photos) if (img) pool.push(img);
  for (const key of Object.keys(state.backdropImgs || {})) {
    const img = state.backdropImgs[key];
    if (img && !pool.includes(img)) pool.push(img);
  }
  while (pool.length < 6 && pool.length) pool.push(pool[0]);
  return pool.slice(0, 6);
}

function runBatch() {
  const sources = batchSources();
  if (!sources.length) {
    const el = $('batchStatus');
    if (el) el.textContent = 'No photos yet — upload some, or use a sample first.';
    return [];
  }
  batchVariants = buildBatchVariants(state, sources);
  renderBatchGrid();
  const el = $('batchStatus');
  if (el) {
    el.textContent = `${batchVariants.length} covers built — ${batchVariants.map((v) => `#${v.index + 1} ${v.title} (${v.gradeLabel} / ${v.frameLabel})`).join(' · ')}`;
  }
  status.textContent = `Batch built: ${batchVariants.length} covers from ${sources.length} photos.`;
  return batchVariants;
}

function renderBatchGrid() {
  const wrap = $('batchGrid');
  if (!wrap) return;
  wrap.innerHTML = '';
  batchVariants.forEach((v) => {
    const fig = document.createElement('figure');
    fig.className = 'batch-cell';
    const c = document.createElement('canvas');
    c.width = 270;
    c.height = 270;
    drawCover(c, v.state);
    const cap = document.createElement('figcaption');
    cap.textContent = `#${v.index + 1} ${v.title} — ${v.gradeLabel} · ${v.layoutLabel} · ${v.frameLabel}`;
    fig.append(c, cap);
    wrap.appendChild(fig);
  });
  if (!batchVariants.length) {
    wrap.innerHTML = '<p class="hint">No batch yet — upload up to 6 photos and press “Build batch”.</p>';
  }
}

function buildFrameButtons() {
  buildPickButtons('framePick', FRAMES, state.frame || 'none', (key) => { state.frame = key; });
  // v17: the Neon Border glow colour — push history on pointerdown/focus
  // (BEFORE the picker changes the value), like the Title FX colours.
  const fc = $('frameColor');
  if (fc) {
    fc.value = state.frameColor || '#00e5ff';
    if (!fc.dataset.wired) {
      fc.dataset.wired = '1';
      fc.addEventListener('pointerdown', () => pushHistory());
      fc.addEventListener('focus', () => pushHistory());
      fc.addEventListener('input', (e) => {
        state.frameColor = e.target.value;
        state.frame = 'neon';
        buildFrameButtons();
        redraw();
      });
    }
  }
}

// --- Color harmony (v17) ---------------------------------------------------
// Three colour-theory schemes from the photo's dominant colour. The cards
// are built by runHarmony (button or shot param); each card is one click
// that recolours Title FX (highlight + outline + shadow) from the scheme.
let lastHarmonyBase = null;

function renderHarmonyCards(base) {
  const wrap = $('harmonyCards');
  if (!wrap) return;
  lastHarmonyBase = base;
  const schemes = colorHarmonies(base);
  wrap.innerHTML = '';
  for (const [key, scheme] of Object.entries(HARMONY_SCHEMES)) {
    const stops = schemes[key];
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'harmony-card';
    card.dataset.harmony = key;
    const active = state.harmony && state.harmony.scheme === key && state.harmony.base === base;
    card.innerHTML = `<span class="harmony-swatches">${stops.map((c) => `<span class="harmony-swatch" style="background:${c}" title="${c}"></span>`).join('')}</span>`
      + `<span class="harmony-name">${scheme.label}${active ? ' ✓ applied' : ''}</span>`
      + `<span class="harmony-why">${scheme.why}</span>`
      + `<span class="harmony-stops">${stops.join(' · ')}</span>`;
    card.addEventListener('click', () => {
      pushHistory();
      applyHarmony(state, key, base);
      syncTitleFxUI();
      renderHarmonyCards(base);
      redraw();
      status.textContent = `Harmony “${scheme.label}” applied from ${base} — title FX now ${stops.join(' · ')}.`;
    });
    wrap.appendChild(card);
  }
}

function runHarmony() {
  const img = state.photos[0] || state.photos[1] || null;
  const base = img ? (extractPalette(img)[0] || '#ff6b35') : '#ff6b35';
  renderHarmonyCards(base);
  const el = $('harmonyStatus');
  if (el) el.textContent = img
    ? `From the photo's dominant colour ${base} — 3 schemes, one click applies each to the title.`
    : `No photo loaded — schemes computed from Vice orange ${base} instead. Load a photo and press again.`;
  return { base, schemes: colorHarmonies(base) };
}

function buildHarmonyUI() {
  $('suggestHarmony').addEventListener('click', () => {
    pushHistory();
    runHarmony();
    redraw();
  });
}

// --- Custom export size (v17) ----------------------------------------------
// Any W x H up to 4096 per side, with an aspect-lock toggle and 3 presets.
// The export re-renders the whole cover at that size — never a crop.
let customLockRatio = null;

function syncCustomSizeUI() {
  const cs = state.customSize || { w: 1500, h: 500 };
  const w = $('customW');
  const h = $('customH');
  if (w) w.value = String(cs.w);
  if (h) h.value = String(cs.h);
}

async function runExportCustom() {
  const wEl = $('customW');
  const hEl = $('customH');
  const w = wEl ? Number(wEl.value) : 1500;
  const h = hEl ? Number(hEl.value) : 500;
  const { w: cw, h: ch, clamped } = clampCustomSize(w, h);
  status.textContent = `Rendering custom ${cw} × ${ch}…`;
  const out = await exportCustomSize(state, cw, ch);
  downloadBlob(out.blob, out.file);
  state.customSize = { w: cw, h: ch };
  addCurrentToGallery(out.label);
  const note = $('customSizeStatus');
  if (note) note.textContent = `Saved ${out.file} — ${cw} × ${ch} PNG${clamped ? ` (clamped to the 4096-per-side limit from ${w} × ${h})` : ''}.`;
  status.textContent = `Saved ${out.file}`;
  return out;
}

function buildCustomSizeUI() {
  const presets = $('customPresets');
  if (presets) {
    presets.innerHTML = '';
    for (const [key, p] of Object.entries(CUSTOM_SIZE_PRESETS)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.customPreset = key;
      b.textContent = `${p.label} — ${p.w}×${p.h}`;
      b.addEventListener('click', () => {
        const wEl = $('customW');
        const hEl = $('customH');
        if (wEl) wEl.value = String(p.w);
        if (hEl) hEl.value = String(p.h);
        state.customSize = { w: p.w, h: p.h };
        customLockRatio = p.w / p.h;
        const note = $('customSizeStatus');
        if (note) note.textContent = `Preset ${p.label} — ${p.w} × ${p.h}. Press “Export custom size PNG” to save it.`;
      });
      presets.appendChild(b);
    }
  }
  const lock = $('customLock');
  if (lock) lock.addEventListener('change', (e) => {
    const w = Number($('customW').value) || 1500;
    const h = Number($('customH').value) || 500;
    customLockRatio = e.target.checked ? w / h : null;
  });
  const wEl = $('customW');
  const hEl = $('customH');
  if (wEl) wEl.addEventListener('input', () => {
    if (customLockRatio && hEl) hEl.value = String(Math.max(1, Math.round(Number(wEl.value) / customLockRatio)));
  });
  if (hEl) hEl.addEventListener('input', () => {
    if (customLockRatio && wEl) wEl.value = String(Math.max(1, Math.round(Number(hEl.value) * customLockRatio)));
  });
  $('exportCustom').addEventListener('click', runExportCustom);
  syncCustomSizeUI();
}

function runSmartCrop() {
  pushHistory();
  const focus = applySmartCrop(state, selectedPanel);
  if (!focus) {
    status.textContent = 'Smart crop needs a photo in the selected panel.';
    return null;
  }
  syncPanelControls();
  redraw();
  status.textContent = `Smart crop: focus at ${Math.round(focus.x * 100)}%, ${Math.round(focus.y * 100)}% — panel ${selectedPanel + 1} steered onto it (zoom ${Math.round((state.panels[selectedPanel].zoom || 1) * 100)}%).`;
  return focus;
}

function buildStickerList() {
  const wrap = $('stickerList');
  const active = document.activeElement;
  if (wrap.contains(active)) return;
  wrap.innerHTML = '';
  (state.stickers || []).forEach((st, i) => {
    const row = document.createElement('div');
    row.className = 'sticker-row' + (selectedSticker === i ? ' selected' : '');
    row.dataset.index = String(i);
    // v15: clicking a row selects that sticker — Delete removes it.
    row.addEventListener('click', () => {
      selectedSticker = i;
      selectedBubble = null;
      buildStickerList();
      buildBubbleList();
    });
    const kind = document.createElement('select');
    kind.setAttribute('aria-label', `Sticker ${i + 1} kind`);
    for (const [k, def] of Object.entries(STICKER_KINDS)) {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = def.label;
      if (st.kind === k) o.selected = true;
      kind.appendChild(o);
    }
    kind.addEventListener('change', (e) => { pushHistory(); st.kind = e.target.value; if (!st.color) st.color = STICKER_DEFAULT_COLORS[st.kind]; buildStickerList(); redraw(); });
    // v16: per-sticker colour — the picker's value is the sticker's own
    // colour, baked into the PNG. pushHistory on pointerdown/focus (before
    // the value changes), per the headless-Chromium colour-input lesson:
    // a plain click does not emit pointerdown in headless Chrome.
    const color = document.createElement('input');
    color.type = 'color';
    color.value = stickerColor(st);
    color.setAttribute('aria-label', `Sticker ${i + 1} colour`);
    color.title = 'Sticker colour';
    color.addEventListener('pointerdown', pushHistory);
    color.addEventListener('focus', pushHistory);
    color.addEventListener('input', (e) => { st.color = e.target.value; redraw(); });
    color.addEventListener('change', () => { buildStickerList(); redraw(); });
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
      if (selectedSticker === i) selectedSticker = null;
      else if (selectedSticker != null && selectedSticker > i) selectedSticker--;
      buildStickerList();
      redraw();
      status.textContent = 'Sticker removed.';
    });
    row.append(kind, color, size, rot, del);
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
  // v22: Double Exposure controls follow the selected panel.
  const on = doubleExposureActive(p);
  $('doubleOn').checked = on;
  $('doublePhoto').value = String(p.blendPhoto >= 0 ? p.blendPhoto : (p.photo === 0 ? 1 : 0));
  $('doubleMode').value = p.blendMode || 'screen';
  $('doubleOpacity').value = String(p.blendOpacity == null ? 0.65 : p.blendOpacity);
  $('doubleOpacityVal').textContent = `${Math.round((p.blendOpacity == null ? 0.65 : p.blendOpacity) * 100)}%`;
  $('doublePhoto').disabled = !on;
  $('doubleMode').disabled = !on;
  $('doubleOpacity').disabled = !on;
  $('doubleSwap').disabled = !on;
  document.querySelectorAll('#panelPick button').forEach((b, i) => {
    b.classList.toggle('active', i === selectedPanel);
    b.disabled = i >= layoutPanelsCount();
  });
}

function syncFurnitureUI() {
  const f = state.furniture || defaultFurniture();
  $('furnitureOn').checked = !!f.on;
  $('furnitureIssue').value = f.issue || '';
  $('furnitureDate').value = f.date || '';
  $('furniturePrice').value = f.price || '';
  $('furnitureBarcode').checked = f.barcode !== false;
  $('furnitureIssue').disabled = !f.on;
  $('furnitureDate').disabled = !f.on;
  $('furniturePrice').disabled = !f.on;
  $('furnitureBarcode').disabled = !f.on;
}

// v24: Vice Clock controls follow the state — toggle, hour slider +
// readout ("18:30 • GOLDEN HOUR"), preset buttons, disabled while off.
function syncTimeOfDayUI() {
  const t = state.timeOfDay || defaultTimeOfDay();
  $('clockOn').checked = !!t.on;
  $('clockHour').value = String(t.hour == null ? 18.5 : t.hour);
  const sky = timeOfDayAt(t.hour == null ? 18.5 : t.hour);
  $('clockHourVal').textContent = `${formatClockHour(sky.hour)} • ${sky.label}`;
  $('clockHour').disabled = !t.on;
  document.querySelectorAll('.clockPreset').forEach((b) => {
    b.disabled = !t.on;
    b.classList.toggle('active', Math.abs(Number(b.dataset.hour) - sky.hour) < 0.01);
  });
}

// v25: Vice Weather controls follow the state — toggle, kind presets,
// intensity slider + readout ("STORM • 80%"), disabled while off.
function syncWeatherUI() {
  const w = state.weather || defaultWeather();
  $('weatherOn').checked = !!w.on;
  $('weatherInt').value = String(Math.round((w.intensity == null ? 0.6 : w.intensity) * 100));
  const wx = weatherAt(w.kind == null ? 'rain' : w.kind, w.intensity == null ? 0.6 : w.intensity);
  $('weatherIntVal').textContent = `${wx.label} • ${Math.round(wx.intensity * 100)}%`;
  $('weatherInt').disabled = !w.on;
  document.querySelectorAll('.weatherPreset').forEach((b) => {
    b.disabled = !w.on;
    b.classList.toggle('active', b.dataset.kind === wx.kind);
  });
}

// v26: Vice Era controls follow the state — toggle, era presets,
// intensity slider + readout ("VICE 1986 • 80%"), disabled while off.
function syncEraUI() {
  const e = state.era || defaultEra();
  $('eraOn').checked = !!e.on;
  $('eraInt').value = String(Math.round((e.intensity == null ? 0.8 : e.intensity) * 100));
  const ex = eraAt(e.era == null ? '1986' : e.era, e.intensity == null ? 0.8 : e.intensity);
  $('eraIntVal').textContent = `${ex.label} • ${Math.round(ex.intensity * 100)}%`;
  $('eraInt').disabled = !e.on;
  document.querySelectorAll('.eraPreset').forEach((b) => {
    b.disabled = !e.on;
    b.classList.toggle('active', b.dataset.era === ex.era);
  });
}

// v27: Vice District controls follow the state — toggle, district presets,
// intensity slider + readout ("OCEAN DRIVE • 80%"), disabled while off.
function syncDistrictUI() {
  const d = state.district || defaultDistrict();
  $('districtOn').checked = !!d.on;
  $('districtInt').value = String(Math.round((d.intensity == null ? 0.8 : d.intensity) * 100));
  const dx = districtAt(d.district == null ? 'ocean' : d.district, d.intensity == null ? 0.8 : d.intensity);
  $('districtIntVal').textContent = `${dx.label} • ${Math.round(dx.intensity * 100)}%`;
  $('districtInt').disabled = !d.on;
  document.querySelectorAll('.districtPreset').forEach((b) => {
    b.disabled = !d.on;
    b.classList.toggle('active', b.dataset.district === dx.district);
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
  // v23: Magazine Furniture controls follow the state.
  syncFurnitureUI();
  // v24: Vice Clock controls follow the state.
  syncTimeOfDayUI();
  // v25: Vice Weather controls follow the state.
  syncWeatherUI();
  // v26: Vice Era controls follow the state.
  syncEraUI();
  // v27: Vice District controls follow the state.
  syncDistrictUI();
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
  // v18: Looks that name grain / Title FX only match with those too.
  if (look.grain !== undefined && !!state.grain !== !!look.grain) return false;
  if (look.titleFx) {
    const fx = state.titleFx || {};
    for (const k of Object.keys(look.titleFx)) {
      if (fx[k] !== look.titleFx[k]) return false;
    }
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
    // v12: picking the Showcase layout arms its gallery lean when the
    // cover is still flat — the layout is built for the tilt.
    if (key === 'showcase' && !tiltActive(state)) {
      state.tilt = { ...TILT_PRESETS.showcase.tilt };
    }
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

// Font picker (v11): title face + tagline/credits face, from the vendored
// OFL fonts. The pick redraws only after the face is loaded, so the preview
// never flashes the system fallback.
function buildFontButtons() {
  buildPickButtons('titleFontPick', FONTS, state.titleFont || 'anton', (key) => {
    state.titleFont = key;
    ensureDisplayFonts().then(() => redraw());
  });
  buildPickButtons('bodyFontPick', FONTS, state.bodyFont || 'system', (key) => {
    state.bodyFont = key;
    ensureDisplayFonts().then(() => redraw());
  });
  buildPairingCards();
}

// Font pairings (v14): three one-click title + tagline pairs, as small
// cards under the font picker. The sample line renders in the pair's own
// faces (title face big, tagline face small), so the pairing is visible
// before the click. The active ring follows the current title+tagline
// faces, whether they came from a card, the picker, a template or a shot.
function buildPairingCards() {
  const wrap = $('fontPairings');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (const [key, def] of Object.entries(FONT_PAIRINGS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pairing-card';
    b.dataset.pairing = key;
    b.classList.toggle('active', state.titleFont === def.titleFont && state.bodyFont === def.bodyFont);
    const tf = FONTS[def.titleFont] || FONTS.anton;
    const bf = FONTS[def.bodyFont] || FONTS.system;
    const sample = document.createElement('span');
    sample.className = 'pair-sample';
    sample.style.fontFamily = tf.family;
    sample.textContent = 'VICE COMPLETE';
    const tag = document.createElement('small');
    tag.style.fontFamily = bf.family;
    tag.textContent = 'One city. One night. No brakes.';
    sample.appendChild(document.createElement('br'));
    sample.appendChild(tag);
    const label = document.createElement('b');
    label.textContent = def.label;
    const note = document.createElement('small');
    note.textContent = def.note;
    b.append(label, sample, note);
    b.addEventListener('click', () => {
      pushHistory();
      state.titleFont = def.titleFont;
      state.bodyFont = def.bodyFont;
      ensureDisplayFonts().then(() => { syncAll(); redraw(); });
      status.textContent = `Font pairing: ${def.label} — ${def.note}.`;
    });
    wrap.appendChild(b);
  }
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
  buildFontButtons();
  buildLookButtons();
  buildColorPopButtons();
  buildFilmButtons();
  buildFrameButtons();
  updateTemplateActive();
  syncEditorInputs();
  syncPanelControls();
  syncArtKitValues();
  buildBubbleList();
  buildStickerList();
  syncGlitchValues();
  syncDarkroom();
  syncPaletteUI();
  syncFreeformUI();
  syncTiltUI();
  syncLogoUI();
  syncTitleFxUI();
  // v17: keep the harmony cards + custom-size inputs in step with the
  // state (e.g. after a template applies a harmony or a custom size).
  if (lastHarmonyBase) renderHarmonyCards(lastHarmonyBase);
  syncCustomSizeUI();
  // v19: the History Timeline strip repaints with the state (each undo
  // step as a labelled thumbnail, plus the Now tile).
  renderTimeline();
}

// --- Title FX (v15) --------------------------------------------------------
// Marker highlight + outline colour + drop shadow for the big title.
// Each control pushes undo history on pointerdown/focus (sliders) or on
// change (colours/checkboxes), then redraws — the FX bake into the PNG
// because the renderer draws them, so preview and export always agree.
function syncTitleFxUI() {
  const fx = state.titleFx || defaultTitleFx();
  state.titleFx = fx;
  $('fxHighlightOn').checked = !!fx.highlightOn;
  $('fxHighlight').value = fx.highlight || '#ffe600';
  $('fxHighlightOpacity').value = String(fx.highlightOpacity == null ? 0.55 : fx.highlightOpacity);
  $('fxHighlightOpacityVal').textContent = `${Math.round((fx.highlightOpacity == null ? 0.55 : fx.highlightOpacity) * 100)}%`;
  $('fxStrokeOn').checked = !!fx.strokeOn;
  $('fxStroke').value = fx.stroke || '#ff2e88';
  $('fxShadowOn').checked = !!fx.shadowOn;
  $('fxShadow').value = fx.shadow || '#00e5ff';
}

function buildTitleFxUI() {
  const fx = () => state.titleFx || (state.titleFx = defaultTitleFx());
  $('fxHighlightOn').addEventListener('change', (e) => {
    pushHistory();
    fx().highlightOn = e.target.checked;
    redraw();
  });
  $('fxHighlight').addEventListener('input', (e) => {
    fx().highlight = e.target.value;
    fx().highlightOn = true;
    $('fxHighlightOn').checked = true;
    redraw();
  });
  // Push history on pointerdown/focus (BEFORE the picker changes the
  // value) — a 'change' push would snapshot the new colour, so Undo
  // would restore the new colour instead of the old one.
  $('fxHighlight').addEventListener('pointerdown', pushHistory);
  $('fxHighlight').addEventListener('focus', pushHistory);
  $('fxHighlightOpacity').addEventListener('input', (e) => {
    fx().highlightOpacity = Number(e.target.value);
    syncTitleFxUI();
    redraw();
  });
  $('fxHighlightOpacity').addEventListener('pointerdown', pushHistory);
  $('fxHighlightOpacity').addEventListener('focus', pushHistory);
  $('fxStrokeOn').addEventListener('change', (e) => {
    pushHistory();
    fx().strokeOn = e.target.checked;
    redraw();
  });
  $('fxStroke').addEventListener('input', (e) => {
    fx().stroke = e.target.value;
    fx().strokeOn = true;
    $('fxStrokeOn').checked = true;
    redraw();
  });
  $('fxStroke').addEventListener('pointerdown', pushHistory);
  $('fxStroke').addEventListener('focus', pushHistory);
  $('fxShadowOn').addEventListener('change', (e) => {
    pushHistory();
    fx().shadowOn = e.target.checked;
    redraw();
  });
  $('fxShadow').addEventListener('input', (e) => {
    fx().shadow = e.target.value;
    fx().shadowOn = true;
    $('fxShadowOn').checked = true;
    redraw();
  });
  $('fxShadow').addEventListener('pointerdown', pushHistory);
  $('fxShadow').addEventListener('focus', pushHistory);
}

// --- 3D Tilt & Mockups (v12) ------------------------------------------------
// Four sliders drive state.tilt live; five preset buttons apply a named
// lean in one click. Every change goes through pushHistory so Undo covers
// the tilt, and the preview redraws — the tilt is part of the cover, so
// export, series, thumbnails and mockups all inherit it.
function syncTiltUI() {
  const t = state.tilt || defaultTilt();
  state.tilt = t;
  $('tiltX').value = t.x;
  $('tiltY').value = t.y;
  $('tiltPersp').value = t.perspective;
  $('tiltShadow').value = t.shadow;
  $('tiltXVal').textContent = `${t.x}°`;
  $('tiltYVal').textContent = `${t.y}°`;
  $('tiltPerspVal').textContent = `${t.perspective}`;
  $('tiltShadowVal').textContent = `${Math.round(t.shadow * 100)}%`;
  // v21 Tilt Pro: mark the active preset (x/y/perspective match) and the
  // active shadow style, so the editor — and the editor screenshot —
  // shows which lean + which shadow the cover is wearing.
  const presetIds = {
    tiltFlat: 'flat', tiltLeanL: 'leanLeft', tiltLeanR: 'leanRight',
    tiltPop: 'popOut', tiltShowcase: 'showcase',
    tiltPoster: 'posterLean', tiltBillboard: 'billboard', tiltPhone: 'phoneTilt',
  };
  for (const [id, key] of Object.entries(presetIds)) {
    const el = $(id);
    if (!el) continue;
    const p = TILT_PRESETS[key].tilt;
    el.classList.toggle('active', t.x === p.x && t.y === p.y && t.perspective === p.perspective);
  }
  const style = t.shadowStyle || 'soft';
  for (const [id, key] of Object.entries({ shadowSoft: 'soft', shadowHard: 'hard', shadowNeon: 'neon' })) {
    const el = $(id);
    if (el) el.classList.toggle('active', style === key);
  }
}

function wireTiltUI() {
  const bindSlider = (id, key, parse) => {
    $(id).addEventListener('input', () => {
      state.tilt = state.tilt || defaultTilt();
      state.tilt[key] = parse($(id).value);
      syncTiltUI();
      redraw();
    });
    $(id).addEventListener('pointerdown', pushHistory);
    $(id).addEventListener('focus', pushHistory);
  };
  bindSlider('tiltX', 'x', (v) => Number(v));
  bindSlider('tiltY', 'y', (v) => Number(v));
  bindSlider('tiltPersp', 'perspective', (v) => Number(v));
  bindSlider('tiltShadow', 'shadow', (v) => Number(v));
  const presets = {
    tiltFlat: 'flat', tiltLeanL: 'leanLeft', tiltLeanR: 'leanRight',
    tiltPop: 'popOut', tiltShowcase: 'showcase',
    tiltPoster: 'posterLean', tiltBillboard: 'billboard', tiltPhone: 'phoneTilt',
  };
  for (const [id, key] of Object.entries(presets)) {
    $(id).addEventListener('click', () => {
      pushHistory();
      // v21: a preset keeps the current shadow style — the style is its
      // own axis, so picking a lean must not silently reset the shadow.
      state.tilt = { ...TILT_PRESETS[key].tilt, shadowStyle: (state.tilt && state.tilt.shadowStyle) || 'soft' };
      if (key === 'showcase') state.layout = 'showcase';
      syncAll();
      redraw();
      status.textContent = `Tilt: ${TILT_PRESETS[key].label}.`;
    });
  }
  // v21 Tilt Pro: the shadow style picker — soft (v12 layered blur),
  // hard (solid slab), neon glow (pink + cyan). A style only reads with
  // a tilt: if the cover is flat, lean it the gallery way so the style
  // is visible at once.
  const shadowStyles = { shadowSoft: 'soft', shadowHard: 'hard', shadowNeon: 'neon' };
  const shadowLabels = { soft: 'Soft shadow', hard: 'Hard shadow', neon: 'Neon glow' };
  for (const [id, style] of Object.entries(shadowStyles)) {
    $(id).addEventListener('click', () => {
      pushHistory();
      state.tilt = state.tilt || defaultTilt();
      state.tilt.shadowStyle = style;
      if (!tiltActive(state)) state.tilt = { ...TILT_PRESETS.showcase.tilt, shadowStyle: style };
      syncAll();
      redraw();
      status.textContent = `Shadow: ${shadowLabels[style]}.`;
    });
  }
  const mockups = { mockupFramed: 'framed', mockupPhone: 'phone', mockupBillboard: 'billboard' };
  for (const [id, kind] of Object.entries(mockups)) {
    $(id).addEventListener('click', async () => {
      status.textContent = `Rendering ${MOCKUPS[kind].label} mockup…`;
      const blob = await exportMockup(state, kind);
      downloadBlob(blob, MOCKUPS[kind].file);
      addCurrentToGallery(`Mockup — ${MOCKUPS[kind].label}`);
      status.textContent = `Saved ${MOCKUPS[kind].file} (${MOCKUPS[kind].w} × ${MOCKUPS[kind].h})`;
    });
  }
  $('mockupAll').addEventListener('click', async () => {
    const files = await exportAllMockups(state);
    for (const f of files) downloadBlob(f.blob, f.file);
    addCurrentToGallery('All 3 mockups');
    status.textContent = `Saved all 3 mockups (${files.map((f) => f.file).join(', ')})`;
  });
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
      addCurrentToGallery(size.label);
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
    addCurrentToGallery('All 4 sizes');
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
    addCurrentToGallery('Contact sheet');
    status.textContent = `Saved ${CONTACT_SHEET.file}`;
  });
  wrap.appendChild(sheet);
  // Export everything (v14): all 11 outputs in one click — 4 sizes +
  // contact sheet + 3 mockups + 3 print sizes — with a live progress bar.
  // The same run is wired to the quick button under the font pairing
  // cards, so the headline action is one click away from the title panel.
  const everything = document.createElement('button');
  everything.type = 'button';
  everything.id = 'exportEverything';
  everything.textContent = `Export everything — ${EXPORT_EVERYTHING_COUNT} files (PNG)`;
  everything.addEventListener('click', runExportEverything);
  wrap.appendChild(everything);
  const quick = $('exportEverythingQuick');
  if (quick) quick.addEventListener('click', runExportEverything);
  // Download ZIP (v16): the same 11 files as Export everything, packed
  // into ONE zip by a hand-written offline STORE writer (PNGs are already
  // compressed) — one click, one file, no 11 separate downloads. Shares
  // the Export-everything guard + progress bar, so a second click mid-run
  // is ignored and the bar shows the same 11 render steps.
  const zip = document.createElement('button');
  zip.type = 'button';
  zip.id = 'downloadZip';
  zip.textContent = `Download ZIP (all ${EXPORT_EVERYTHING_COUNT} files)`;
  zip.addEventListener('click', runDownloadZip);
  wrap.appendChild(zip);
}

// Download ZIP (v16): renders all 11 outputs, packs them with
// createZipBlob, and downloads a single ZIP. Guarded like Export
// everything — a second click mid-run is ignored.
async function runDownloadZip() {
  if (exportEverythingRunning) return;
  exportEverythingRunning = true;
  const bar = $('exportEverythingProgress');
  const fill = $('exportEverythingFill');
  const prog = $('exportEverythingStatus');
  try {
    if (bar) bar.hidden = false;
    if (fill) fill.style.width = '0%';
    if (prog) prog.textContent = 'Starting ZIP export…';
    const { file, blob, files } = await exportEverythingZip(state, (done, total, label) => {
      if (fill) fill.style.width = `${Math.round((done / total) * 100)}%`;
      if (prog) prog.textContent = `Exporting ${done}/${total} — ${label}…`;
      status.textContent = `ZIP export ${done}/${total} — ${label}…`;
    });
    if (prog) prog.textContent = 'Packing ZIP…';
    downloadBlob(blob, file);
    addCurrentToGallery('ZIP export — 11 files');
    status.textContent = `Saved ${file} — all ${files.length} files in one ZIP (${files.map((f) => f.file).join(', ')})`;
    if (prog) prog.textContent = `Done — ${file} saved (${(blob.size / 1048576).toFixed(1)} MB).`;
  } finally {
    exportEverythingRunning = false;
  }
}

// Export everything (v14): the shared run for both Export-everything
// buttons. Renders one file at a time (a few are 17 Mpx), updates the
// progress bar + status after each file, downloads each PNG as it lands,
// and saves the finished cover to the gallery once. Guarded against a
// double click mid-run — the second click is ignored until the run ends.
let exportEverythingRunning = false;
async function runExportEverything() {
  if (exportEverythingRunning) return;
  exportEverythingRunning = true;
  const bar = $('exportEverythingProgress');
  const fill = $('exportEverythingFill');
  const prog = $('exportEverythingStatus');
  try {
    if (bar) bar.hidden = false;
    if (fill) fill.style.width = '0%';
    if (prog) prog.textContent = 'Starting export everything…';
    const files = await exportEverything(state, (done, total, label) => {
      if (fill) fill.style.width = `${Math.round((done / total) * 100)}%`;
      if (prog) prog.textContent = `Exporting ${done}/${total} — ${label}…`;
      status.textContent = `Export everything ${done}/${total} — ${label}…`;
    });
    for (const f of files) downloadBlob(f.blob, f.file);
    addCurrentToGallery('Export everything — 11 files');
    status.textContent = `Saved all ${files.length} files (${files.map((f) => f.file).join(', ')})`;
    if (prog) prog.textContent = `Done — all ${files.length} files saved.`;
  } finally {
    exportEverythingRunning = false;
  }
}

// Print-size export (v13): A4 + A3 + Poster, one click. A3 is 17.4 Mpx,
// so each size renders in turn with a status line — a few seconds each,
// no parallel renders (one giant canvas at a time keeps memory sane).
function buildPrintUI() {
  $('exportPrint').addEventListener('click', async () => {
    for (const size of PRINT_SIZES) {
      status.textContent = `Rendering print size ${size.label} (${size.w} × ${size.h})…`;
      const blob = await exportCover(state, size.w, size.h);
      downloadBlob(blob, size.file);
    }
    addCurrentToGallery('Print sizes — A4 + A3 + Poster');
    status.textContent = `Saved print sizes (${PRINT_SIZES.map((s) => s.file).join(', ')})`;
  });
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
  // v11: load the OFL display faces before the first paint, so the preview
  // and the template thumbnails render in the real poster lettering.
  await ensureDisplayFonts();
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
const STICKER_CYCLE = ['star', 'bolt', 'palm', 'sun', 'heart', 'crown', 'shades', 'flame', 'dice', 'sparkle'];
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
    color: STICKER_DEFAULT_COLORS[nextKind],
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
  addCurrentToGallery('Series — 3 covers');
  status.textContent = `Saved series: ${files.map((f) => f.file).join(', ')}`;
});

// Batch mode (v9): multi-file upload, build the grid, export all six.
$('batchFiles').addEventListener('change', async (e) => {
  const files = [...(e.target.files || [])].slice(0, 6);
  if (!files.length) return;
  batchPhotos = [];
  for (const file of files) {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    try { batchPhotos.push(await loadImage(dataUrl)); } catch { /* skip bad file */ }
  }
  const el = $('batchStatus');
  if (el) el.textContent = `${batchPhotos.length} batch photo${batchPhotos.length === 1 ? '' : 's'} loaded — press “Build batch” to make ${batchPhotos.length} cover${batchPhotos.length === 1 ? '' : 's'}.`;
  status.textContent = `Loaded ${batchPhotos.length} batch photo(s).`;
});
$('buildBatch').addEventListener('click', () => { pushHistory(); runBatch(); });
$('exportBatch').addEventListener('click', async () => {
  if (!batchVariants.length) runBatch();
  if (!batchVariants.length) return;
  status.textContent = 'Rendering batch…';
  const files = await exportBatch(state, batchVariants, 1080, 1080);
  for (const f of files) downloadBlob(f.blob, f.file);
  addCurrentToGallery(`Batch — ${batchVariants.length} covers`);
  status.textContent = `Saved batch: ${files.map((f) => f.file).join(', ')}`;
});

// Smart crop (v9): steer the selected panel onto its photo's focus point.
$('smartCrop').addEventListener('click', runSmartCrop);

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
  'doubleOn', 'doublePhoto', 'doubleMode', 'doubleOpacity', 'doubleSwap',
  'furnitureOn', 'furnitureIssue', 'furnitureDate', 'furniturePrice', 'furnitureBarcode',
  'clockOn', 'clockHour',
  'weatherOn', 'weatherInt',
  'eraOn', 'eraInt',
  'districtOn', 'districtInt',
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
// v22: Double Exposure controls — all act on the selected panel.
$('doubleOn').addEventListener('change', (e) => {
  const p = state.panels[selectedPanel];
  if (e.target.checked) {
    const other = p.photo === 0 ? 1 : 0;
    applyDoubleExposure(state, selectedPanel, other, p.blendMode || 'screen', p.blendOpacity);
  } else {
    clearDoubleExposure(state, selectedPanel);
  }
  syncPanelControls();
  redraw();
});
$('doublePhoto').addEventListener('change', (e) => {
  const p = state.panels[selectedPanel];
  if (!applyDoubleExposure(state, selectedPanel, Number(e.target.value), p.blendMode || 'screen', p.blendOpacity)) {
    // Same photo as the base: turn the blend off rather than blend a
    // photo with itself.
    clearDoubleExposure(state, selectedPanel);
  }
  syncPanelControls();
  redraw();
});
$('doubleMode').addEventListener('change', (e) => {
  state.panels[selectedPanel].blendMode = e.target.value;
  redraw();
});
$('doubleOpacity').addEventListener('input', (e) => {
  const p = state.panels[selectedPanel];
  p.blendOpacity = clampBlendOpacity(e.target.value);
  $('doubleOpacityVal').textContent = `${Math.round(p.blendOpacity * 100)}%`;
  redraw();
});
$('doubleSwap').addEventListener('click', () => {
  const p = state.panels[selectedPanel];
  if (!doubleExposureActive(p)) return;
  const base = p.photo;
  p.photo = p.blendPhoto;
  p.blendPhoto = base;
  syncPanelControls();
  redraw();
});
// v23: Magazine Furniture controls — one toggle + issue/date/price/barcode.
$('furnitureOn').addEventListener('change', (e) => {
  state.furniture = state.furniture || defaultFurniture();
  state.furniture.on = e.target.checked;
  syncFurnitureUI();
  redraw();
});
$('furnitureIssue').addEventListener('input', (e) => {
  state.furniture = state.furniture || defaultFurniture();
  state.furniture.issue = clampFurnitureIssue(e.target.value);
  redraw();
});
$('furnitureDate').addEventListener('input', (e) => {
  state.furniture = state.furniture || defaultFurniture();
  state.furniture.date = clampFurnitureDate(e.target.value);
  redraw();
});
$('furniturePrice').addEventListener('input', (e) => {
  state.furniture = state.furniture || defaultFurniture();
  state.furniture.price = clampFurniturePrice(e.target.value);
  redraw();
});
$('furnitureBarcode').addEventListener('change', (e) => {
  state.furniture = state.furniture || defaultFurniture();
  state.furniture.barcode = e.target.checked;
  redraw();
});

// v24: Vice Clock controls — one toggle + hour slider + 5 time presets.
// Dragging the hour re-renders live: the sky, the disc and the chip all
// follow the slider in the same frame.
$('clockOn').addEventListener('change', (e) => {
  state.timeOfDay = state.timeOfDay || defaultTimeOfDay();
  state.timeOfDay.on = e.target.checked;
  syncTimeOfDayUI();
  redraw();
});
$('clockHour').addEventListener('input', (e) => {
  state.timeOfDay = state.timeOfDay || defaultTimeOfDay();
  state.timeOfDay.hour = clampTimeHour(e.target.value);
  syncTimeOfDayUI();
  redraw();
});
document.querySelectorAll('.clockPreset').forEach((b) => {
  b.addEventListener('click', () => {
    state.timeOfDay = state.timeOfDay || defaultTimeOfDay();
    state.timeOfDay.on = true;
    state.timeOfDay.hour = clampTimeHour(b.dataset.hour);
    syncTimeOfDayUI();
    redraw();
  });
});

// v25: Vice Weather controls — one toggle + intensity slider + 5 kind
// presets. Dragging the intensity re-renders live: the tint, the rain,
// the fog and the chip all follow the slider in the same frame.
$('weatherOn').addEventListener('change', (e) => {
  state.weather = state.weather || defaultWeather();
  state.weather.on = e.target.checked;
  syncWeatherUI();
  redraw();
});
$('weatherInt').addEventListener('input', (e) => {
  state.weather = state.weather || defaultWeather();
  state.weather.intensity = clampWeatherIntensity(Number(e.target.value) / 100);
  syncWeatherUI();
  redraw();
});
document.querySelectorAll('.weatherPreset').forEach((b) => {
  b.addEventListener('click', () => {
    state.weather = state.weather || defaultWeather();
    state.weather.on = true;
    state.weather.kind = clampWeatherKind(b.dataset.kind);
    syncWeatherUI();
    redraw();
  });
});

// v26: Vice Era controls — one toggle + intensity slider + 5 era
// presets. Dragging the intensity re-renders live: the tint, the grain,
// the scanlines and the chip all follow the slider in the same frame.
$('eraOn').addEventListener('change', (e) => {
  state.era = state.era || defaultEra();
  state.era.on = e.target.checked;
  syncEraUI();
  redraw();
});
$('eraInt').addEventListener('input', (e) => {
  state.era = state.era || defaultEra();
  state.era.intensity = clampEraIntensity(Number(e.target.value) / 100);
  syncEraUI();
  redraw();
});
document.querySelectorAll('.eraPreset').forEach((b) => {
  b.addEventListener('click', () => {
    state.era = state.era || defaultEra();
    state.era.on = true;
    state.era.era = clampEra(b.dataset.era);
    syncEraUI();
    redraw();
  });
});

// v27: Vice District controls — one toggle + intensity slider + 5 district
// presets. Dragging the intensity re-renders live: the tint, the skyline,
// the windows and the chip all follow the slider in the same frame.
$('districtOn').addEventListener('change', (e) => {
  state.district = state.district || defaultDistrict();
  state.district.on = e.target.checked;
  syncDistrictUI();
  redraw();
});
$('districtInt').addEventListener('input', (e) => {
  state.district = state.district || defaultDistrict();
  state.district.intensity = clampDistrictIntensity(Number(e.target.value) / 100);
  syncDistrictUI();
  redraw();
});
document.querySelectorAll('.districtPreset').forEach((b) => {
  b.addEventListener('click', () => {
    state.district = state.district || defaultDistrict();
    state.district.on = true;
    state.district.district = clampDistrict(b.dataset.district);
    syncDistrictUI();
    redraw();
  });
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
    await loadLogoImage();
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
let draggingFree = null; // { kind: 'panel'|'title', index, mode, ... } (v10)
let draggingTitle = null;
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
      // v15: grabbing a sticker on the canvas selects it (Delete removes it).
      selectedSticker = i;
      selectedBubble = null;
      buildStickerList();
      buildBubbleList();
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
      // v15: grabbing a bubble on the canvas selects it (Delete removes it).
      selectedBubble = i;
      selectedSticker = null;
      buildBubbleList();
      buildStickerList();
      canvas.setPointerCapture(e.pointerId);
      return;
    }
  }
  // Freeform mode (v10): the title block, then the panels topmost-first.
  // A corner handle resizes, the ring above rotates, the body moves.
  if (state.freeform && state.freeform.on) {
    const tb = titleBox(canvas.width, canvas.height);
    const tHit = pointInRotated(px, py, tb);
    if (tHit.inside) {
      selectedFree = { kind: 'title' };
      draggingTitle = { dx: px - tb.cx, dy: py - tb.cy };
      canvas.setPointerCapture(e.pointerId);
      syncFreeformUI();
      redraw();
      return;
    }
    const ffItems = state.freeform.items || [];
    const order = ffItems.map((it, i) => i).sort((a, b) => (ffItems[b].z ?? b) - (ffItems[a].z ?? a));
    for (const i of order) {
      const r = freeformItemRect(i, canvas.width, canvas.height);
      if (!r) continue;
      const hit = pointInRotated(px, py, r);
      // Rotate ring: above the top edge, in the panel's own frame — the
      // same spot the overlay draws it, so what you grab is what you see.
      const off = Math.max(24, Math.round(Math.min(canvas.width, canvas.height) * 0.03));
      const rad = ((r.rot || 0) * Math.PI) / 180;
      const ringX = r.cx - Math.sin(rad) * (r.h / 2 + off);
      const ringY = r.cy - Math.cos(rad) * (r.h / 2 + off);
      const ringDist = Math.hypot(px - ringX, py - ringY);
      if (ringDist <= 16) {
        selectedFree = { kind: 'panel', index: i };
        draggingFree = { kind: 'panel', index: i, mode: 'rotate', cx: r.cx, cy: r.cy, startRot: r.rot };
        canvas.setPointerCapture(e.pointerId);
        syncFreeformUI();
        redraw();
        return;
      }
      if (hit.inside) {
        selectedFree = { kind: 'panel', index: i };
        const hs = Math.max(10, Math.round(Math.min(canvas.width, canvas.height) * 0.012)) + 8;
        const corner = Math.abs(hit.lx) > r.w / 2 - hs && Math.abs(hit.ly) > r.h / 2 - hs;
        const it = ffItems[i];
        draggingFree = corner
          ? { kind: 'panel', index: i, mode: 'resize', startX: px, startY: py, orig: { ...it }, cx: r.cx, cy: r.cy }
          : { kind: 'panel', index: i, mode: 'move', dx: px - r.cx, dy: py - r.cy, orig: { ...it } };
        canvas.setPointerCapture(e.pointerId);
        syncFreeformUI();
        redraw();
        return;
      }
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
  if (draggingTitle) {
    const { px, py } = canvasPoint(e.clientX, e.clientY);
    const t = state.freeform.title || (state.freeform.title = { x: 0.5, y: 0.32, rot: 0 });
    state.freeform.titleMoved = true;
    snapGuides = [];
    let cx = px - draggingTitle.dx;
    let cy = py - draggingTitle.dy;
    if (state.freeform.snap !== false) {
      if (Math.abs(cx - canvas.width / 2) <= 12) { cx = canvas.width / 2; snapGuides.push({ axis: 'v', pos: canvas.width / 2 }); }
      if (Math.abs(cy - canvas.height / 2) <= 12) { cy = canvas.height / 2; snapGuides.push({ axis: 'h', pos: canvas.height / 2 }); }
    }
    t.x = Math.max(0.05, Math.min(0.95, cx / canvas.width));
    t.y = Math.max(0.05, Math.min(0.95, cy / canvas.height));
    redraw();
    return;
  }
  if (draggingFree) {
    const { px, py } = canvasPoint(e.clientX, e.clientY);
    const W = canvas.width;
    const H = canvas.height;
    const it = state.freeform.items[draggingFree.index];
    if (!it) return;
    snapGuides = [];
    if (draggingFree.mode === 'rotate') {
      const ang = (Math.atan2(py - draggingFree.cy, px - draggingFree.cx) * 180) / Math.PI + 90;
      let rot = ((ang - 0 + 540) % 360) - 180;
      if (state.freeform.snap !== false) {
        for (const snap of [0, 90, -90, 180, -180]) {
          if (Math.abs(rot - snap) <= 4) { rot = snap; break; }
        }
      }
      it.rot = rot;
      it.modified = true;
    } else if (draggingFree.mode === 'resize') {
      // Scale from the drag distance to the centre: one corner drag grows
      // or shrinks the whole panel, keeping its centre where it was.
      const d0 = Math.max(20, Math.hypot(draggingFree.startX - draggingFree.cx, draggingFree.startY - draggingFree.cy));
      const d1 = Math.max(20, Math.hypot(px - draggingFree.cx, py - draggingFree.cy));
      const f = Math.max(0.25, Math.min(3, d1 / d0));
      it.w = Math.max(0.05, Math.min(1, draggingFree.orig.w * f));
      it.h = Math.max(0.05, Math.min(1, draggingFree.orig.h * f));
      it.x = draggingFree.orig.x + (draggingFree.orig.w - it.w) / 2;
      it.y = draggingFree.orig.y + (draggingFree.orig.h - it.h) / 2;
      it.modified = true;
    } else {
      let cx = px - draggingFree.dx;
      let cy = py - draggingFree.dy;
      const wPx = it.w * W;
      const hPx = it.h * H;
      if (state.freeform.snap !== false) {
        const sx = snapValue(cx, [W / 2, wPx / 2, W - wPx / 2], 12);
        cx = sx.value;
        if (sx.guide !== null) snapGuides.push({ axis: 'v', pos: sx.guide === W / 2 ? W / 2 : (sx.guide === wPx / 2 ? 0 : W) });
        const sy = snapValue(cy, [H / 2, hPx / 2, H - hPx / 2], 12);
        cy = sy.value;
        if (sy.guide !== null) snapGuides.push({ axis: 'h', pos: sy.guide === H / 2 ? H / 2 : (sy.guide === hPx / 2 ? 0 : H) });
      }
      it.x = Math.max(-0.1, Math.min(1.05 - it.w, (cx - wPx / 2) / W));
      it.y = Math.max(-0.1, Math.min(1.05 - it.h, (cy - hPx / 2) / H));
      it.modified = true;
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
canvas.addEventListener('pointerup', () => { dragging = null; draggingBubble = null; draggingSticker = null; draggingFree = null; draggingTitle = null; snapGuides = []; redraw(); });

syncAll();
buildPanelPick();
buildExportButtons();
buildCustomSizeUI();
buildPrintUI();
buildLogoUI();
buildGalleryUI();
buildTitleFxUI();
buildABUI();
wireTiltUI();
buildTemplateGallery();
buildPaletteUI();
buildHarmonyUI();
buildArtKit();
syncArtKitValues();
buildBubbleList();
buildGlitchControls();
syncGlitchValues();
buildStickerList();
buildFreeformUI();
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
    runHarmony,
    runTimelineDemo,
    runExportCustom,
    runBatch,
    runSmartCrop,
    freeformDemo,
    exportMockup,
    saveToGallery,
    openAB,
    setTitle: (t) => { state.title = t; $('title').value = t; },
    syncButtons: () => { syncAll(); },
  });
} else {
  loadDefaults();
}
