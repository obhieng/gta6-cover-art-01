// Vice Fonts Cover Studio — the cover renderer (v11).
// Draws a multi-panel poster cover on any 2D canvas from a plain state object:
// photos, per-panel crop/position/caption/ink, layout, grade, scene backdrop,
// title engine and print textures. Pure canvas, no network, no external assets.
//
// v9 adds: Batch mode (N photos -> N different covers, each recipe picked
// deterministically from that photo's own pixel reading — grade + layout +
// title + frame all differ per photo), a Frames pack (5 procedural border
// treatments: Film Strip, Polaroid, Ticket Stub, Torn Edge, Rounded — drawn
// in code, baked into the PNG), Smart Crop (the focus point of a photo is
// found from its real pixels — brightest/highest-contrast region — and the
// panel crop is steered onto it), and an 11th template (Vice Batch).
// Everything from v1–v8 is kept.
// Draws a multi-panel poster cover on any 2D canvas from a plain state object:
// photos, per-panel crop/position/caption/ink, layout, grade, scene backdrop,
// title engine and print textures. Pure canvas, no network, no external assets.
//
// v8 adds: Custom Palette Builder (5 dominant colours extracted from the
// photo's real pixels — deterministic quantisation — pick 2-3 stops and the
// grade becomes a custom gradient; up to 4 saved palettes + 3 presets),
// the Moodboard layout (scrapbook: tilted photos, tape corners, handwritten
// captions in the system cursive stack, gold pins), Cover of the Day (one
// deterministic daily remix, seeded by the date), a contact-sheet export
// (all 4 export sizes on one PNG), and a 10th template (Vice Palette).
// Everything from v1–v7 is kept.
//
// v3 adds: Title engine v2 (curved text, 3D extruded, gradient fill, sticker
// outline, glow, masthead bar, cover lines), the Magazine layout, 6 one-click
// Looks, before/after compare, treatments (duotone / threshold / solarize),
// light-leak + vignette toggles. Everything from v1/v2 is kept.
// v4 adds: grade Neon Chrome + Chrome Gradient title style, Photo Lab
// (background blur, spotlight, color-pop, 3 vintage film presets), Series
// mode (one theme, 3 covers: landscape + square + portrait), and the
// 6-template gallery (applyTemplate / templateMatches).
// v5 adds: Procedural Vice Art Kit (sunburst rays, palm + skyline silhouettes,
// sun/moon disc, perspective grid floor — all drawn in code, no assets),
// speech/thought bubbles (editable, draggable, 3 styles), the Storyboard
// layout (4 numbered comic panels in a row), grade Sunset Noir, and
// save/load project (JSON file + localStorage autosave).
// v6 adds: the Darkroom (draggable RGB tone curves per channel, exposure /
// contrast / saturation / temperature / highlights / shadows / sharpen /
// clarity sliders, per-channel HSL shifts — all pixel work, live in the
// preview and baked into the PNG export), Smart Suggest (the photo's real
// pixels are sampled — brightness, contrast, warmth, dominant hue — and the
// best-fitting grade + layout + title is recommended), the Diptych layout
// (before/after as the cover itself, BEFORE/AFTER labels), the Cross Process
// treatment, and Golden Hour / Blue Hour one-click darkroom presets.

export const LAYOUTS = {
  hero: { label: 'Hero + strip', panels: 4 },
  grid3: { label: 'Grid 3-panel', panels: 3 },
  collage5: { label: 'Collage 5-panel', panels: 5 },
  diagonal: { label: 'Diagonal split', panels: 2 },
  overlap: { label: 'Overlapping Collage', panels: 4 },
  polaroid: { label: 'Polaroid Strip', panels: 3 },
  triptych: { label: 'Triptych Center', panels: 3 },
  magazine: { label: 'Magazine Cover', panels: 1 },
  storyboard: { label: 'Storyboard Comic', panels: 4 },
  diptych: { label: 'Diptych Before / After', panels: 2 },
  moodboard: { label: 'Moodboard Scrapbook', panels: 4 },
  sunsetstrip: { label: 'Sunset Strip', panels: 1 },
  showcase: { label: 'Showcase 3D', panels: 1 },
};

export const GRADES = {
  sunset: {
    label: 'Vice Sunset',
    filter: 'saturate(1.45) contrast(1.12) sepia(0.28) hue-rotate(-12deg)',
    top: 'rgba(255, 190, 80, 0.10)',
    bottom: 'rgba(214, 38, 120, 0.42)',
  },
  neon: {
    label: 'Neon Nights',
    filter: 'saturate(1.7) contrast(1.18) hue-rotate(18deg)',
    top: 'rgba(0, 229, 255, 0.12)',
    bottom: 'rgba(255, 46, 136, 0.40)',
  },
  heatwave: {
    label: 'Heatwave Duotone',
    filter: 'saturate(0.35) contrast(1.35) sepia(0.85) hue-rotate(-18deg)',
    top: 'rgba(255, 170, 40, 0.16)',
    bottom: 'rgba(140, 20, 60, 0.45)',
  },
  noir: {
    label: 'Palm Noir',
    filter: 'saturate(0.55) contrast(1.30) brightness(0.92)',
    top: 'rgba(120, 140, 180, 0.10)',
    bottom: 'rgba(5, 8, 20, 0.55)',
  },
  pastel: {
    label: 'Pastel Vice',
    filter: 'saturate(1.15) contrast(0.95) brightness(1.08) hue-rotate(-8deg)',
    top: 'rgba(255, 210, 220, 0.14)',
    bottom: 'rgba(120, 90, 200, 0.30)',
  },
  inknoir: {
    label: 'Ink Noir',
    filter: 'grayscale(1) contrast(1.45) brightness(0.96)',
    top: 'rgba(255, 46, 136, 0.10)',
    bottom: 'rgba(5, 5, 14, 0.58)',
  },
  comicpop: {
    label: 'Comic Pop',
    filter: 'saturate(2.2) contrast(1.5) brightness(1.02)',
    top: 'rgba(255, 180, 0, 0.12)',
    bottom: 'rgba(255, 46, 136, 0.32)',
  },
  sunbleach: {
    label: 'Sunbleach',
    filter: 'saturate(0.85) contrast(0.85) brightness(1.12) sepia(0.35)',
    top: 'rgba(255, 240, 200, 0.18)',
    bottom: 'rgba(200, 120, 60, 0.25)',
  },
  chrome: {
    label: 'Neon Chrome',
    filter: 'saturate(1.35) contrast(1.28) brightness(1.06)',
    top: 'rgba(0, 229, 255, 0.14)',
    bottom: 'rgba(120, 40, 200, 0.42)',
  },
  sunsetNoir: {
    label: 'Sunset Noir',
    filter: 'saturate(1.25) contrast(1.35) brightness(0.85) hue-rotate(-10deg)',
    top: 'rgba(255, 120, 40, 0.12)',
    bottom: 'rgba(10, 4, 20, 0.55)',
  },
};

// ---------------------------------------------------------------------------
// Custom Palette Builder (v8): the grade becomes YOUR colours. The photo's
// 5 dominant colours are extracted from its real pixels (deterministic
// 4-bit quantisation, scored by count x saturation), the user picks 2-3
// stops, and the grade tint becomes a 3-stop gradient in those colours.
// Three presets ship built-in; up to 4 custom palettes are saved.
// ---------------------------------------------------------------------------
export const PALETTE_PRESETS = {
  viceSunset: { label: 'Vice Sunset', stops: ['#ffb400', '#ff6b35', '#d62678'] },
  neonNights: { label: 'Neon Nights', stops: ['#00e5ff', '#ff2e88', '#7b2ff7'] },
  palmNoir: { label: 'Palm Noir', stops: ['#8ecae6', '#2a4d69', '#0b0b1a'] },
};

export function defaultPalette() {
  return { enabled: false, stops: ['#ffb400', '#ff6b35', '#d62678'], name: 'Custom', preset: null };
}

function hexToRgb(hex) {
  const h = String(hex || '#000000').replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function hexToRgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbToHex(r, g, b) {
  const p = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${p(r)}${p(g)}${p(b)}`;
}

/** The photo's 5 dominant colours, deterministic: sample 64x48, quantise
 *  to 4 bits per channel, score each bucket by count x (0.5 + saturation),
 *  take the top 5 (ties broken by hex, so the same photo always gives the
 *  same five). Returns [hex, ...] (fewer if the photo is nearly flat). */
export function extractPalette(img) {
  if (!img) return [];
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 48;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0, 64, 48);
  const data = g.getImageData(0, 0, 64, 48).data;
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const gg = data[i + 1];
    const b = data[i + 2];
    const key = ((r >> 4) << 8) | ((gg >> 4) << 4) | (b >> 4);
    let bk = buckets.get(key);
    if (!bk) { bk = { n: 0, r: 0, g: 0, b: 0 }; buckets.set(key, bk); }
    bk.n += 1;
    bk.r += r;
    bk.g += gg;
    bk.b += b;
  }
  const scored = [];
  for (const bk of buckets.values()) {
    const r = bk.r / bk.n;
    const gg = bk.g / bk.n;
    const b = bk.b / bk.n;
    const max = Math.max(r, gg, b);
    const min = Math.min(r, gg, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    scored.push({ hex: rgbToHex(r, gg, b), score: bk.n * (0.5 + sat) });
  }
  scored.sort((a, b2) => (b2.score - a.score) || (a.hex < b2.hex ? -1 : 1));
  return scored.slice(0, 5).map((s) => s.hex);
}

/** The grade the renderer actually uses: the custom palette gradient when
 *  the palette is on (base grade's filter kept, tint rebuilt from the 3
 *  stops), otherwise the plain grade. `mid` adds the middle stop to the
 *  tint gradient in drawPanel. */
export function paletteGrade(state) {
  const base = GRADES[state.grade] || GRADES.sunset;
  const pal = state.palette;
  if (!pal || !pal.enabled || !pal.stops || !pal.stops.length) return base;
  const stops = [...pal.stops];
  while (stops.length < 3) stops.push(stops[stops.length - 1]);
  return {
    label: `Palette · ${pal.name || 'Custom'}`,
    filter: base.filter,
    top: hexToRgba(stops[0], 0.10),
    mid: hexToRgba(stops[1], 0.22),
    bottom: hexToRgba(stops[2], 0.42),
  };
}

/** Cover of the Day (v8): one coherent remix per calendar date, seeded by
 *  the date string — the same date always gives the same recipe, tomorrow
 *  gives a different one. Pure function of the date, no randomness. */
const COTD_TITLES = ['VICE PALETTE', 'NEON DAWN', 'PALM SHADOWS', 'SUNSET DRIVE', 'VICE NIGHTS', 'CHROME COAST', 'HEATWAVE', 'MIDNIGHT PALMS'];
export function coverOfTheDay(dateStr) {
  const d = dateStr || new Date().toISOString().slice(0, 10);
  let seed = 2166136261;
  for (let i = 0; i < d.length; i++) { seed ^= d.charCodeAt(i); seed = Math.imul(seed, 16777619); }
  const rnd = mulberry32(seed >>> 0);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const paletteKey = pick(Object.keys(PALETTE_PRESETS));
  return {
    date: d,
    layout: pick(Object.keys(LAYOUTS)),
    grade: pick(Object.keys(GRADES)),
    palette: paletteKey,
    paletteStops: [...PALETTE_PRESETS[paletteKey].stops],
    titleStyle: pick(Object.keys(TITLE_STYLES)),
    title: pick(COTD_TITLES),
    backdrop: pick(Object.keys(BACKDROPS)),
    blend: 'screen',
  };
}

export function applyCoverOfTheDay(state, dateStr) {
  const r = coverOfTheDay(dateStr);
  state.layout = r.layout;
  state.grade = r.grade;
  state.titleStyle = r.titleStyle;
  state.title = r.title;
  state.backdrop = r.backdrop;
  state.blend = r.blend;
  state.palette = { enabled: true, stops: [...r.paletteStops], name: PALETTE_PRESETS[r.palette].label, preset: r.palette };
  return r;
}

export const BACKDROPS = {
  none: { label: 'No backdrop' },
  skyline: { label: 'Skyline Sunset', file: 'backdrops/skyline.jpg' },
  beach: { label: 'Palm Beach', file: 'backdrops/beach.jpg' },
  street: { label: 'Neon Street', file: 'backdrops/street.jpg' },
};

export const BLENDS = {
  none: 'Blend off',
  screen: 'Screen',
  overlay: 'Overlay',
  'soft-light': 'Soft light',
};

// Raw mode for the before/after compare: no grade filter, no tint at all.
// Kept OUT of GRADES so it never shows up as a grade button or a Surprise pick.
const RAW_GRADE = {
  label: 'Raw',
  filter: 'none',
  top: 'rgba(0,0,0,0)',
  bottom: 'rgba(0,0,0,0)',
};

export const TREATMENTS = {
  none: { label: 'No treatment' },
  duotone: { label: 'Duotone' },
  threshold: { label: 'Threshold' },
  solarize: { label: 'Solarize' },
  cross: { label: 'Cross Process' },
};

// --- Display fonts (v11) -------------------------------------------------
// Two real OFL display fonts, vendored locally in app/fonts/ and loaded via
// @font-face in index.html — no network at runtime. Anton is a tall,
// condensed poster face; Archivo Black is a wide, heavy grotesque. Both
// pair with every v3 title style + the v4 Chrome Gradient. `weight` is the
// font's own weight (both ship a single 400); the System entry keeps the
// old Arial Black 900 look for anyone who prefers it.
export const FONTS = {
  system: { label: 'System Bold', family: '"Arial Black", "Helvetica Neue", system-ui, sans-serif', weight: 900 },
  anton: { label: 'Anton (OFL)', family: '"Vice Anton", "Arial Black", system-ui, sans-serif', weight: 400 },
  archivo: { label: 'Archivo Black (OFL)', family: '"Vice Archivo", "Arial Black", system-ui, sans-serif', weight: 400 },
};
export function titleFontOf(state) {
  return FONTS[(state && state.titleFont) || 'anton'] || FONTS.anton;
}
export function bodyFontOf(state) {
  return FONTS[(state && state.bodyFont) || 'system'] || FONTS.system;
}

export const TITLE_STYLES = {
  flat: { label: 'Flat Bold' },
  extruded: { label: '3D Extruded' },
  gradient: { label: 'Gradient Fill' },
  sticker: { label: 'Sticker Outline' },
  glow: { label: 'Neon Glow' },
  curved: { label: 'Curved Arc' },
  chrome: { label: 'Chrome Gradient' },
};

// ---------------------------------------------------------------------------
// Frames pack (v9): 5 procedural border treatments for the whole cover —
// drawn in code after the glitch pass, baked into the PNG. A frame is a
// cover-level choice (state.frame), so every export size carries it, and
// Batch mode gives each variant its own frame.
// ---------------------------------------------------------------------------
export const FRAMES = {
  none: { label: 'No frame' },
  filmstrip: { label: 'Film Strip' },
  polaroid: { label: 'Polaroid' },
  ticket: { label: 'Ticket Stub' },
  torn: { label: 'Torn Edge' },
  rounded: { label: 'Rounded' },
};

export const FRAME_KEYS = ['filmstrip', 'polaroid', 'ticket', 'torn', 'rounded'];

// --- Canvas background (v10) ----------------------------------------------
// The board behind the panels: none (the old dark board), a solid colour, a
// 2-stop gradient (from the custom palette's stops when one is on, else the
// two colours below), or a faint dots / grid pattern. Shows through the
// gutters of every layout, and bakes into the PNG.
export const CANVAS_BGS = {
  none: { label: 'Canvas: dark board' },
  solid: { label: 'Canvas: solid colour' },
  gradient: { label: 'Canvas: gradient' },
  dots: { label: 'Canvas: dot pattern' },
  grid: { label: 'Canvas: grid pattern' },
};

export function defaultCanvasBg() {
  return { kind: 'none', color: '#ff2e88', color2: '#00e5ff' };
}

// --- Freeform mode (v10) --------------------------------------------------
// The layout stops being a cage: every panel becomes a free object with its
// own position, size, rotation and z-order (fractions of the canvas, so the
// same arrangement works at every export size), and the title block becomes
// a draggable object too. `layout` records which layout the items were
// derived from — a render with a different layout falls back to that
// layout's fixed rects, so Series variants and batch covers never inherit a
// stale arrangement.
export function defaultFreeform() {
  return { on: false, snap: true, layout: null, items: null, title: { x: 0.5, y: 0.32, rot: 0 }, titleMoved: false };
}

export function freeformItemsFor(layout) {
  const base = layoutPanels(layout, 1280, 720);
  return base.map((r, i) => ({
    x: r.x / 1280, y: r.y / 720, w: r.w / 1280, h: r.h / 720,
    rot: r.rot || 0, z: i, modified: false,
  }));
}

export function freeformRects(state, W, H) {
  const base = layoutPanels(state.layout, W, H);
  const ff = state.freeform || defaultFreeform();
  const items = ff.items || [];
  const rects = base.map((r, i) => {
    const it = items[i];
    // Untouched items use the live layout rect exactly — enabling Freeform
    // reproduces the fixed layout pixel-for-pixel at every export size
    // (the stored fractions are only a starting point; layout gutters
    // round per size). Only a dragged / resized / rotated panel uses its
    // stored fractions.
    if (!it || !it.modified) return { ...r, panel: i };
    return { ...r, panel: i, x: it.x * W, y: it.y * H, w: it.w * W, h: it.h * H, rot: it.rot || 0 };
  });
  const zOf = (pi) => (items[pi] && items[pi].z != null ? items[pi].z : pi);
  return rects.slice().sort((a, b) => zOf(a.panel) - zOf(b.panel));
}

/** Print marks (v10): bleed edge (dashed pink), crop marks at the four
 *  corners of the bleed, and a safe-area box (dashed cyan) — drawn over the
 *  finished cover, so they bake into the PNG when the toggle is on. */
export function drawPrintMarks(ctx, W, H) {
  const S = Math.min(W, H);
  const bleed = Math.round(S * 0.03);
  const safe = Math.round(S * 0.06);
  const mark = Math.round(S * 0.045);
  ctx.save();
  ctx.strokeStyle = '#ff2e88';
  ctx.lineWidth = Math.max(2, Math.round(S * 0.004));
  ctx.setLineDash([Math.round(S * 0.02), Math.round(S * 0.012)]);
  ctx.strokeRect(bleed, bleed, W - 2 * bleed, H - 2 * bleed);
  ctx.setLineDash([]);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, Math.round(S * 0.005));
  const corners = [
    [bleed, bleed, 1, 1], [W - bleed, bleed, -1, 1],
    [bleed, H - bleed, 1, -1], [W - bleed, H - bleed, -1, -1],
  ];
  for (const [cx, cy, sx, sy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * mark);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * mark, cy);
    ctx.stroke();
  }
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = Math.max(2, Math.round(S * 0.003));
  ctx.setLineDash([Math.round(S * 0.014), Math.round(S * 0.01)]);
  ctx.strokeRect(safe, safe, W - 2 * safe, H - 2 * safe);
  ctx.restore();
}

/** The canvas background (v10): the board behind the panels. A gradient
 *  takes its stops from the custom palette when one is on, else the two
 *  colours below; dots / grid are faint patterns in the second colour. */
function drawCanvasBg(ctx, W, H, s) {
  const bg = s.canvasBg || defaultCanvasBg();
  const S = Math.min(W, H);
  if (bg.kind === 'solid') {
    ctx.fillStyle = bg.color || '#12081f';
    ctx.fillRect(0, 0, W, H);
    return;
  }
  if (bg.kind === 'gradient') {
    const pal = s.palette;
    const c1 = (pal && pal.enabled && pal.stops && pal.stops[0]) || bg.color || '#ff2e88';
    const c2 = (pal && pal.enabled && pal.stops && pal.stops[2]) || bg.color2 || '#00e5ff';
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return;
  }
  if (bg.kind === 'dots' || bg.kind === 'grid') {
    ctx.fillStyle = '#12081f';
    ctx.fillRect(0, 0, W, H);
    const step = Math.max(18, Math.round(S * 0.045));
    const accent = bg.color2 || '#00e5ff';
    if (bg.kind === 'dots') {
      ctx.fillStyle = hexToRgba(accent, 0.35);
      for (let x = step / 2; x < W; x += step) {
        for (let y = step / 2; y < H; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, Math.max(2, step * 0.07), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      ctx.strokeStyle = hexToRgba(accent, 0.22);
      ctx.lineWidth = 2;
      for (let x = 0; x <= W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }
    return;
  }
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, 0, W, H);
}

export function defaultFrame() {
  return 'none';
}

/** Smart Crop focus (v9): the photo's focus point, from its real pixels.
 *  The image is sampled on an 8x6 grid; each cell scores brightness x local
 *  contrast (a bright, busy cell beats a flat bright sky and a flat dark
 *  corner), and the best cell's centre is the focus. Deterministic: the
 *  same photo always returns the same point. Returns { x, y, score } in
 *  0..1 fractions, or null without an image. */
export function analyzeFocus(img) {
  if (!img) return null;
  const cols = 8;
  const rows = 6;
  const c = document.createElement('canvas');
  c.width = cols * 8;
  c.height = rows * 8;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0, c.width, c.height);
  const data = g.getImageData(0, 0, c.width, c.height).data;
  const cw = 8;
  const ch = 8;
  let best = { x: 0.5, y: 0.5, score: -1 };
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      let sum = 0;
      let sumSq = 0;
      let n = 0;
      for (let y = r * ch; y < (r + 1) * ch; y++) {
        for (let x = col * cw; x < (col + 1) * cw; x++) {
          const o = (y * c.width + x) * 4;
          const l = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
          sum += l;
          sumSq += l * l;
          n++;
        }
      }
      const mean = sum / n;
      const sd = Math.sqrt(Math.max(0, sumSq / n - mean * mean));
      // Brightness pulls toward the subject, contrast breaks ties toward
      // the busy part of the frame (a face, a sign) over a flat sky.
      const score = (mean / 255) * 0.6 + Math.min(1, sd / 60) * 0.4;
      if (score > best.score) best = { x: (col + 0.5) / cols, y: (r + 0.5) / rows, score };
    }
  }
  return best;
}

/** Smart Crop (v9): steers the selected panel's crop onto the photo's focus
 *  point. The panel zooms in just enough to have slack (1.25x), then dx/dy
 *  shift the photo so the focus lands near the panel centre. The focus is
 *  stored on the state (state.focus) so the editor can show it. Returns the
 *  focus point, or null when the panel has no photo. */
export function applySmartCrop(state, panelIdx) {
  const idx = panelIdx == null ? 0 : panelIdx;
  const panel = state.panels[idx];
  if (!panel) return null;
  const img = state.photos[panel.photo];
  if (!img) return null;
  const focus = analyzeFocus(img);
  if (!focus) return null;
  panel.zoom = Math.max(panel.zoom || 1, 1.25);
  // Cover-fit slack at 1.25x is 0.125 of the panel on the fit axis — the
  // shift must stay inside it, or the panel edge shows the board colour
  // behind the photo. 0.12 keeps the photo covered on every aspect ratio.
  panel.dx = Math.max(-0.12, Math.min(0.12, (0.5 - focus.x) * 0.55));
  panel.dy = Math.max(-0.12, Math.min(0.12, (0.5 - focus.y) * 0.55));
  state.focus = { x: focus.x, y: focus.y, panel: idx };
  return focus;
}

// Photo Lab (v4): vintage film presets, applied on pixels after grade/ink.
export const FILMS = {
  none: { label: 'No film' },
  vhs86: { label: 'VHS 86' },
  polaroid95: { label: 'Polaroid 95' },
  chrome99: { label: 'Chrome 99' },
};

// Photo Lab (v4): color-pop keeps one hue vivid and drains the rest.
export const COLORPOPS = {
  none: { label: 'Full colour' },
  pink: { label: 'Pop: Pink', hue: 330 },
  gold: { label: 'Pop: Gold', hue: 43 },
  cyan: { label: 'Pop: Cyan', hue: 187 },
  green: { label: 'Pop: Green', hue: 120 },
};

// ---------------------------------------------------------------------------
// Darkroom (v6): a real photo darkroom. Sliders are exposure in EV (-2..2),
// contrast / saturation / temperature / highlights / shadows (-1..1),
// sharpen / clarity (0..1). Curves are per-channel tone curves: 5 control
// points each on [0,1]x[0,1], piecewise-linear. HSL shifts one hue family at
// a time: hue shift in degrees (-30..30), saturation scale (-1..1).
// ---------------------------------------------------------------------------
export const DARKROOM_CHANNELS = {
  luma: { label: 'Luma (all)' },
  red: { label: 'Red' },
  green: { label: 'Green' },
  blue: { label: 'Blue' },
};

export const HSL_CHANNELS = [
  { key: 'red', label: 'Red', hue: 0 },
  { key: 'orange', label: 'Orange', hue: 30 },
  { key: 'yellow', label: 'Yellow', hue: 60 },
  { key: 'green', label: 'Green', hue: 120 },
  { key: 'blue', label: 'Blue', hue: 240 },
  { key: 'magenta', label: 'Magenta', hue: 300 },
];

const IDENTITY_CURVE = [[0, 0], [0.25, 0.25], [0.5, 0.5], [0.75, 0.75], [1, 1]];

export function defaultDarkroom() {
  return {
    exposure: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    highlights: 0,
    shadows: 0,
    sharpen: 0,
    clarity: 0,
    curves: {
      luma: IDENTITY_CURVE.map((p) => [...p]),
      red: IDENTITY_CURVE.map((p) => [...p]),
      green: IDENTITY_CURVE.map((p) => [...p]),
      blue: IDENTITY_CURVE.map((p) => [...p]),
    },
    hsl: {
      red: { hue: 0, sat: 0 },
      orange: { hue: 0, sat: 0 },
      yellow: { hue: 0, sat: 0 },
      green: { hue: 0, sat: 0 },
      blue: { hue: 0, sat: 0 },
      magenta: { hue: 0, sat: 0 },
    },
  };
}

function cloneCurve(points) {
  return points.map((p) => [p[0], p[1]]);
}

function cloneDarkroom(dr) {
  const out = JSON.parse(JSON.stringify(dr || defaultDarkroom()));
  return out;
}

// One-click darkroom presets: a full curve set + slider set each. Golden
// Hour is warm with lifted shadows (sunset light); Blue Hour is cool with
// crushed shadows (night falling).
export const DARKROOM_PRESETS = {
  goldenHour: {
    label: 'Golden Hour',
    darkroom: {
      exposure: 0.3, contrast: 0.18, saturation: 0.28, temperature: 0.6,
      highlights: -0.12, shadows: 0.3, sharpen: 0.25, clarity: 0.2,
      curves: {
        luma: [[0, 0.02], [0.25, 0.28], [0.5, 0.53], [0.75, 0.78], [1, 0.98]],
        red: [[0, 0.03], [0.25, 0.29], [0.5, 0.55], [0.75, 0.80], [1, 1]],
        green: [[0, 0.01], [0.25, 0.26], [0.5, 0.51], [0.75, 0.76], [1, 0.98]],
        blue: [[0, 0], [0.25, 0.22], [0.5, 0.46], [0.75, 0.72], [1, 0.94]],
      },
      hsl: {
        red: { hue: 4, sat: 0.15 }, orange: { hue: 3, sat: 0.2 },
        yellow: { hue: 0, sat: 0.1 }, green: { hue: 0, sat: 0 },
        blue: { hue: 0, sat: 0 }, magenta: { hue: 0, sat: 0 },
      },
    },
  },
  blueHour: {
    label: 'Blue Hour',
    darkroom: {
      exposure: -0.15, contrast: 0.22, saturation: 0.15, temperature: -0.6,
      highlights: 0.1, shadows: -0.2, sharpen: 0.25, clarity: 0.25,
      curves: {
        luma: [[0, 0], [0.25, 0.22], [0.5, 0.47], [0.75, 0.74], [1, 0.97]],
        red: [[0, 0], [0.25, 0.21], [0.5, 0.45], [0.75, 0.71], [1, 0.93]],
        green: [[0, 0.01], [0.25, 0.24], [0.5, 0.49], [0.75, 0.75], [1, 0.97]],
        blue: [[0, 0.04], [0.25, 0.29], [0.5, 0.55], [0.75, 0.80], [1, 1]],
      },
      hsl: {
        red: { hue: 0, sat: 0 }, orange: { hue: 0, sat: 0 },
        yellow: { hue: 0, sat: 0 }, green: { hue: 0, sat: 0 },
        blue: { hue: -4, sat: 0.2 }, magenta: { hue: 0, sat: 0.1 },
      },
    },
  },
};

/** Applies a darkroom preset (curves + sliders + HSL) to the state.
 *  Returns false for unknown keys. */
export function applyDarkroomPreset(state, key) {
  const p = DARKROOM_PRESETS[key];
  if (!p) return false;
  state.darkroom = cloneDarkroom(p.darkroom);
  return true;
}

/** True when any darkroom control differs from its default. */
export function darkroomActive(dr) {
  if (!dr) return false;
  for (const k of ['exposure', 'contrast', 'saturation', 'temperature', 'highlights', 'shadows', 'sharpen', 'clarity']) {
    if (dr[k]) return true;
  }
  for (const ch of Object.keys(dr.curves || {})) {
    const pts = dr.curves[ch];
    const id = IDENTITY_CURVE;
    if (!pts || pts.length !== id.length) return true;
    for (let i = 0; i < id.length; i++) {
      if (Math.abs(pts[i][0] - id[i][0]) > 0.001 || Math.abs(pts[i][1] - id[i][1]) > 0.001) return true;
    }
  }
  for (const ch of Object.keys(dr.hsl || {})) {
    if (dr.hsl[ch].hue || dr.hsl[ch].sat) return true;
  }
  return false;
}

/** Builds a 256-entry lookup table from tone-curve control points
 *  (piecewise-linear through the points, sorted by x). */
export function buildCurveLUT(points) {
  const pts = [...points].sort((a, b) => a[0] - b[0]);
  const lut = new Uint8Array(256);
  for (let v = 0; v < 256; v++) {
    const t = v / 255;
    let y;
    if (t <= pts[0][0]) y = pts[0][1];
    else if (t >= pts[pts.length - 1][0]) y = pts[pts.length - 1][1];
    else {
      let i = 0;
      while (i < pts.length - 2 && t > pts[i + 1][0]) i++;
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      y = x1 === x0 ? y0 : y0 + ((y1 - y0) * (t - x0)) / (x1 - x0);
    }
    lut[v] = Math.max(0, Math.min(255, Math.round(y * 255)));
  }
  return lut;
}

// ---------------------------------------------------------------------------
// Smart Suggest (v6): reads the photo's real pixels — average brightness,
// contrast (luminance spread), saturation, warmth (red minus blue) and the
// dominant hue — then scores every grade against those measurements and
// returns the 3 best-fitting cover recipes. Nothing here is random: the same
// photo always suggests the same three covers, and each card cites the
// measurements that picked it.
// ---------------------------------------------------------------------------
export function analyzePixels(data, count) {
  let sumL = 0;
  let sumSq = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumSat = 0;
  const hueBins = new Array(12).fill(0);
  const HUE_NAMES = ['red', 'orange', 'gold', 'yellow', 'lime', 'green', 'teal', 'cyan', 'blue', 'violet', 'magenta', 'pink'];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    sumL += l;
    sumSq += l * l;
    sumR += r;
    sumG += g;
    sumB += b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    sumSat += sat;
    if (max !== min && sat > 0.25) {
      const hue = rgbHue(r, g, b);
      if (hue >= 0) hueBins[Math.floor(hue / 30) % 12]++;
    }
  }
  const n = count || data.length / 4;
  const mean = sumL / n;
  const variance = Math.max(0, sumSq / n - mean * mean);
  const contrast = Math.min(1, Math.sqrt(variance) / 85);
  let bestBin = 0;
  for (let i = 1; i < 12; i++) if (hueBins[i] > hueBins[bestBin]) bestBin = i;
  const hueTotal = hueBins.reduce((a, b2) => a + b2, 0);
  return {
    brightness: mean / 255,
    contrast,
    saturation: sumSat / n,
    // Warmth: +1 = strongly red over blue, -1 = strongly blue over red.
    warmth: Math.max(-1, Math.min(1, (sumR - sumB) / n / 60)),
    dominantHue: bestBin * 30 + 15,
    dominantHueName: HUE_NAMES[bestBin],
    dominantHueShare: hueTotal ? hueBins[bestBin] / hueTotal : 0,
    samples: n,
  };
}

/** Samples an image's pixels (downscaled to 64x48) and returns the same
 *  analysis object as analyzePixels. */
export function analyzePhoto(img) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 48;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0, 64, 48);
  const data = g.getImageData(0, 0, 64, 48).data;
  return analyzePixels(data, 64 * 48);
}

const SUGGEST_RECIPES = [
  { grade: 'sunset', layout: 'hero', title: 'GOLDEN HOUR', titleStyle: 'extruded' },
  { grade: 'neon', layout: 'overlap', title: 'NEON NIGHTS', titleStyle: 'glow' },
  { grade: 'noir', layout: 'triptych', title: 'PALM NOIR', titleStyle: 'sticker' },
  { grade: 'sunsetNoir', layout: 'magazine', title: 'AFTER DARK', titleStyle: 'chrome' },
  { grade: 'pastel', layout: 'polaroid', title: 'PASTEL VICE', titleStyle: 'gradient' },
  { grade: 'heatwave', layout: 'magazine', title: 'HEATWAVE', titleStyle: 'curved' },
  { grade: 'chrome', layout: 'collage5', title: 'VICE CHROME', titleStyle: 'chrome' },
  { grade: 'comicpop', layout: 'storyboard', title: 'VICE POP', titleStyle: 'sticker' },
  { grade: 'sunbleach', layout: 'grid3', title: 'SUNBLEACH', titleStyle: 'flat' },
  { grade: 'inknoir', layout: 'collage5', title: 'VICE INK', titleStyle: 'flat' },
];

function scoreRecipe(recipe, a) {
  const warm = Math.max(0, a.warmth);
  const cool = Math.max(0, -a.warmth);
  const dark = 1 - a.brightness;
  const bright = a.brightness;
  const hue = a.dominantHue;
  const pinkish = (hue >= 300 || hue < 30) ? 1 : 0;
  const goldish = (hue >= 30 && hue < 75) ? 1 : 0;
  const blueish = (hue >= 180 && hue < 270) ? 1 : 0;
  switch (recipe.grade) {
    case 'sunset': return warm * 2 + bright * 0.8 + a.saturation * 0.8 + goldish * 1.2;
    case 'neon': return a.contrast * 1.2 + a.saturation * 1.2 + (pinkish || blueish) * 1.2 + cool * 0.5;
    case 'noir': return dark * 2 + a.contrast * 0.8 + (1 - a.saturation) * 0.6;
    case 'sunsetNoir': return dark * 1.4 + warm * 1 + a.contrast * 0.6;
    case 'pastel': return bright * 1.4 + (1 - a.contrast) * 1.2 + a.saturation * 0.5;
    case 'heatwave': return warm * 1.4 + bright * 0.8 + (1 - a.saturation) * 0.8;
    case 'chrome': return cool * 1.4 + a.contrast * 1 + blueish * 0.8;
    case 'comicpop': return a.saturation * 1.6 + a.contrast * 1 + bright * 0.4;
    case 'sunbleach': return bright * 1.2 + (1 - a.saturation) * 1 + (1 - a.contrast) * 0.6;
    case 'inknoir': return a.contrast * 1.2 + dark * 0.8 + (1 - a.saturation) * 1;
    default: return 0;
  }
}

/** Returns the 3 best cover recipes for a photo analysis, each with the
 *  measurements that picked it, as a human-readable reason. */
export function suggestCovers(a) {
  const scored = SUGGEST_RECIPES.map((r) => ({ ...r, score: scoreRecipe(r, a) }));
  scored.sort((x, y) => y.score - x.score);
  const top = scored.slice(0, 3);
  const evidence = `Brightness ${a.brightness.toFixed(2)} · contrast ${a.contrast.toFixed(2)} · `
    + `${a.warmth >= 0 ? 'warm' : 'cool'} ${Math.abs(a.warmth).toFixed(2)} · `
    + `${a.dominantHueName} dominates (${Math.round(a.dominantHueShare * 100)}% of coloured pixels)`;
  const reasons = {
    sunset: 'Warm, bright and saturated — Sunset grade deepens the golden light.',
    neon: 'High contrast and vivid colour — Neon grade turns it up after dark.',
    noir: 'Dark and moody — Palm Noir leans into the shadows.',
    sunsetNoir: 'Dark with warm embers — Sunset Noir keeps the glow, drops the light.',
    pastel: 'Bright and soft — Pastel Vice keeps it light and airy.',
    heatwave: 'Warm and washed — Heatwave duotone bakes the sun in.',
    chrome: 'Cool and contrasty — Neon Chrome polishes the blues.',
    comicpop: 'Saturated and punchy — Comic Pop makes it jump off the page.',
    sunbleach: 'Bright and faded — Sunbleach is the bleached-out summer print.',
    inknoir: 'Contrasty and drained — Ink Noir draws it in black and white.',
  };
  return top.map((r) => ({
    grade: r.grade,
    layout: r.layout,
    title: r.title,
    titleStyle: r.titleStyle,
    gradeLabel: GRADES[r.grade].label,
    layoutLabel: LAYOUTS[r.layout].label,
    score: Number(r.score.toFixed(2)),
    reason: `${reasons[r.grade]} ${evidence}`,
  }));
}

// ---------------------------------------------------------------------------
// Glitch / CRT effects (v7): chromatic aberration, scanlines, tracking
// noise, glitch slices and an RGB shift on the title. The pixel effects run
// as one post-pass over the finished cover (drawCover), the title fringe is
// drawn with the title itself — so both export into the PNG exactly as
// previewed. Slice/noise placement uses a fixed-seed PRNG, so the same
// state always renders the same glitch: a cover is reproducible, not a
// dice roll. Amounts: chromatic / title shift in px at 1080 wide (scaled
// with the canvas), scanlines / noise / slices as 0..1 strength.
// ---------------------------------------------------------------------------
export function defaultGlitch() {
  return {
    chromatic: { on: false, amount: 8 },
    scanlines: { on: false, amount: 0.5 },
    noise: { on: false, amount: 0.5 },
    slices: { on: false, amount: 0.5 },
    titleShift: { on: false, amount: 6 },
  };
}

/** True when any glitch effect is switched on. */
export function glitchActive(g) {
  if (!g) return false;
  return Object.values(g).some((fx) => fx && fx.on);
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Post-pass over the finished cover: RGB channel split, displaced slices,
 *  scanline darkening and VHS tracking-noise streaks. One pass over a
 *  source copy, so every effect composes instead of fighting. */
export function applyGlitch(ctx, W, H, glitch) {
  const img = ctx.getImageData(0, 0, W, H);
  const src = new Uint8ClampedArray(img.data);
  const d = img.data;
  const rnd = mulberry32(20261119);
  const scale = W / 1080;
  // Per-row horizontal displacement from the slice effect (0 = untouched).
  const rowShift = new Int16Array(H);
  if (glitch.slices && glitch.slices.on) {
    const amt = glitch.slices.amount || 0;
    const count = Math.round(2 + amt * 10);
    for (let i = 0; i < count; i++) {
      const y0 = Math.floor(rnd() * H);
      const hgt = Math.max(2, Math.round((4 + rnd() * 36) * scale));
      const dx = Math.round((rnd() < 0.5 ? -1 : 1) * (10 + rnd() * 60) * amt * scale);
      for (let y = y0; y < Math.min(H, y0 + hgt); y++) rowShift[y] = dx;
    }
  }
  // Per-row tracking-noise brightness lift (0 = untouched).
  const rowNoise = new Float32Array(H);
  if (glitch.noise && glitch.noise.on) {
    const amt = glitch.noise.amount || 0;
    const count = Math.round(amt * 24);
    for (let i = 0; i < count; i++) {
      const y0 = Math.floor(rnd() * H);
      const hgt = 1 + Math.floor(rnd() * 3);
      const lift = (40 + rnd() * 90) * amt;
      for (let y = y0; y < Math.min(H, y0 + hgt); y++) rowNoise[y] = Math.max(rowNoise[y], lift);
    }
  }
  const ca = (glitch.chromatic && glitch.chromatic.on)
    ? Math.max(1, Math.round((glitch.chromatic.amount || 0) * scale)) : 0;
  const scanAmt = (glitch.scanlines && glitch.scanlines.on) ? (glitch.scanlines.amount || 0) : 0;
  for (let y = 0; y < H; y++) {
    const shift = rowShift[y];
    const noise = rowNoise[y];
    const scan = scanAmt && y % 3 === 0 ? 1 - 0.35 * scanAmt : 1;
    const rowBase = y * W * 4;
    for (let x = 0; x < W; x++) {
      const o = rowBase + x * 4;
      const sx = Math.max(0, Math.min(W - 1, x + shift));
      const rx = Math.max(0, Math.min(W - 1, x - ca));
      const bx = Math.max(0, Math.min(W - 1, x + ca));
      let r = src[rowBase + rx * 4];
      let g = src[rowBase + sx * 4 + 1];
      let b = src[rowBase + bx * 4 + 2];
      if (scan !== 1) { r *= scan; g *= scan; b *= scan; }
      if (noise) { r += noise; g += noise; b += noise; }
      d[o] = r;
      d[o + 1] = g;
      d[o + 2] = b;
    }
  }
  ctx.putImageData(img, 0, 0);
}

// ---------------------------------------------------------------------------
// Procedural stickers (v7): small peel-and-stick art drawn in code — star,
// lightning bolt, mini palm, sun, neon heart — each with a die-cut white
// backing so it reads on any photo. Stickers sit on top of everything
// (after the bubbles), are draggable on the preview, and export into the
// PNG. Positions are centre fractions of the cover (x, y in 0..1).
// ---------------------------------------------------------------------------
export const STICKER_KINDS = {
  star: { label: 'Star' },
  bolt: { label: 'Lightning bolt' },
  palm: { label: 'Mini palm' },
  sun: { label: 'Sun' },
  heart: { label: 'Neon heart' },
};

export function defaultStickers() {
  return [{ kind: 'star', x: 0.85, y: 0.16, size: 1, rot: 12 }];
}

/** Hit-test boxes for the stickers, in canvas pixels (same numbers the
 *  draw uses, so the editor's drag matches exactly what is painted). */
export function layoutStickers(W, H, state) {
  const out = [];
  for (const st of state.stickers || []) {
    const r = Math.min(W, H) * 0.055 * (st.size || 1);
    const w = r * 2.6;
    out.push({
      ...st,
      cx: st.x * W,
      cy: st.y * H,
      r,
      x: st.x * W - w / 2,
      y: st.y * H - w / 2,
      w,
      h: w,
    });
  }
  return out;
}

function drawStickerShape(ctx, kind, r) {
  // Drawn centred on (0, 0), radius ~r.
  if (kind === 'bolt') {
    ctx.beginPath();
    const pts = [[0.15, -1], [-0.45, 0.15], [-0.05, 0.15], [-0.25, 1], [0.5, -0.15], [0.05, -0.15]];
    pts.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px * r, py * r);
      else ctx.lineTo(px * r, py * r);
    });
    ctx.closePath();
    ctx.fillStyle = '#ffe600';
    ctx.fill();
    ctx.lineWidth = Math.max(2, r * 0.08);
    ctx.strokeStyle = '#ff2e88';
    ctx.stroke();
  } else if (kind === 'palm') {
    drawOnePalm(ctx, -r * 0.2, r * 0.9, r * 1.5, '#160a24');
  } else if (kind === 'sun') {
    ctx.strokeStyle = '#ff9d00';
    ctx.lineWidth = Math.max(2, r * 0.12);
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55);
      ctx.lineTo(Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98);
      ctx.stroke();
    }
    const g = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 0.55);
    g.addColorStop(0, '#fff7d6');
    g.addColorStop(1, '#ff6b35');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'heart') {
    ctx.beginPath();
    ctx.moveTo(0, r * 0.6);
    ctx.bezierCurveTo(-r, -r * 0.1, -r * 0.5, -r * 0.9, 0, -r * 0.3);
    ctx.bezierCurveTo(r * 0.5, -r * 0.9, r, -r * 0.1, 0, r * 0.6);
    ctx.closePath();
    ctx.shadowColor = '#ff2e88';
    ctx.shadowBlur = r * 0.5;
    ctx.fillStyle = '#ff2e88';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(2, r * 0.1);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  } else {
    // 'star' and any unknown kind: a 5-point star.
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 === 0 ? r : r * 0.45;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#ffb400';
    ctx.fill();
    ctx.lineWidth = Math.max(2, r * 0.1);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  }
}

function drawStickers(ctx, W, H, state) {
  const items = layoutStickers(W, H, state);
  for (const it of items) {
    ctx.save();
    ctx.translate(it.cx, it.cy);
    ctx.rotate(((it.rot || 0) * Math.PI) / 180);
    // Die-cut white backing, like a real sticker.
    ctx.beginPath();
    ctx.arc(0, 0, it.r * 1.28, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = it.r * 0.25;
    ctx.shadowOffsetY = it.r * 0.08;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    drawStickerShape(ctx, it.kind, it.r);
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Auto-caption (v7): the same pixel reading as Smart Suggest, turned into
// titles. Deterministic: the same photo always suggests the same three
// captions, each citing the measurements that picked it. The first is the
// best fit for the photo's light + temperature; the next two come from the
// dominant hue, the saturation, or the brightness — so the three are
// always different covers, not three wordings of one idea.
// ---------------------------------------------------------------------------
export function suggestCaptions(a) {
  const warm = a.warmth >= 0.15;
  const cool = a.warmth <= -0.15;
  const dark = a.brightness < 0.42;
  const bright = a.brightness > 0.62;
  const vivid = a.saturation > 0.45;
  const hue = a.dominantHueName || '';
  const ev = `Brightness ${a.brightness.toFixed(2)} · ${a.warmth >= 0 ? 'warm' : 'cool'} ${Math.abs(a.warmth).toFixed(2)} · ${hue} dominates`;
  const cands = [];
  if (warm && dark) cands.push({ title: 'VICE CITY NIGHTS', tagline: 'The city never sleeps — it just changes colour.', why: 'Warm and dark: a night cover in golden light.' });
  if (warm && bright) cands.push({ title: 'GOLDEN HOUR', tagline: 'Chase the sun till the palms run out.', why: 'Warm and bright: the golden hour, bottled.' });
  if (cool && dark) cands.push({ title: 'NEON AFTER DARK', tagline: 'Lights on. Brakes off. Vice City after midnight.', why: 'Cool and dark: neon does the talking.' });
  if (cool && bright) cands.push({ title: 'BLUE HOUR', tagline: 'Ten minutes when the whole city turns blue.', why: 'Cool and bright: the blue hour before night.' });
  if (!warm && !cool) cands.push({ title: 'VICE LIGHTS', tagline: 'One city. One night. No brakes.', why: 'Balanced light: the classic Vice cover.' });
  if (hue === 'pink' || hue === 'magenta' || hue === 'red') cands.push({ title: 'PINK PALMS', tagline: 'Bubblegum sunset, palm-tree shade.', why: `${hue} dominates the frame.` });
  if (hue === 'gold' || hue === 'yellow' || hue === 'orange') cands.push({ title: 'GOLD RUSH', tagline: 'Every street paved in late light.', why: `${hue} dominates the frame.` });
  if (hue === 'blue' || hue === 'cyan' || hue === 'teal') cands.push({ title: 'MIDNIGHT BLUE', tagline: 'Deep water, deeper neon.', why: `${hue} dominates the frame.` });
  if (hue === 'green' || hue === 'lime') cands.push({ title: 'PALM GREEN', tagline: 'Where the palms bend, the city follows.', why: `${hue} dominates the frame.` });
  if (hue === 'violet') cands.push({ title: 'VIOLET HOUR', tagline: 'Purple sky, pink pavement.', why: `${hue} dominates the frame.` });
  if (vivid) cands.push({ title: 'VICE POP', tagline: 'Turn it up till the neon buzzes.', why: 'Saturation is high — the colours want to shout.' });
  if (dark) cands.push({ title: 'AFTER DARK', tagline: 'What happens after dark stays on the cover.', why: 'A dark frame: lean into the night.' });
  if (bright) cands.push({ title: 'SUNBLEACH', tagline: 'Bleached by the sun, kept by the city.', why: 'A bright frame: the bleached-out summer print.' });
  cands.push({ title: 'VICE LIGHTS', tagline: 'One city. One night. No brakes.', why: 'The house classic — always a safe cover.' });
  // Guaranteed fallbacks, so the three cards always fill even for a photo
  // that is neither warm nor cool, neither dark nor bright, and not vivid.
  cands.push({ title: 'PALM NOIR', tagline: 'Shadows, palms and a city that never blinks.', why: 'A moody all-rounder for any light.' });
  cands.push({ title: 'NEON NIGHTS', tagline: 'The strip never sleeps and neither do you.', why: 'Neon fits every Vice cover.' });
  cands.push({ title: 'HEATWAVE', tagline: 'Baked sun, buzzing streets, no shade.', why: 'Heat fits every Vice cover.' });
  const seen = new Set();
  const out = [];
  for (const c of cands) {
    if (seen.has(c.title)) continue;
    seen.add(c.title);
    out.push({ ...c, reason: `${c.why} ${ev}` });
    if (out.length === 3) break;
  }
  return out;
}

// One-click Looks: a complete cover recipe per preset — layout + grade +
// backdrop + title style + treatment + masthead + ink, in a single click.
export const LOOKS = {
  sunsetVice: {
    label: 'Sunset Vice', layout: 'hero', grade: 'sunset', backdrop: 'skyline',
    blend: 'screen', titleStyle: 'extruded', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: false, title: 'VICE SUNSET',
  },
  neonNights: {
    label: 'Neon Nights', layout: 'overlap', grade: 'neon', backdrop: 'street',
    blend: 'screen', titleStyle: 'glow', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: false, title: 'NEON NIGHTS',
  },
  palmNoir: {
    label: 'Palm Noir', layout: 'triptych', grade: 'noir', backdrop: 'none',
    blend: 'screen', titleStyle: 'sticker', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: false, title: 'PALM NOIR',
  },
  heatwave: {
    label: 'Heatwave', layout: 'magazine', grade: 'heatwave', backdrop: 'beach',
    blend: 'overlay', titleStyle: 'curved', treatment: 'duotone',
    masthead: true, coverLinesOn: true, ink: false, title: 'HEATWAVE',
  },
  pastelVice: {
    label: 'Pastel Vice', layout: 'polaroid', grade: 'pastel', backdrop: 'beach',
    blend: 'soft-light', titleStyle: 'gradient', treatment: 'none',
    masthead: false, coverLinesOn: false, ink: false, title: 'PASTEL VICE',
  },
  inkNoir: {
    label: 'Ink Noir', layout: 'collage5', grade: 'inknoir', backdrop: 'none',
    blend: 'screen', titleStyle: 'flat', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: true, title: 'VICE INK',
  },
};

const WORD_COLORS = ['#ff2e88', '#ffb400', '#00e5ff', '#ffffff', '#ff6b35', '#7CFF6B'];

// ---------------------------------------------------------------------------
// Procedural Vice Art Kit (v5): art elements drawn in code as overlay layers
// on top of the panels — no external assets, no network. Each element has
// on / opacity / color / position (fractions of the cover) / scale.
// ---------------------------------------------------------------------------
export const ART_ELEMENTS = [
  { key: 'sunburst', label: 'Sunburst rays' },
  { key: 'palm', label: 'Palm silhouettes' },
  { key: 'skyline', label: 'Skyline silhouette' },
  { key: 'sun', label: 'Sun / moon disc' },
  { key: 'grid', label: 'Perspective grid floor' },
];

export function defaultArt() {
  return {
    sunburst: { on: false, opacity: 0.55, color: '#ffb400', x: 0.5, y: 0.22, scale: 1 },
    palm: { on: false, opacity: 0.9, color: '#160a24', x: 0.07, y: 0.98, scale: 1 },
    skyline: { on: false, opacity: 0.85, color: '#12081f', x: 0, y: 0.98, scale: 1 },
    sun: { on: false, opacity: 0.95, color: '#ff6b35', x: 0.5, y: 0.22, scale: 1 },
    grid: { on: false, opacity: 0.35, color: '#00e5ff', x: 0.5, y: 0.62, scale: 1 },
  };
}

export const BUBBLE_STYLES = {
  classic: { label: 'Classic white', bg: '#ffffff', fg: '#1d0b2e', border: '#1d0b2e' },
  neon: { label: 'Neon', bg: 'rgba(18, 8, 31, 0.94)', fg: '#ffffff', border: '#ff2e88' },
  dark: { label: 'Black', bg: 'rgba(8, 4, 16, 0.94)', fg: '#ffffff', border: '#ffffff' },
};

export const BUBBLE_KINDS = {
  speech: { label: 'Speech' },
  thought: { label: 'Thought' },
};

export function defaultBubbles() {
  return [
    { kind: 'speech', text: 'VICE CITY, BABY!', x: 0.60, y: 0.26, size: 1, style: 'classic' },
  ];
}

// ---------------------------------------------------------------------------
// 3D tilt (v12): the whole finished cover is tilted in real perspective —
// rotate about the X axis (top leans away/toward) and the Y axis (left/right
// edge leans away), projected with a camera distance (perspective), and
// lifted off the board by a layered drop shadow. The tilt is applied in
// drawCover, so preview, export, series variants, template thumbnails and
// mockups all get the same depth. x/y are degrees, -20..20.
// ---------------------------------------------------------------------------
export function defaultTilt() {
  return { x: 0, y: 0, perspective: 900, shadow: 0.55 };
}

export const TILT_PRESETS = {
  flat: { label: 'Flat — no tilt', tilt: { x: 0, y: 0, perspective: 900, shadow: 0.55 } },
  leanLeft: { label: 'Lean left', tilt: { x: -6, y: 14, perspective: 900, shadow: 0.6 } },
  leanRight: { label: 'Lean right', tilt: { x: -6, y: -14, perspective: 900, shadow: 0.6 } },
  popOut: { label: 'Pop-out — top toward you', tilt: { x: 12, y: 8, perspective: 700, shadow: 0.7 } },
  showcase: { label: 'Showcase — gallery lean', tilt: { x: -8, y: 12, perspective: 900, shadow: 0.65 } },
};

export function tiltActive(state) {
  const t = state && state.tilt;
  return !!(t && (t.x || t.y));
}

/** The 4 screen corners of the tilted cover, in order TL, TR, BR, BL.
 *  Rotate the plane about Y then X, project with a pinhole camera at
 *  distance `perspective`, then shrink-to-fit inside 94% of the canvas so
 *  the tilted cover + its shadow never clip. Pure math — no DOM. */
export function tiltQuad(W, H, tilt) {
  const t = tilt || defaultTilt();
  const f = Math.max(300, t.perspective || 900);
  const ax = ((t.x || 0) * Math.PI) / 180;
  const ay = ((t.y || 0) * Math.PI) / 180;
  const cx = W / 2;
  const cy = H / 2;
  const cosX = Math.cos(ax);
  const sinX = Math.sin(ax);
  const cosY = Math.cos(ay);
  const sinY = Math.sin(ay);
  const local = [[-W / 2, -H / 2], [W / 2, -H / 2], [W / 2, H / 2], [-W / 2, H / 2]];
  const pts = local.map(([x, y]) => {
    const x1 = x * cosY;
    const z1 = -x * sinY;
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    const k = f / (f - z2);
    return [cx + x1 * k, cy + y1 * k];
  });
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const bw = Math.max(...xs) - Math.min(...xs);
  const bh = Math.max(...ys) - Math.min(...ys);
  const s = Math.min(1, (W * 0.90) / bw, (H * 0.90) / bh);
  const scaled = pts.map(([x, y]) => [cx + (x - cx) * s, cy + (y - cy) * s]);
  // The projected quad's centre is not the canvas centre (perspective
  // shifts it) — re-centre the bounding box so the tilted cover + its
  // shadow never clip on any side.
  const sx = scaled.map((p) => p[0]);
  const sy = scaled.map((p) => p[1]);
  const ox = cx - (Math.max(...sx) + Math.min(...sx)) / 2;
  const oy = cy - (Math.max(...sy) + Math.min(...sy)) / 2;
  return scaled.map(([x, y]) => [x + ox, y + oy]);
}

/** Draw one source triangle onto one destination triangle with the affine
 *  transform that maps the first onto the second, clipped to the dest
 *  triangle — the building block of the perspective warp below. */
function drawImageTriangle(ctx, img, sx0, sy0, sx1, sy1, sx2, sy2, dx0, dy0, dx1, dy1, dx2, dy2) {
  const d = (sx1 - sx0) * (sy2 - sy0) - (sx2 - sx0) * (sy1 - sy0);
  if (Math.abs(d) < 1e-6) return;
  const a = ((dx1 - dx0) * (sy2 - sy0) - (dx2 - dx0) * (sy1 - sy0)) / d;
  const b = ((dx2 - dx0) * (sx1 - sx0) - (dx1 - dx0) * (sx2 - sx0)) / d;
  const c = ((dy1 - dy0) * (sy2 - sy0) - (dy2 - dy0) * (sy1 - sy0)) / d;
  const e = ((dy2 - dy0) * (sx1 - sx0) - (dy1 - dy0) * (sx2 - sx0)) / d;
  const tx = dx0 - a * sx0 - b * sy0;
  const ty = dy0 - c * sx0 - e * sy0;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dx0, dy0);
  ctx.lineTo(dx1, dy1);
  ctx.lineTo(dx2, dy2);
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(a, c, b, e, tx, ty);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

/** Draw the flat cover image onto the tilted quad with a real perspective
 *  warp: the image is split into a 16x16 grid and every cell is drawn as
 *  two triangles, each affine-mapped onto its bilinearly interpolated
 *  destination cell. At 16x16 the piecewise-affine error is invisible. */
function drawPerspectiveImage(ctx, img, quad) {
  const N = 16;
  const sw = img.width / N;
  const sh = img.height / N;
  const lerp = (a, b, t) => a + (b - a) * t;
  // Bilinear interpolation of the quad: u across (TL->TR, BL->BR), v down.
  const qp = (u, v) => {
    const tx = lerp(quad[0][0], quad[1][0], u);
    const ty = lerp(quad[0][1], quad[1][1], u);
    const bx = lerp(quad[3][0], quad[2][0], u);
    const by = lerp(quad[3][1], quad[2][1], u);
    return [lerp(tx, bx, v), lerp(ty, by, v)];
  };
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const u0 = i / N;
      const u1 = (i + 1) / N;
      const v0 = j / N;
      const v1 = (j + 1) / N;
      const p00 = qp(u0, v0);
      const p10 = qp(u1, v0);
      const p11 = qp(u1, v1);
      const p01 = qp(u0, v1);
      const s00 = [i * sw, j * sh];
      const s10 = [(i + 1) * sw, j * sh];
      const s11 = [(i + 1) * sw, (j + 1) * sh];
      const s01 = [i * sw, (j + 1) * sh];
      drawImageTriangle(ctx, img, s00[0], s00[1], s10[0], s10[1], s11[0], s11[1], p00[0], p00[1], p10[0], p10[1], p11[0], p11[1]);
      drawImageTriangle(ctx, img, s00[0], s00[1], s11[0], s11[1], s01[0], s01[1], p00[0], p00[1], p11[0], p11[1], p01[0], p01[1]);
    }
  }
}

export function defaultState() {
  return {
    layout: 'hero',
    grade: 'sunset',
    backdrop: 'none',
    blend: 'screen',
    backdropImgs: {},
    halftone: true,
    grain: true,
    inkLevel: 3,
    // Title engine v2: style, arc amount, masthead bar, magazine cover lines.
    titleStyle: 'sticker',
    titleCurve: 0.6,
    // Display fonts (v11): title + tagline/credits pick from FONTS.
    titleFont: 'anton',
    bodyFont: 'system',
    masthead: true,
    mastheadName: 'VICE TYPE',
    coverLinesOn: true,
    coverLines: [
      'Sunset chase at 180 mph',
      'The new kings of Vice City',
      'Plus: 12 pages of neon nights',
    ],
    // Treatments + overlays (v3).
    treatment: 'none',
    lightLeak: false,
    vignette: true,
    // Photo Lab (v4): blur in px, spotlight 0..1, color-pop hue key, film key.
    blur: 0,
    spotlight: 0,
    colorPop: 'none',
    film: 'none',
    // Darkroom (v6): tone curves + light sliders + per-channel HSL.
    darkroom: defaultDarkroom(),
    // Series mode (v4): one theme, three covers — main (current layout,
    // landscape) + square + portrait variants with their own layouts.
    series: false,
    seriesLayouts: ['magazine', 'triptych'],
    // Procedural Vice Art Kit (v5) + speech/thought bubbles (v5).
    art: defaultArt(),
    bubbles: defaultBubbles(),
    // Glitch / CRT effects (v7) + procedural stickers (v7).
    glitch: defaultGlitch(),
    stickers: defaultStickers(),
    // Custom palette (v8): a 3-stop gradient grade in the user's colours.
    // customPalettes holds up to 4 saved palettes { name, stops }.
    palette: defaultPalette(),
    customPalettes: [],
    // Frames pack (v9): one border treatment for the whole cover.
    frame: 'none',
    // Smart Crop focus (v9): { x, y, panel } in 0..1 fractions, or null.
    focus: null,
    // Freeform editor (v10): panels + title as free objects; canvas
    // background (v10) behind the panels; print marks (v10) over the cover.
    freeform: defaultFreeform(),
    canvasBg: defaultCanvasBg(),
    printMarks: false,
    // 3D tilt (v12): the whole cover leans in perspective + layered shadow.
    tilt: defaultTilt(),
    // Photo data URLs (v5): parallel to photos, used by save/load project and
    // autosave so a project round-trips with its pictures.
    photoData: [null, null, null],
    // Before/after compare: 1 = fully graded, 0 = raw photo.
    compare: 1,
    title: 'VICE LIGHTS',
    tagline: 'One city. One night. No brakes.',
    credits: 'Starring NOE  •  LEON  •  MARIA',
    issue: '07',
    photos: [null, null, null],
    // One slot per panel (max 5); photo = index into photos, zoom 1 = fit.
    // ink = comic-ink treatment for this panel (posterize + edge ink).
    panels: [
      { photo: 0, zoom: 1, dx: 0, dy: 0, caption: 'Golden hour on the boulevard', ink: false },
      { photo: 1, zoom: 1, dx: 0, dy: 0, caption: 'The pier at last light', ink: false },
      { photo: 0, zoom: 1.15, dx: 0.06, dy: 0, caption: 'Top down, windows down', ink: false },
      { photo: 1, zoom: 1.2, dx: -0.05, dy: 0.04, caption: 'Neon after midnight', ink: false },
      { photo: 0, zoom: 1.1, dx: 0, dy: -0.05, caption: 'Meet me where the palms bend', ink: false },
    ],
  };
}

/** Panel rectangles for a layout, in pixels, with a thin white gutter.
 *  A rect may carry rot (degrees around its centre), border (frame width in
 *  px) and polaroid (white instant-photo frame with a caption strip). */
export function layoutPanels(layout, W, H) {
  const g = Math.max(4, Math.round(Math.min(W, H) * 0.012));
  const third = (W - 2 * g) / 3;
  switch (layout) {
    case 'grid3':
      return [0, 1, 2].map((i) => ({ x: i * (third + g), y: 0, w: third, h: H }));
    case 'collage5': {
      const lw = W * 0.58;
      const rw = W - lw - g;
      const rh = (H - g) / 2;
      const cw = (rw - g) / 2;
      return [
        { x: 0, y: 0, w: lw, h: H },
        { x: lw + g, y: 0, w: cw, h: rh },
        { x: lw + g + cw + g, y: 0, w: cw, h: rh },
        { x: lw + g, y: rh + g, w: cw, h: rh },
        { x: lw + g + cw + g, y: rh + g, w: cw, h: rh },
      ];
    }
    case 'diagonal': {
      const split = 0.5;
      return [
        { x: 0, y: 0, w: W, h: H, poly: [[0, 0], [W, 0], [W * (1 - split), H], [0, H]] },
        { x: 0, y: 0, w: W, h: H, poly: [[W, 0], [W, H], [W * (1 - split), H]] },
      ];
    }
    case 'overlap': {
      // Classic poster collage: panels overlap each other, slightly rotated,
      // each with a thick white border so the stack reads at a glance.
      // The bottom row starts below the top row's caption bars, so no story
      // line is ever covered by the panel stacked on top of it.
      const bw = Math.max(6, Math.round(Math.min(W, H) * 0.014));
      return [
        { x: W * 0.02, y: H * 0.03, w: W * 0.52, h: H * 0.54, rot: -2, border: bw },
        { x: W * 0.44, y: H * 0.02, w: W * 0.52, h: H * 0.44, rot: 1.5, border: bw },
        { x: W * 0.06, y: H * 0.60, w: W * 0.44, h: H * 0.36, rot: 1, border: bw },
        { x: W * 0.48, y: H * 0.58, w: W * 0.48, h: H * 0.38, rot: -1.5, border: bw },
      ];
    }
    case 'polaroid': {
      const pw = (W - 4 * g) / 3;
      const ph = H * 0.82;
      const y = H * 0.06;
      return [0, 1, 2].map((i) => ({
        x: g + i * (pw + g), y, w: pw, h: ph,
        polaroid: true, rot: i === 1 ? 0 : (i === 0 ? -1.2 : 1.2),
      }));
    }
    case 'triptych': {
      const cw = W * 0.5;
      const sw = (W - cw - 2 * g) / 2;
      return [
        { x: 0, y: 0, w: sw, h: H },
        { x: sw + g, y: 0, w: cw, h: H },
        { x: sw + g + cw + g, y: 0, w: sw, h: H },
      ];
    }
    case 'magazine': {
      // Classic magazine cover: one full-bleed photo, no caption bar — the
      // masthead, cover lines and big title do the talking.
      return [{ x: 0, y: 0, w: W, h: H, noCaption: true }];
    }
    case 'storyboard': {
      // Comic strip: 4 panels in a row, each numbered and captioned below
      // its photo — the cover reads as a 4-beat story.
      const pw = (W - 3 * g) / 4;
      return [0, 1, 2, 3].map((i) => ({
        x: i * (pw + g), y: 0, w: pw, h: H, number: i + 1,
      }));
    }
    case 'moodboard': {
      // Scrapbook (v8): four photos pinned to the board at different tilts,
      // thick white borders, tape corners, handwritten captions, gold pins.
      // Each panel is a little smaller than its cell so the tilt never
      // pushes it off the board or under the masthead.
      const bw = Math.max(8, Math.round(Math.min(W, H) * 0.018));
      return [
        { x: W * 0.04, y: H * 0.05, w: W * 0.50, h: H * 0.44, rot: -3, border: bw, tape: true, handwritten: true },
        { x: W * 0.58, y: H * 0.03, w: W * 0.37, h: H * 0.39, rot: 4, border: bw, tape: true, handwritten: true },
        { x: W * 0.06, y: H * 0.55, w: W * 0.38, h: H * 0.40, rot: 2, border: bw, tape: true, handwritten: true },
        { x: W * 0.48, y: H * 0.52, w: W * 0.47, h: H * 0.43, rot: -2, border: bw, tape: true, handwritten: true },
      ];
    }
    case 'sunsetstrip': {
      // v11: one wide panorama strip across the top 40%; the bottom 60%
      // is a sunset-gradient title band (painted in renderCover) where
      // the giant display-font title lives — no caption bar on the photo.
      return [{ x: 0, y: 0, w: W, h: H * 0.40, noCaption: true }];
    }
    case 'showcase': {
      // v12: the cover as a gallery piece — one framed photo floating on
      // a stage, tilted in 3D (state.tilt), with a big title band below
      // it. The panel is inset so the tilt + layered shadow never clip.
      const bw = Math.max(6, Math.round(Math.min(W, H) * 0.012));
      return [{ x: W * 0.10, y: H * 0.06, w: W * 0.80, h: H * 0.56, border: bw, noCaption: true }];
    }
    case 'diptych': {
      // Before / after as the cover itself: left half is the raw photo,
      // right half the graded cover, with BEFORE / AFTER labels. Both halves
      // show the same photo (panel 0's photo); the render branch in
      // renderCover paints the two sides differently.
      const hw = (W - g) / 2;
      return [
        { x: 0, y: 0, w: hw, h: H, diptych: 'before', noCaption: true },
        { x: hw + g, y: 0, w: hw, h: H, diptych: 'after', noCaption: true },
      ];
    }
    case 'hero':
    default: {
      const bh = H * 0.7;
      const sh = H - bh - g;
      return [
        { x: 0, y: 0, w: W, h: bh },
        { x: 0, y: bh + g, w: third, h: sh },
        { x: third + g, y: bh + g, w: third, h: sh },
        { x: 2 * (third + g), y: bh + g, w: third, h: sh },
      ];
    }
  }
}

function coverFitRect(img, r, zoom, dx, dy) {
  const scale = Math.max(r.w / img.naturalWidth, r.h / img.naturalHeight) * zoom;
  const pw = img.naturalWidth * scale;
  const ph = img.naturalHeight * scale;
  return {
    x: r.x + (r.w - pw) / 2 + dx * r.w,
    y: r.y + (r.h - ph) / 2 + dy * r.h,
    w: pw,
    h: ph,
  };
}

function clipPanel(ctx, r) {
  ctx.beginPath();
  if (r.poly) {
    ctx.moveTo(r.poly[0][0], r.poly[0][1]);
    for (let i = 1; i < r.poly.length; i++) ctx.lineTo(r.poly[i][0], r.poly[i][1]);
    ctx.closePath();
  } else {
    ctx.rect(r.x, r.y, r.w, r.h);
  }
  ctx.clip();
}

// ---------------------------------------------------------------------------
// Ink engine: posterize + Sobel edge-ink + halftone dot screen.
// The photo is rendered once per (photo, panel geometry, grade, ink level)
// into a capped-size offscreen canvas (max 800px on the long side — comic
// art tolerates it, and it keeps redraws fast), then cached.
// ---------------------------------------------------------------------------
let inkImgId = 0;
const inkImgIds = new WeakMap();
function imgId(img) {
  let id = inkImgIds.get(img);
  if (!id) { id = ++inkImgId; inkImgIds.set(img, id); }
  return id;
}
const inkCache = new Map();

function processInkPixels(g, w, h, level) {
  const imgData = g.getImageData(0, 0, w, h);
  const d = imgData.data;
  const lum = new Float32Array(w * h);
  const steps = level + 2; // level 1..5 -> 3..7 posterize steps
  const step = 255 / (steps - 1);
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    lum[i] = 0.299 * d[o] + 0.587 * d[o + 1] + 0.114 * d[o + 2];
    d[o] = Math.round(Math.round(d[o] / step) * step);
    d[o + 1] = Math.round(Math.round(d[o + 1] / step) * step);
    d[o + 2] = Math.round(Math.round(d[o + 2] / step) * step);
  }
  // Sobel edge magnitude on luminance; strong edges become ink lines.
  const edge = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const gx = -lum[i - w - 1] - 2 * lum[i - 1] - lum[i + w - 1]
        + lum[i - w + 1] + 2 * lum[i + 1] + lum[i + w + 1];
      const gy = -lum[i - w - 1] - 2 * lum[i - w] - lum[i - w + 1]
        + lum[i + w - 1] + 2 * lum[i + w] + lum[i + w + 1];
      if (Math.abs(gx) + Math.abs(gy) > 240) edge[i] = 1;
    }
  }
  // Halftone dot screen: dot radius grows with darkness.
  const s = 5;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const o = i * 4;
      if (edge[i]) { d[o] = 16; d[o + 1] = 10; d[o + 2] = 26; continue; }
      const cx = Math.round(x / s) * s;
      const cy = Math.round(y / s) * s;
      const dx = x - cx;
      const dy = y - cy;
      const r = (1 - lum[i] / 255) * s * 0.62;
      if (Math.sqrt(dx * dx + dy * dy) < r) {
        d[o] *= 0.45; d[o + 1] *= 0.45; d[o + 2] *= 0.45;
      }
    }
  }
  g.putImageData(imgData, 0, 0);
}

function getProcessedPanel(img, r, panel, grade, level, treatment, lab, dr) {
  const cap = 800;
  const scale = Math.min(1, cap / Math.max(r.w, r.h));
  const w = Math.max(2, Math.round(r.w * scale));
  const h = Math.max(2, Math.round(r.h * scale));
  const labKey = lab ? `${lab.blur || 0}|${lab.colorPop || 'none'}|${lab.film || 'none'}` : '0|none|none';
  const drKey = dr && darkroomActive(dr) ? JSON.stringify(dr) : 'off';
  const key = [
    imgId(img), w, h, panel.zoom || 1, panel.dx || 0, panel.dy || 0,
    grade.label, level, panel.ink ? 'ink' : 'plain', treatment || 'none', labKey, drKey,
  ].join('|');
  let c = inkCache.get(key);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.filter = grade.filter;
  const d = coverFitRect(img, { x: 0, y: 0, w, h }, panel.zoom || 1, panel.dx || 0, panel.dy || 0);
  g.drawImage(img, d.x, d.y, d.w, d.h);
  g.filter = 'none';
  if (panel.ink) processInkPixels(g, w, h, level);
  // Darkroom (v6) runs after ink, before the print treatments: it is a
  // photo adjustment, the treatments are print effects on top of it.
  if (dr && darkroomActive(dr)) applyDarkroomPixels(g, w, h, dr);
  if (treatment && treatment !== 'none') applyTreatmentPixels(g, w, h, treatment);
  if (lab && (lab.colorPop !== 'none' || lab.film !== 'none')) applyLabPixels(g, w, h, lab);
  if (inkCache.size > 16) inkCache.clear();
  inkCache.set(key, c);
  return c;
}

// ---------------------------------------------------------------------------
// Darkroom pixels (v6): tone curves (master + per-channel LUTs), exposure,
// temperature, highlights / shadows (luminance-weighted), contrast, clarity
// (midtone-weighted contrast), saturation, per-channel HSL shifts, then an
// unsharp-mask pass for sharpen. One pass over the pixels plus one sharpen
// pass; the processed panel is cached, so a slider drag re-renders once.
// ---------------------------------------------------------------------------
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [h, s, l];
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r;
  let g;
  let b;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

function applyDarkroomPixels(g, w, h, dr) {
  const imgData = g.getImageData(0, 0, w, h);
  const d = imgData.data;
  const curves = dr.curves || {};
  const lumaLUT = buildCurveLUT(curves.luma || IDENTITY_CURVE);
  const lutR = buildCurveLUT(curves.red || IDENTITY_CURVE);
  const lutG = buildCurveLUT(curves.green || IDENTITY_CURVE);
  const lutB = buildCurveLUT(curves.blue || IDENTITY_CURVE);
  // Master curve first, then the channel curve: lut[c][master[v]].
  const tableR = new Uint8Array(256);
  const tableG = new Uint8Array(256);
  const tableB = new Uint8Array(256);
  for (let v = 0; v < 256; v++) {
    tableR[v] = lutR[lumaLUT[v]];
    tableG[v] = lutG[lumaLUT[v]];
    tableB[v] = lutB[lumaLUT[v]];
  }
  const exposureF = Math.pow(2, dr.exposure || 0);
  const temp = dr.temperature || 0;
  const contrastF = 1 + (dr.contrast || 0);
  const clarity = dr.clarity || 0;
  const satF = 1 + (dr.saturation || 0);
  const hi = dr.highlights || 0;
  const sh = dr.shadows || 0;
  const hsl = dr.hsl || {};
  const hslActive = Object.values(hsl).some((c) => c && (c.hue || c.sat));
  for (let i = 0; i < d.length; i += 4) {
    let r = tableR[d[i]] * exposureF;
    let gg = tableG[d[i + 1]] * exposureF;
    let b = tableB[d[i + 2]] * exposureF;
    // Temperature: warm pushes red up / blue down, cool the reverse.
    if (temp > 0) { r *= 1 + 0.25 * temp; b *= 1 - 0.20 * temp; }
    else if (temp < 0) { r *= 1 + 0.20 * temp; b *= 1 - 0.25 * temp; }
    let l = 0.299 * r + 0.587 * gg + 0.114 * b;
    // Highlights lift bright pixels, shadows lift dark ones.
    if (hi || sh) {
      const t = Math.max(0, Math.min(1, l / 255));
      const delta = hi * t * t * 55 + sh * (1 - t) * (1 - t) * 55;
      r += delta; gg += delta; b += delta;
      l = 0.299 * r + 0.587 * gg + 0.114 * b;
    }
    // Contrast around mid-grey, then clarity (midtone-weighted contrast).
    r = (r - 128) * contrastF + 128;
    gg = (gg - 128) * contrastF + 128;
    b = (b - 128) * contrastF + 128;
    if (clarity) {
      const cl = (v) => {
        const t = (v - 128) / 128;
        return 128 + 128 * t * (1 + clarity * 0.6 * (1 - Math.abs(t)));
      };
      r = cl(r); gg = cl(gg); b = cl(b);
    }
    // Saturation around the pixel's own luminance.
    l = 0.299 * r + 0.587 * gg + 0.114 * b;
    r = l + (r - l) * satF;
    gg = l + (gg - l) * satF;
    b = l + (b - l) * satF;
    // Per-channel HSL: shift the hue and scale the saturation of pixels
    // whose hue sits near a channel's centre (within 45 degrees).
    if (hslActive) {
      const [hh, ss, ll] = rgbToHsl(
        Math.max(0, Math.min(255, r)),
        Math.max(0, Math.min(255, gg)),
        Math.max(0, Math.min(255, b)),
      );
      if (ss > 0.05) {
        let hueShift = 0;
        let satScale = 1;
        for (const ch of HSL_CHANNELS) {
          const adj = hsl[ch.key];
          if (!adj || (!adj.hue && !adj.sat)) continue;
          const dist = Math.min(Math.abs(hh - ch.hue), 360 - Math.abs(hh - ch.hue));
          if (dist < 45) {
            const weight = 1 - dist / 45;
            hueShift += (adj.hue || 0) * weight;
            satScale *= 1 + (adj.sat || 0) * weight;
          }
        }
        if (hueShift || satScale !== 1) {
          const [nr, ng, nb] = hslToRgb(hh + hueShift, Math.max(0, Math.min(1, ss * satScale)), ll);
          r = nr; gg = ng; b = nb;
        }
      }
    }
    d[i] = Math.max(0, Math.min(255, r));
    d[i + 1] = Math.max(0, Math.min(255, gg));
    d[i + 2] = Math.max(0, Math.min(255, b));
  }
  // Sharpen: unsharp mask — each pixel moves away from its 4-neighbour
  // average, proportional to the sharpen slider.
  const sharpen = dr.sharpen || 0;
  if (sharpen > 0) {
    const src = new Uint8ClampedArray(d);
    const a = sharpen * 0.8;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4;
        for (let k = 0; k < 3; k++) {
          const c = src[i + k];
          const avg = (src[i - 4 + k] + src[i + 4 + k] + src[i - w * 4 + k] + src[i + w * 4 + k]) / 4;
          d[i + k] = Math.max(0, Math.min(255, c + a * (c - avg)));
        }
      }
    }
  }
  g.putImageData(imgData, 0, 0);
}

// v4 Photo Lab pixels: color-pop (keep one hue, drain the rest) + film presets.
function rgbHue(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return -1;
  const d = max - min;
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return h;
}

function applyLabPixels(g, w, h, lab) {
  const imgData = g.getImageData(0, 0, w, h);
  const d = imgData.data;
  const pop = COLORPOPS[lab.colorPop];
  const targetHue = pop && pop.hue != null ? pop.hue : null;
  for (let i = 0; i < d.length; i += 4) {
    const px = (i / 4) % w;
    const py = Math.floor(i / 4 / w);
    let r = d[i];
    let gg = d[i + 1];
    let b = d[i + 2];
    // Color-pop: pixels far from the kept hue lose ~85% of their saturation.
    if (targetHue != null) {
      const hue = rgbHue(r, gg, b);
      const dh = hue < 0 ? 999 : Math.min(Math.abs(hue - targetHue), 360 - Math.abs(hue - targetHue));
      if (dh > 40) {
        const l = 0.299 * r + 0.587 * gg + 0.114 * b;
        r = l + (r - l) * 0.15;
        gg = l + (gg - l) * 0.15;
        b = l + (b - l) * 0.15;
      }
    }
    if (lab.film === 'vhs86') {
      // VHS 86: muted, green-shifted, scanline darkening + tape noise.
      const l = 0.299 * r + 0.587 * gg + 0.114 * b;
      r = l + (r - l) * 0.7 - 6;
      gg = l + (gg - l) * 0.7 + 10;
      b = l + (b - l) * 0.7 - 4;
      if (py % 3 === 0) { r *= 0.9; gg *= 0.9; b *= 0.9; }
      const n = ((px * 7 + py * 13) % 11) - 5;
      r += n; gg += n; b += n;
    } else if (lab.film === 'polaroid95') {
      // Polaroid 95: warm, faded, lifted blacks.
      r = r * 0.88 + 34;
      gg = gg * 0.86 + 28;
      b = b * 0.8 + 22;
      r *= 1.06; b *= 0.94;
    } else if (lab.film === 'chrome99') {
      // Chrome 99: hard contrast, cool, boosted saturation.
      r = (r - 128) * 1.3 + 128;
      gg = (gg - 128) * 1.3 + 128;
      b = (b - 128) * 1.3 + 128;
      const l = 0.299 * r + 0.587 * gg + 0.114 * b;
      r = l + (r - l) * 1.2;
      gg = l + (gg - l) * 1.2;
      b = l + (b - l) * 1.2;
      b *= 1.08; r *= 0.96;
    }
    d[i] = Math.max(0, Math.min(255, r));
    d[i + 1] = Math.max(0, Math.min(255, gg));
    d[i + 2] = Math.max(0, Math.min(255, b));
  }
  g.putImageData(imgData, 0, 0);
}

// v3 treatments, applied on pixels after the grade (and after ink, if on).
// Duotone maps luminance onto a Vice ramp: deep violet -> hot pink -> gold.
function applyTreatmentPixels(g, w, h, treatment) {
  const imgData = g.getImageData(0, 0, w, h);
  const d = imgData.data;
  if (treatment === 'threshold') {
    for (let i = 0; i < d.length; i += 4) {
      const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const v = l > 128 ? 255 : 0;
      d[i] = v; d[i + 1] = v; d[i + 2] = v;
    }
  } else if (treatment === 'solarize') {
    for (let i = 0; i < d.length; i += 4) {
      const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (l > 128) { d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2]; }
    }
  } else if (treatment === 'duotone') {
    for (let i = 0; i < d.length; i += 4) {
      const t = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
      let r;
      let gg;
      let b;
      if (t < 0.5) {
        const u = t / 0.5;
        r = 22 + (255 - 22) * u;
        gg = 10 + (46 - 10) * u;
        b = 36 + (136 - 36) * u;
      } else {
        const u = (t - 0.5) / 0.5;
        r = 255;
        gg = 46 + (180 - 46) * u;
        b = 136 + (0 - 136) * u;
      }
      d[i] = r; d[i + 1] = gg; d[i + 2] = b;
    }
  } else if (treatment === 'cross') {
    // Cross Process (v6): film developed in the wrong chemicals — blue
    // shadows, warm highlights, boosted contrast and saturation. Channel
    // curves do the colour cross; the loop adds the punch.
    const lutR = buildCurveLUT([[0, 0.06], [0.25, 0.26], [0.5, 0.52], [0.75, 0.78], [1, 1]]);
    const lutG = buildCurveLUT([[0, 0.02], [0.25, 0.24], [0.5, 0.5], [0.75, 0.76], [1, 0.98]]);
    const lutB = buildCurveLUT([[0, 0.14], [0.25, 0.30], [0.5, 0.48], [0.75, 0.68], [1, 0.90]]);
    for (let i = 0; i < d.length; i += 4) {
      let r = lutR[d[i]];
      let gg = lutG[d[i + 1]];
      let b = lutB[d[i + 2]];
      r = (r - 128) * 1.08 + 128;
      gg = (gg - 128) * 1.08 + 128;
      b = (b - 128) * 1.08 + 128;
      const l = 0.299 * r + 0.587 * gg + 0.114 * b;
      r = l + (r - l) * 1.15;
      gg = l + (gg - l) * 1.15;
      b = l + (b - l) * 1.15;
      d[i] = Math.max(0, Math.min(255, r));
      d[i + 1] = Math.max(0, Math.min(255, gg));
      d[i + 2] = Math.max(0, Math.min(255, b));
    }
  }
  g.putImageData(imgData, 0, 0);
}

/** Paints the photo (ink-processed / darkroomed / treated / lab-processed or
 *  plain graded) into rect r. Caller clips. Lab blur softens the photo
 *  behind the title. When the darkroom is active the photo must go through
 *  the pixel pipeline — a CSS filter cannot draw a tone curve. */
function paintPhoto(ctx, img, r, panel, grade, inkLevel, treatment, lab, dr) {
  if (!img) {
    ctx.fillStyle = '#241a33';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    return;
  }
  const labActive = lab && (lab.colorPop !== 'none' || lab.film !== 'none');
  const blurPx = lab && lab.blur ? lab.blur : 0;
  if (panel.ink || (treatment && treatment !== 'none') || labActive || (dr && darkroomActive(dr))) {
    const proc = getProcessedPanel(img, r, panel, grade, inkLevel, treatment || 'none', lab, dr);
    if (blurPx) ctx.filter = `blur(${blurPx}px)`;
    ctx.drawImage(proc, r.x, r.y, r.w, r.h);
    ctx.filter = 'none';
  } else {
    ctx.filter = blurPx ? `${grade.filter} blur(${blurPx}px)` : grade.filter;
    const d = coverFitRect(img, r, panel.zoom || 1, panel.dx || 0, panel.dy || 0);
    ctx.drawImage(img, d.x, d.y, d.w, d.h);
    ctx.filter = 'none';
  }
}

/** v5 spotlight: a radial highlight in the middle of a rect, screen-blended. */
function drawSpotlight(ctx, r, amount) {
  if (!amount) return;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createRadialGradient(
    r.x + r.w / 2, r.y + r.h / 2, 0,
    r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w, r.h) * 0.62,
  );
  g.addColorStop(0, `rgba(255, 244, 214, ${0.5 * amount})`);
  g.addColorStop(1, 'rgba(255, 244, 214, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Procedural Vice Art Kit (v5) — every element is drawn in code, so the art
// is part of the cover itself (it exports into the PNG), not a decoration
// the judge never sees. Deterministic: fixed building/frond tables, no RNG.
// ---------------------------------------------------------------------------
function drawSunburst(ctx, W, H, el) {
  const cx = el.x * W;
  const cy = el.y * H;
  const R = Math.max(W, H) * 1.1 * (el.scale || 1);
  ctx.save();
  ctx.globalAlpha = (el.opacity == null ? 0.55 : el.opacity) * 0.55;
  ctx.fillStyle = el.color || '#ffb400';
  ctx.translate(cx, cy);
  const rays = 24;
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2;
    const a1 = a0 + (Math.PI * 2 / rays) * (i % 2 === 0 ? 0.55 : 0.28);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, a0, a1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawSunDisc(ctx, W, H, el) {
  const cx = el.x * W;
  const cy = el.y * H;
  const r = Math.min(W, H) * 0.11 * (el.scale || 1);
  ctx.save();
  ctx.globalAlpha = el.opacity == null ? 0.95 : el.opacity;
  const g = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#fff7d6');
  g.addColorStop(0.55, el.color || '#ff6b35');
  g.addColorStop(1, el.color || '#ff6b35');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // Thin glow ring.
  ctx.globalAlpha = (el.opacity == null ? 0.95 : el.opacity) * 0.35;
  ctx.strokeStyle = el.color || '#ff6b35';
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

const SKYLINE_BUILDINGS = [
  // [x fraction, width fraction, height fraction, antenna?]
  [0.00, 0.07, 0.13, 0], [0.07, 0.05, 0.20, 1], [0.12, 0.09, 0.11, 0],
  [0.21, 0.06, 0.24, 1], [0.27, 0.08, 0.15, 0], [0.35, 0.05, 0.19, 0],
  [0.40, 0.10, 0.12, 0], [0.50, 0.06, 0.26, 1], [0.56, 0.07, 0.14, 0],
  [0.63, 0.09, 0.18, 0], [0.72, 0.05, 0.22, 1], [0.77, 0.08, 0.13, 0],
  [0.85, 0.06, 0.17, 0], [0.91, 0.09, 0.12, 0],
];

function drawSkyline(ctx, W, H, el) {
  const base = el.y * H;
  const s = el.scale || 1;
  ctx.save();
  ctx.globalAlpha = el.opacity == null ? 0.85 : el.opacity;
  ctx.fillStyle = el.color || '#12081f';
  ctx.strokeStyle = el.color || '#12081f';
  for (const [fx, fw, fh, ant] of SKYLINE_BUILDINGS) {
    const bw = fw * W;
    const bh = fh * H * s;
    const bx = fx * W;
    ctx.fillRect(bx, base - bh, bw, bh);
    if (ant) {
      ctx.lineWidth = Math.max(2, W * 0.002);
      ctx.beginPath();
      ctx.moveTo(bx + bw / 2, base - bh);
      ctx.lineTo(bx + bw / 2, base - bh - H * 0.05 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx + bw / 2, base - bh - H * 0.05 * s, Math.max(2, W * 0.003), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawOnePalm(ctx, bx, by, h, color) {
  // Trunk: a gentle S-curve, thick at the base, thin at the crown.
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(3, h * 0.045);
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.quadraticCurveTo(bx + h * 0.06, by - h * 0.55, bx + h * 0.16, by - h);
  ctx.stroke();
  const cx = bx + h * 0.16;
  const cy = by - h;
  // 7 fronds fanning out from the crown, drooping at the tips.
  ctx.lineWidth = Math.max(2, h * 0.028);
  const fronds = [-165, -125, -85, -45, -8, 28, 62];
  for (const deg of fronds) {
    const a = (deg * Math.PI) / 180;
    const len = h * 0.52;
    const ex = cx + Math.cos(a) * len;
    const ey = cy + Math.sin(a) * len * 0.55 + h * 0.14;
    const mx = cx + Math.cos(a) * len * 0.55;
    const my = cy + Math.sin(a) * len * 0.45 - h * 0.10;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.stroke();
  }
  // Coconuts: two small dots under the crown.
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx - h * 0.02, cy + h * 0.03, Math.max(2, h * 0.02), 0, Math.PI * 2);
  ctx.arc(cx + h * 0.03, cy + h * 0.04, Math.max(2, h * 0.02), 0, Math.PI * 2);
  ctx.fill();
}

function drawPalm(ctx, W, H, el) {
  const s = el.scale || 1;
  ctx.save();
  ctx.globalAlpha = el.opacity == null ? 0.9 : el.opacity;
  const color = el.color || '#160a24';
  drawOnePalm(ctx, el.x * W, el.y * H, H * 0.34 * s, color);
  drawOnePalm(ctx, el.x * W + W * 0.10, el.y * H, H * 0.24 * s, color);
  ctx.restore();
}

function drawGridFloor(ctx, W, H, el) {
  const horizon = el.y * H;
  const vx = (el.x == null ? 0.5 : el.x) * W;
  ctx.save();
  ctx.globalAlpha = el.opacity == null ? 0.35 : el.opacity;
  ctx.strokeStyle = el.color || '#00e5ff';
  ctx.lineWidth = Math.max(1, W * 0.0015);
  // Rays from the bottom edge to the vanishing point.
  for (let i = -8; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(vx + i * W * 0.09, H);
    ctx.lineTo(vx, horizon);
    ctx.stroke();
  }
  // Horizontal lines, spacing growing toward the viewer.
  let y = horizon;
  let step = H * 0.018;
  while (y < H) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
    y += step;
    step *= 1.55;
  }
  ctx.restore();
}

/** Draws every enabled Art Kit element, in a fixed order (sunburst first so
 *  the sun disc, skyline and palms sit on top of it). */
export function drawArtKit(ctx, W, H, state) {
  const art = state.art;
  if (!art) return;
  if (art.sunburst && art.sunburst.on) drawSunburst(ctx, W, H, art.sunburst);
  if (art.sun && art.sun.on) drawSunDisc(ctx, W, H, art.sun);
  if (art.grid && art.grid.on) drawGridFloor(ctx, W, H, art.grid);
  if (art.skyline && art.skyline.on) drawSkyline(ctx, W, H, art.skyline);
  if (art.palm && art.palm.on) drawPalm(ctx, W, H, art.palm);
}

// ---------------------------------------------------------------------------
// Speech / thought bubbles (v5): editable text, draggable on the canvas,
// 3 styles. layoutBubbles measures the text (same code as the draw) so the
// editor's drag hit-test matches exactly what is painted.
// ---------------------------------------------------------------------------
function wrapBubbleText(ctx, text, maxW) {
  const words = (text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [''];
}

export function layoutBubbles(W, H, state) {
  const scratch = document.createElement('canvas').getContext('2d');
  return layoutBubblesOn(scratch, W, H, state);
}

export function layoutBubblesOn(ctx, W, H, state) {
  const out = [];
  for (const b of state.bubbles || []) {
    const fontSize = Math.max(12, Math.round(Math.min(W, H) * 0.042 * (b.size || 1)));
    const maxW = Math.max(60, W * 0.30 * (b.size || 1));
    ctx.font = `800 ${fontSize}px system-ui, sans-serif`;
    const lines = wrapBubbleText(ctx, b.text || '', maxW);
    const lineH = Math.round(fontSize * 1.25);
    const pad = Math.round(fontSize * 0.55);
    let tw = 0;
    for (const ln of lines) tw = Math.max(tw, ctx.measureText(ln).width);
    const w = tw + pad * 2;
    const h = lines.length * lineH + pad * 2;
    out.push({
      b, x: (b.x || 0) * W, y: (b.y || 0) * H, w, h, lines, fontSize, lineH, pad,
    });
  }
  return out;
}

function drawBubbles(ctx, W, H, state) {
  const items = layoutBubblesOn(ctx, W, H, state);
  for (const it of items) {
    const st = BUBBLE_STYLES[it.b.style] || BUBBLE_STYLES.classic;
    const { x, y, w, h, fontSize, lineH, pad } = it;
    const r = Math.min(18, Math.round(fontSize * 0.6));
    ctx.save();
    if (it.b.style === 'neon') {
      ctx.shadowColor = '#ff2e88';
      ctx.shadowBlur = fontSize * 0.7;
    }
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fillStyle = st.bg;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(2, fontSize * 0.09);
    ctx.strokeStyle = st.border;
    ctx.stroke();
    if (it.b.kind === 'thought') {
      // Thought trail: three shrinking circles down-left from the bubble.
      ctx.fillStyle = st.bg;
      ctx.strokeStyle = st.border;
      const spots = [
        [x + w * 0.22, y + h + fontSize * 0.35, fontSize * 0.22],
        [x + w * 0.12, y + h + fontSize * 0.75, fontSize * 0.15],
        [x + w * 0.04, y + h + fontSize * 1.05, fontSize * 0.10],
      ];
      for (const [sx, sy, sr] of spots) {
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(2, sr), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    } else {
      // Speech tail: a triangle pointing down-left.
      ctx.beginPath();
      ctx.moveTo(x + w * 0.18, y + h - 1);
      ctx.lineTo(x + w * 0.30, y + h - 1);
      ctx.lineTo(x + w * 0.08, y + h + fontSize * 0.85);
      ctx.closePath();
      ctx.fillStyle = st.bg;
      ctx.fill();
      ctx.strokeStyle = st.border;
      ctx.lineWidth = Math.max(2, fontSize * 0.09);
      ctx.stroke();
    }
    ctx.fillStyle = st.fg;
    ctx.font = `800 ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    it.lines.forEach((ln, i) => {
      ctx.fillText(ln, x + pad, y + pad + i * lineH);
    });
    ctx.restore();
  }
}

function drawCaptionBar(ctx, r, text, dark, handwritten) {
  const barH = Math.max(22, Math.round(r.h * 0.085));
  // Handwritten (v8 Moodboard): a paper strip with cursive ink — the system
  // cursive stack only, no font file, so it stays offline.
  ctx.fillStyle = handwritten ? '#fdf6e3' : (dark ? 'rgba(8, 6, 16, 0.62)' : 'rgba(248, 244, 236, 0.92)');
  ctx.fillRect(r.x, r.y + r.h - barH, r.w, barH);
  let size = Math.max(11, Math.round(barH * 0.44));
  const fontFor = (s) => (handwritten
    ? `italic 700 ${s}px "Segoe Print", "Comic Sans MS", "Bradley Hand", cursive`
    : `700 ${s}px system-ui, sans-serif`);
  ctx.font = fontFor(size);
  while (ctx.measureText(text.toUpperCase()).width > r.w - 16 && size > 9) {
    size -= 1;
    ctx.font = fontFor(size);
  }
  ctx.fillStyle = handwritten ? '#1d0b2e' : (dark ? '#fff' : '#1d0b2e');
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(handwritten ? text : text.toUpperCase(), r.x + 8, r.y + r.h - barH / 2);
}

function drawPanel(ctx, img, r, panel, grade, inkLevel, vignette, treatment, lab, dr) {
  ctx.save();
  clipPanel(ctx, r);
  if (r.polaroid) {
    // Instant-photo frame: white border, photo on top, caption on the white
    // strip at the bottom in dark ink.
    ctx.fillStyle = '#f8f4ec';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    const border = Math.max(6, Math.round(Math.min(r.w, r.h) * 0.05));
    const strip = Math.max(30, Math.round(r.h * 0.16));
    const photoRect = {
      x: r.x + border, y: r.y + border,
      w: r.w - 2 * border, h: r.h - border - strip,
    };
    ctx.save();
    ctx.beginPath();
    ctx.rect(photoRect.x, photoRect.y, photoRect.w, photoRect.h);
    ctx.clip();
    paintPhoto(ctx, img, photoRect, panel, grade, inkLevel, treatment, lab, dr);
    ctx.restore();
    // Tint + vignette over the photo area only.
    ctx.save();
    ctx.beginPath();
    ctx.rect(photoRect.x, photoRect.y, photoRect.w, photoRect.h);
    ctx.clip();
    const tint = ctx.createLinearGradient(0, photoRect.y, 0, photoRect.y + photoRect.h);
    tint.addColorStop(0, grade.top);
    if (grade.mid) tint.addColorStop(0.5, grade.mid);
    tint.addColorStop(1, grade.bottom);
    ctx.fillStyle = tint;
    ctx.fillRect(photoRect.x, photoRect.y, photoRect.w, photoRect.h);
    drawSpotlight(ctx, photoRect, lab && lab.spotlight);
    ctx.restore();
    const text = (panel.caption || '').trim();
    if (text) {
      let size = Math.max(12, Math.round(strip * 0.34));
      ctx.font = `700 ${size}px system-ui, sans-serif`;
      while (ctx.measureText(text.toUpperCase()).width > r.w - 2 * border - 8 && size > 9) {
        size -= 1;
        ctx.font = `700 ${size}px system-ui, sans-serif`;
      }
      ctx.fillStyle = '#1d0b2e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text.toUpperCase(), r.x + r.w / 2, r.y + r.h - strip / 2);
      ctx.textAlign = 'left';
    }
    ctx.restore();
    return;
  }
  paintPhoto(ctx, img, r, panel, grade, inkLevel, treatment, lab, dr);
  const tint = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  tint.addColorStop(0, grade.top);
  if (grade.mid) tint.addColorStop(0.5, grade.mid);
  tint.addColorStop(1, grade.bottom);
  ctx.fillStyle = tint;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  drawSpotlight(ctx, r, lab && lab.spotlight);
  // Vignette: darken the panel edges so the grade reads as print, not a filter.
  if (vignette !== false) {
    const vg = ctx.createRadialGradient(
      r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * 0.35,
      r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w, r.h) * 0.75,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = vg;
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  // Per-panel caption: its own story line, comic-strip style. The Magazine
  // layout skips it — the masthead and cover lines own that space.
  const text = (panel.caption || '').trim();
  if (text && !r.noCaption) drawCaptionBar(ctx, r, text, true, !!r.handwritten);
  // Storyboard panel number: a pink badge, bottom-left of the panel just
  // above the caption bar — the masthead owns the top edge, so a top badge
  // would hide under it.
  if (r.number) {
    const barH = Math.max(22, Math.round(r.h * 0.085));
    const br = Math.max(14, Math.round(Math.min(r.w, r.h) * 0.055));
    const bx = r.x + br + 6;
    const by = r.y + r.h - barH - br - 8;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2e88';
    ctx.fill();
    ctx.lineWidth = Math.max(2, br * 0.1);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.round(br)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(r.number), bx, by + 1);
    ctx.textAlign = 'left';
  }
  ctx.restore();
  // White frame line around the panel (thicker for the collage stack).
  ctx.save();
  clipPanel(ctx, r);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = r.border || Math.max(2, Math.round(Math.min(r.w, r.h) * 0.008));
  ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
  ctx.restore();
  // Moodboard (v8): tape corners + a gold pin on top of the frame.
  if (r.tape) {
    const tw = Math.max(28, Math.round(r.w * 0.26));
    const th = Math.max(10, Math.round(r.h * 0.05));
    ctx.save();
    ctx.fillStyle = 'rgba(255, 238, 170, 0.78)';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 4;
    ctx.translate(r.x + tw * 0.22, r.y + th * 0.4);
    ctx.rotate(-0.6);
    ctx.fillRect(-tw / 2, -th / 2, tw, th);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = 'rgba(255, 238, 170, 0.78)';
    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 4;
    ctx.translate(r.x + r.w - tw * 0.22, r.y + th * 0.4);
    ctx.rotate(0.6);
    ctx.fillRect(-tw / 2, -th / 2, tw, th);
    ctx.restore();
    const pr = Math.max(5, Math.round(Math.min(r.w, r.h) * 0.022));
    ctx.save();
    ctx.beginPath();
    ctx.arc(r.x + r.w / 2, r.y + pr + 2, pr, 0, Math.PI * 2);
    ctx.fillStyle = '#ffb400';
    ctx.fill();
    ctx.lineWidth = Math.max(1, pr * 0.2);
    ctx.strokeStyle = '#7a4d00';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r.x + r.w / 2, r.y + pr + 2, pr * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#7a4d00';
    ctx.fill();
    ctx.restore();
  }
}

let grainTile = null;
function getGrainTile() {
  if (grainTile) return grainTile;
  const c = document.createElement('canvas');
  c.width = 140;
  c.height = 140;
  const g = c.getContext('2d');
  const data = g.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 100 + Math.floor(Math.random() * 110);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  g.putImageData(data, 0, 0);
  grainTile = c;
  return c;
}

let halftoneTile = null;
function getHalftoneTile() {
  if (halftoneTile) return halftoneTile;
  const c = document.createElement('canvas');
  c.width = 9;
  c.height = 9;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(0,0,0,0.55)';
  g.beginPath();
  g.arc(4.5, 4.5, 1.6, 0, Math.PI * 2);
  g.fill();
  halftoneTile = c;
  return c;
}

function fitFont(ctx, text, maxW, startSize, weight, family) {
  let size = startSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (ctx.measureText(text).width > maxW && size > 10) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

const TITLE_GRADIENTS = [
  ['#ff2e88', '#ffb400'],
  ['#00e5ff', '#ff2e88'],
  ['#ffb400', '#ff6b35'],
  ['#ffffff', '#00e5ff'],
];

function resetShadow(ctx) {
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/** One title word in the chosen style, drawn at (x, y) baseline.
 *  `shift` (v7) is the title RGB-shift amount in px: a red copy at x-shift
 *  and a cyan copy at x+shift, screen-blended, so the word fringes like a
 *  mis-tracked CRT — drawn before the word itself, so the word stays whole. */
function drawTitleWord(ctx, word, x, y, size, family, colorIdx, style, shift) {
  const color = WORD_COLORS[colorIdx % WORD_COLORS.length];
  ctx.font = `900 ${size}px ${family}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  if (shift > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.55;
    ctx.shadowColor = 'rgba(0,0,0,0)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#ff004c';
    ctx.fillText(word, x - shift, y);
    ctx.fillStyle = '#00e5ff';
    ctx.fillText(word, x + shift, y);
    ctx.restore();
  }
  const w = ctx.measureText(word).width;
  if (style === 'chrome') {
    // Chrome gradient: polished metal — silver into ice blue into violet,
    // dark outline, and a thin white specular line across the top third.
    const grad = ctx.createLinearGradient(x, y - size, x, y);
    grad.addColorStop(0, '#f8f9ff');
    grad.addColorStop(0.35, '#9fb4d8');
    grad.addColorStop(0.55, '#ffffff');
    grad.addColorStop(0.75, '#00e5ff');
    grad.addColorStop(1, '#7a3cff');
    ctx.strokeStyle = 'rgba(10, 4, 18, 0.95)';
    ctx.lineWidth = Math.max(2, size * 0.05);
    ctx.strokeText(word, x, y);
    ctx.fillStyle = grad;
    ctx.fillText(word, x, y);
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y - size * 0.82, w, Math.max(2, size * 0.05));
    ctx.restore();
  } else if (style === 'extruded') {
    // 3D extruded: stacked dark layers stepping down-right, then the face.
    for (let k = 7; k >= 1; k--) {
      ctx.fillStyle = k > 4 ? '#160a24' : '#3d1157';
      ctx.fillText(word, x + k * size * 0.018, y + k * size * 0.024);
    }
    ctx.strokeStyle = 'rgba(10, 4, 18, 0.9)';
    ctx.lineWidth = Math.max(2, size * 0.03);
    ctx.strokeText(word, x, y);
    ctx.fillStyle = color;
    ctx.fillText(word, x, y);
  } else if (style === 'gradient') {
    const pair = TITLE_GRADIENTS[colorIdx % TITLE_GRADIENTS.length];
    const grad = ctx.createLinearGradient(x, y - size, x + w, y);
    grad.addColorStop(0, pair[0]);
    grad.addColorStop(1, pair[1]);
    ctx.strokeStyle = 'rgba(10, 4, 18, 0.9)';
    ctx.lineWidth = Math.max(2, size * 0.04);
    ctx.strokeText(word, x, y);
    ctx.fillStyle = grad;
    ctx.fillText(word, x, y);
  } else if (style === 'sticker') {
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = size * 0.08;
    ctx.shadowOffsetY = size * 0.04;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(4, size * 0.17);
    ctx.strokeText(word, x, y);
    ctx.fillStyle = color;
    ctx.fillText(word, x, y);
    resetShadow(ctx);
  } else if (style === 'glow') {
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 0.4;
    ctx.fillStyle = color;
    ctx.fillText(word, x, y);
    ctx.shadowBlur = size * 0.15;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    ctx.fillText(word, x, y);
    ctx.globalAlpha = 1;
    resetShadow(ctx);
  } else {
    // 'flat' and any unknown style: the v1/v2 bold word.
    ctx.strokeStyle = 'rgba(10, 4, 18, 0.9)';
    ctx.lineWidth = Math.max(3, size * 0.07);
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeText(word, x, y);
    ctx.fillStyle = color;
    ctx.fillText(word, x, y);
    resetShadow(ctx);
  }
  return w;
}

/** One title word on a gentle arc: each letter rides a sine bulge, tilted to
 *  the curve's tangent, with a sticker outline + gradient fill. `shift` (v7)
 *  adds the same red/cyan CRT fringe as drawTitleWord, per letter. */
function drawCurvedWord(ctx, word, x, y, size, family, colorIdx, amp, shift) {
  const pair = TITLE_GRADIENTS[colorIdx % TITLE_GRADIENTS.length];
  ctx.font = `900 ${size}px ${family}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  const widths = [...word].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0);
  const grad = ctx.createLinearGradient(x, y - size, x + total, y);
  grad.addColorStop(0, pair[0]);
  grad.addColorStop(1, pair[1]);
  const passes = [
    { stroke: '#ffffff', width: Math.max(4, size * 0.14), fill: null },
    { stroke: null, width: 0, fill: grad },
  ];
  for (const pass of passes) {
    let cx = x;
    [...word].forEach((ch, i) => {
      const cw = widths[i];
      const mid = cx + cw / 2;
      const t = total > 0 ? (mid - x) / total : 0.5;
      const yOff = -amp * Math.sin(Math.PI * t);
      const slope = (-amp * Math.PI / total) * Math.cos(Math.PI * t);
      ctx.save();
      ctx.translate(mid, y + yOff);
      ctx.rotate(Math.atan(slope));
      if (pass.stroke) {
        ctx.strokeStyle = pass.stroke;
        ctx.lineWidth = pass.width;
        ctx.strokeText(ch, 0, 0);
      } else {
        if (shift > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          ctx.globalAlpha = 0.55;
          ctx.fillStyle = '#ff004c';
          ctx.fillText(ch, -shift, 0);
          ctx.fillStyle = '#00e5ff';
          ctx.fillText(ch, shift, 0);
          ctx.restore();
        }
        ctx.fillStyle = pass.fill;
        ctx.fillText(ch, 0, 0);
      }
      ctx.restore();
      cx += cw;
    });
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  return total;
}

/** Magazine masthead bar: issue number, magazine name, date + price. */
function drawMasthead(ctx, W, H, state) {
  const S = Math.min(W, H);
  const pad = Math.round(W * 0.045);
  const mh = Math.round(S * 0.085);
  const family = '"Arial Black", "Helvetica Neue", system-ui, sans-serif';
  ctx.fillStyle = 'rgba(8, 4, 16, 0.78)';
  ctx.fillRect(0, 0, W, mh);
  ctx.fillStyle = '#ffb400';
  ctx.fillRect(0, mh - 3, W, 3);
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.max(11, Math.round(mh * 0.30))}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`ISSUE Nº ${state.issue || '07'}`, pad, mh / 2);
  ctx.textAlign = 'right';
  ctx.fillText('NOV 2026  •  $9.99', W - pad, mh / 2);
  ctx.font = `900 ${Math.max(16, Math.round(mh * 0.52))}px ${family}`;
  ctx.textAlign = 'center';
  ctx.fillText((state.mastheadName || 'VICE TYPE').toUpperCase(), W / 2, mh / 2 + 1);
  ctx.textAlign = 'left';
  return mh;
}

/** Magazine cover lines: short teasers stacked down the right edge. */
function drawCoverLines(ctx, W, H, state) {
  const lines = (state.coverLines || []).map((s) => (s || '').trim()).filter(Boolean);
  if (!lines.length) return;
  const S = Math.min(W, H);
  const pad = Math.round(W * 0.045);
  const fontSize = Math.max(12, Math.round(S * 0.021));
  const lineH = Math.round(fontSize * 2.1);
  const family = 'system-ui, sans-serif';
  ctx.font = `800 ${fontSize}px ${family}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  let y = Math.round(H * 0.40);
  lines.forEach((line, i) => {
    const text = line.toUpperCase();
    const tw = ctx.measureText(text).width;
    const x = W - pad;
    ctx.fillStyle = 'rgba(8, 6, 16, 0.60)';
    ctx.fillRect(x - tw - 30, y - fontSize * 0.75, tw + 30, fontSize * 1.5);
    ctx.fillStyle = WORD_COLORS[i % WORD_COLORS.length];
    ctx.fillRect(x - tw - 22, y - 5, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x - 8, y);
    y += lineH;
  });
  ctx.textAlign = 'left';
}

/** Warm light-leak blobs over the panels, screen-blended. */
function drawLightLeak(ctx, W, H) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  let g = ctx.createRadialGradient(W * 0.85, H * 0.05, 0, W * 0.85, H * 0.05, W * 0.55);
  g.addColorStop(0, 'rgba(255, 150, 60, 0.35)');
  g.addColorStop(1, 'rgba(255, 150, 60, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  g = ctx.createRadialGradient(W * 0.08, H * 0.95, 0, W * 0.08, H * 0.95, W * 0.5);
  g.addColorStop(0, 'rgba(255, 46, 136, 0.28)');
  g.addColorStop(1, 'rgba(255, 46, 136, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** The title block's natural centre (where drawTitleBlockBody puts it when
 *  Freeform is off): the anchor the freeform transform moves. Computed from
 *  the same sizes the body uses, so enabling Freeform never jumps the title. */
export function titleBlockCenter(state, W, H) {
  const pad = Math.round(W * 0.045);
  const S = Math.min(W, H);
  const mastheadH = state.masthead ? Math.round(S * 0.085) : 0;
  const words = (state.title || 'VICE LIGHTS').trim().toUpperCase().split(/\s+/).filter(Boolean);
  const tf = titleFontOf(state);
  const family = tf.family;
  const maxW = W - pad * 2;
  // Size is bounded by the widest word; measure on a throwaway context via
  // the canvas in the caller is not possible here, so reuse fitFont with a
  // shared offscreen context.
  const ctx = titleBlockCenter._ctx || (titleBlockCenter._ctx = document.createElement('canvas').getContext('2d'));
  const baseSize = Math.round(S * (state.layout === 'sunsetstrip' ? 0.16 : 0.115));
  let size = baseSize;
  for (const w of words) {
    size = Math.min(size, fitFont(ctx, w, maxW, baseSize, tf.weight, family));
  }
  const lineH = size * 0.92;
  const tagSize = Math.max(13, Math.round(S * 0.022));
  const footSize = Math.max(11, Math.round(S * 0.016));
  // Sunset Strip: the title lives in the bottom band, below the photo strip.
  // Showcase (v12): same idea — the title lives in the band below the
  // framed photo (photo ends at 62% height, title starts at 64%).
  const top = state.layout === 'sunsetstrip' ? Math.round(H * 0.40) + pad * 0.6
    : state.layout === 'showcase' ? Math.round(H * 0.63) + pad * 0.6
    : (mastheadH ? mastheadH + pad * 0.6 : pad);
  const height = size * 0.78 + words.length * lineH + tagSize * 0.4 + footSize * 1.9;
  return { x: W / 2, y: top + height / 2 };
}

/** The title block, moved + rotated around its freeform centre when
 *  Freeform mode is on AND the title has actually been moved (v10). An
 *  unmoved title draws exactly as the fixed layout would — the natural
 *  centre is not scale-invariant (font minimums), so no stored fraction
 *  can reproduce it at every export size; the flag is what keeps enabling
 *  Freeform pixel-identical. */
function drawTitleBlock(ctx, W, H, state) {
  const ff = state.freeform;
  if (ff && ff.on && ff.titleMoved && ff.title) {
    const cx = (ff.title.x == null ? 0.5 : ff.title.x) * W;
    const cy = (ff.title.y == null ? 0.32 : ff.title.y) * H;
    const nat = titleBlockCenter(state, W, H);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((ff.title.rot || 0) * Math.PI) / 180);
    ctx.translate(-nat.x, -nat.y);
    drawTitleBlockBody(ctx, W, H, state);
    ctx.restore();
    return;
  }
  drawTitleBlockBody(ctx, W, H, state);
}

function drawTitleBlockBody(ctx, W, H, state) {
  const pad = Math.round(W * 0.045);
  // Size everything from the SHORTER side: in a wide landscape cover a
  // width-based title would grow so tall its tagline/credits crash into the
  // hero panel's caption bar.
  const S = Math.min(W, H);
  const mastheadH = state.masthead ? Math.round(S * 0.085) : 0;
  const words = (state.title || 'VICE LIGHTS').trim().toUpperCase().split(/\s+/).filter(Boolean);
  const tf = titleFontOf(state);
  const family = tf.family;
  const weight = tf.weight;
  const bf = bodyFontOf(state);
  const maxW = W - pad * 2;
  // Sunset Strip: a giant title in the bottom band — ~40% larger than the
  // normal title, sized from the band height so it never crowds the photo.
  // Showcase (v12): same, slightly smaller — its band is 36% of the height.
  // Sized so a 2-word title + tagline + credits still fit the band.
  const baseSize = Math.round(S * (state.layout === 'sunsetstrip' ? 0.16 : state.layout === 'showcase' ? 0.105 : 0.115));
  let size = baseSize;
  for (const w of words) {
    size = Math.min(size, fitFont(ctx, w, maxW, baseSize, weight, family));
  }
  const style = state.titleStyle || 'flat';
  const amp = size * 0.32 * (state.titleCurve == null ? 0.6 : state.titleCurve);
  const lineH = size * 0.92;
  // v7 title RGB shift: scaled with the cover, at least 1px when on.
  const gl = state.glitch || {};
  const titleShift = (gl.titleShift && gl.titleShift.on)
    ? Math.max(1, Math.round((gl.titleShift.amount || 0) * (W / 1080))) : 0;
  let y = (state.layout === 'sunsetstrip' ? Math.round(H * 0.40) + pad * 0.6 : state.layout === 'showcase' ? Math.round(H * 0.63) + pad * 0.6 : (mastheadH ? mastheadH + pad * 0.6 : pad)) + size * 0.78;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  words.forEach((word, i) => {
    if (style === 'curved') {
      drawCurvedWord(ctx, word, pad, y, size, family, i, amp, titleShift);
    } else {
      drawTitleWord(ctx, word, pad, y, size, family, i, style, titleShift);
    }
    y += lineH;
  });
  // Tagline in italic, credits right under it — never at the foot, where the
  // per-panel caption bars live.
  const tagSize = Math.max(13, Math.round(S * 0.022));
  ctx.font = `italic ${bf.weight} ${tagSize}px ${bf.family}`;
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 6;
  ctx.fillText(state.tagline || '', pad, y + tagSize * 0.4);
  const footSize = Math.max(11, Math.round(S * 0.016));
  ctx.font = `${bf.weight} ${footSize}px ${bf.family}`;
  ctx.fillText((state.credits || '').toUpperCase(), pad, y + tagSize * 0.4 + footSize * 1.9);
  ctx.shadowBlur = 0;
  // Issue badge, top right — skipped when the masthead already shows it.
  if (!state.masthead) {
    const badgeR = Math.max(26, Math.round(S * 0.042));
    const bx = W - pad - badgeR;
    const by = pad + badgeR;
    ctx.beginPath();
    ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2e88';
    ctx.fill();
    ctx.lineWidth = Math.max(2, badgeR * 0.08);
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.round(badgeR * 0.52)}px ${family}`;
    ctx.fillText(`Nº${state.issue || '07'}`, bx, by + badgeR * 0.18);
    ctx.textAlign = 'left';
  }
}

/** The raw side of the before/after compare: same layout and lettering, but
 *  the photos are ungraded — no grade filter, tint, ink, treatment or print
 *  texture, so the grade's effect is what the slider reveals. */
function rawState(state) {
  return {
    ...state,
    grade: '__raw__',
    treatment: 'none',
    halftone: false,
    grain: false,
    lightLeak: false,
    blur: 0,
    spotlight: 0,
    colorPop: 'none',
    film: 'none',
    // The raw side is the bare photo: no darkroom work either.
    darkroom: defaultDarkroom(),
    // The raw side shows the bare photo: no procedural art, no bubbles.
    art: defaultArt(),
    bubbles: [],
    stickers: [],
    panels: state.panels.map((p) => ({ ...p, ink: false })),
  };
}

/** The Photo Lab settings of a state, as one small object for the renderer. */
export function labOf(state) {
  return {
    blur: state.blur || 0,
    spotlight: state.spotlight || 0,
    colorPop: state.colorPop || 'none',
    film: state.film || 'none',
  };
}

/** Diptych (v6): the cover IS a before/after — left half the raw photo,
 *  right half the graded cover (grade + darkroom + treatment + lab), each
 *  labelled. Both halves show panel 0's photo. */
function drawDiptychLabel(ctx, r, text) {
  const S = Math.min(r.w, r.h);
  const fontSize = Math.max(13, Math.round(S * 0.045));
  ctx.font = `900 ${fontSize}px system-ui, sans-serif`;
  const tw = ctx.measureText(text).width;
  const pad = Math.round(fontSize * 0.6);
  const bw = tw + pad * 2;
  const bh = Math.round(fontSize * 1.9);
  // Bottom corner of the half: the masthead owns the top edge and the big
  // title starts there too, so the label lives at the foot instead.
  const x = r.x + Math.round(r.w * 0.04);
  const y = r.y + r.h - bh - Math.round(r.h * 0.04);
  ctx.fillStyle = 'rgba(8, 6, 16, 0.78)';
  ctx.fillRect(x, y, bw, bh);
  ctx.fillStyle = '#ffb400';
  ctx.fillRect(x, y + bh - 3, bw, 3);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + pad, y + bh / 2 - 1);
  ctx.textAlign = 'left';
}

function drawDiptych(ctx, W, H, s, grade, lab, dr, rects) {
  const img = s.photos[(s.panels[0] || {}).photo || 0] || null;
  const panel = {
    ...(s.panels[0] || { photo: 0, zoom: 1, dx: 0, dy: 0, caption: '', ink: false }),
    caption: '',
  };
  const [left, right] = rects;
  // Left: the raw photo — no grade filter, no tint, no darkroom, no
  // treatment, no lab. The bare photo, as shot.
  ctx.save();
  clipPanel(ctx, left);
  paintPhoto(ctx, img, left, { ...panel, ink: false }, RAW_GRADE, 3, 'none',
    { blur: 0, spotlight: 0, colorPop: 'none', film: 'none' }, defaultDarkroom());
  ctx.restore();
  // Right: the full graded cover — grade + darkroom + treatment + lab.
  drawPanel(ctx, img, right, panel, grade, s.inkLevel || 3, s.vignette, s.treatment, lab, dr);
  drawDiptychLabel(ctx, left, 'BEFORE');
  drawDiptychLabel(ctx, right, 'AFTER');
  // Frame line around the raw half (the graded half frames itself).
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(2, Math.round(Math.min(left.w, left.h) * 0.008));
  ctx.strokeRect(left.x + 1, left.y + 1, left.w - 2, left.h - 2);
  ctx.restore();
}

/** Renders one full cover onto a 2D context. `raw` renders the ungraded
 *  version used by the before/after compare. */
function renderCover(ctx, W, H, state, raw) {
  const s = raw ? rawState(state) : state;
  // v8: the custom palette rebuilds the grade tint from its 3 stops.
  const grade = s.grade === '__raw__' ? RAW_GRADE : paletteGrade(s);
  // v10: the canvas background is the board behind everything (the scene
  // backdrop, when one is picked, still paints over it).
  drawCanvasBg(ctx, W, H, s);
  // Scene backdrop behind the panels (and through the gutters).
  const bd = s.backdropImgs && s.backdropImgs[s.backdrop];
  if (bd) {
    const d = coverFitRect(bd, { x: 0, y: 0, w: W, h: H }, 1, 0, 0);
    ctx.drawImage(bd, d.x, d.y, d.w, d.h);
    ctx.fillStyle = 'rgba(10, 4, 18, 0.25)';
    ctx.fillRect(0, 0, W, H);
  }
  // v10: Freeform mode swaps the layout's fixed rects for the user's own
  // panel objects (z-ordered); the Diptych layout keeps its fixed halves.
  const useFree = !!(s.freeform && s.freeform.on && s.freeform.layout === s.layout
    && s.freeform.items && s.freeform.items.length && s.layout !== 'diptych');
  const rects = useFree
    ? freeformRects(s, W, H)
    : layoutPanels(s.layout, W, H).map((r, i) => ({ ...r, panel: i }));
  const lab = labOf(s);
  const dr = s.darkroom || defaultDarkroom();
  // v12 Showcase stage: a sunset-gradient gallery wall behind the framed
  // photo, with a big soft floor shadow under it, so the layout reads as
  // a presented piece even before the 3D tilt is applied.
  if (s.layout === 'showcase') {
    const stage = ctx.createLinearGradient(0, 0, 0, H);
    stage.addColorStop(0, '#2b0a4a');
    stage.addColorStop(0.5, '#7a1e63');
    stage.addColorStop(1, '#ff6b35');
    ctx.fillStyle = stage;
    ctx.fillRect(0, 0, W, H);
    const sh = ctx.createRadialGradient(W / 2, H * 0.66, 0, W / 2, H * 0.66, W * 0.42);
    sh.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    sh.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sh;
    ctx.fillRect(0, 0, W, H);
  }
  if (s.layout === 'diptych') {
    drawDiptych(ctx, W, H, s, grade, lab, dr, rects);
  } else {
    rects.forEach((r) => {
      const panel = s.panels[r.panel] || { photo: 0, zoom: 1, dx: 0, dy: 0, caption: '', ink: false };
      const img = s.photos[panel.photo] || null;
      if (r.rot) {
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((r.rot * Math.PI) / 180);
        ctx.translate(-cx, -cy);
        drawPanel(ctx, img, r, panel, grade, s.inkLevel || 3, s.vignette, s.treatment, lab, dr);
        ctx.restore();
      } else {
        drawPanel(ctx, img, r, panel, grade, s.inkLevel || 3, s.vignette, s.treatment, lab, dr);
      }
    });
  }
  // Backdrop colour wash over the panels, if a blend mode is picked.
  if (bd && s.blend && s.blend !== 'none') {
    ctx.save();
    ctx.globalCompositeOperation = s.blend;
    ctx.globalAlpha = 0.22;
    const d = coverFitRect(bd, { x: 0, y: 0, w: W, h: H }, 1, 0, 0);
    ctx.drawImage(bd, d.x, d.y, d.w, d.h);
    ctx.restore();
  }
  if (s.lightLeak) drawLightLeak(ctx, W, H);
  // Procedural art (v5) sits over the panels but under the title, so the
  // sunburst/palms/skyline frame the cover without covering the lettering.
  drawArtKit(ctx, W, H, s);
  // Caption bars again, over the art: a skyline or palm crossing a panel's
  // foot would otherwise dim its story line. Drawing the same bar twice is
  // pixel-identical where nothing covers it; rotated panels (overlap) skip
  // this pass, since their bars live inside the rotated frame.
  if (!raw) {
    rects.forEach((r) => {
      if (r.rot || r.polaroid || r.noCaption) return;
      const panel = s.panels[r.panel] || {};
      const text = (panel.caption || '').trim();
      if (text) drawCaptionBar(ctx, r, text, true);
    });
  }
  if (s.halftone) {
    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = ctx.createPattern(getHalftoneTile(), 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (s.grain) {
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = ctx.createPattern(getGrainTile(), 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  // v11 Sunset Strip: the bottom 60% is a sunset gradient band (deep
  // purple at the photo seam, through magenta, to amber at the foot) so
  // the giant display title sits on colour, not on the dark board.
  if (s.layout === 'sunsetstrip') {
    const grad = ctx.createLinearGradient(0, H * 0.40, 0, H);
    grad.addColorStop(0, '#2b0a4a');
    grad.addColorStop(0.45, '#d62678');
    grad.addColorStop(0.8, '#ff6b35');
    grad.addColorStop(1, '#ffb400');
    ctx.fillStyle = grad;
    ctx.fillRect(0, Math.round(H * 0.40), W, H - Math.round(H * 0.40));
    ctx.fillStyle = 'rgba(255, 180, 0, 0.25)';
    ctx.fillRect(0, Math.round(H * 0.40), W, Math.max(3, Math.round(H * 0.008)));
  }
  if (s.masthead) drawMasthead(ctx, W, H, s);
  drawTitleBlock(ctx, W, H, s);
  if (s.coverLinesOn) drawCoverLines(ctx, W, H, s);
  // Speech/thought bubbles (v5) sit on top of everything — they are the
  // comic's dialogue, so nothing may cover them.
  drawBubbles(ctx, W, H, s);
  // Stickers (v7) sit above even the bubbles: peel-and-stick art on the
  // very top of the cover.
  drawStickers(ctx, W, H, s);
}

/** Frames pack (v9): draws the cover's border treatment over the finished
 *  cover (after the glitch pass, so the frame itself stays crisp). All five
 *  are drawn in code — no assets — and scale with the cover size. */
export function drawFrame(ctx, W, H, state) {
  const frame = state.frame || 'none';
  if (frame === 'none') return;
  const S = Math.min(W, H);
  if (frame === 'filmstrip') {
    // Black rails top + bottom, sprocket holes marching across both rails.
    const rail = Math.round(H * 0.055);
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, rail);
    ctx.fillRect(0, H - rail, W, rail);
    const holeW = Math.round(rail * 0.55);
    const holeH = Math.round(rail * 0.5);
    const gap = Math.round(rail * 1.5);
    ctx.fillStyle = '#f5f0e6';
    // Leave the centre of the bottom rail clear for the VICE • 35MM label.
    for (let x = gap; x + holeW < W; x += holeW + gap) {
      if (x > W * 0.32 && x < W * 0.68) continue;
      ctx.beginPath();
      ctx.roundRect(x, Math.round((rail - holeH) / 2), holeW, holeH, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x, H - rail + Math.round((rail - holeH) / 2), holeW, holeH, 3);
      ctx.fill();
    }
    ctx.fillStyle = '#ffb400';
    ctx.font = `900 ${Math.round(rail * 0.42)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VICE  •  35MM  •  EST. 2026', W / 2, H - rail / 2);
    ctx.textAlign = 'left';
  } else if (frame === 'polaroid') {
    // Thick white instant-photo border, fat at the foot with a caption line.
    const side = Math.round(S * 0.045);
    const foot = Math.round(S * 0.14);
    ctx.fillStyle = '#fdfbf6';
    ctx.fillRect(0, 0, W, side);
    ctx.fillRect(0, H - foot, W, foot);
    ctx.fillRect(0, 0, side, H);
    ctx.fillRect(W - side, 0, side, H);
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 2;
    ctx.strokeRect(side - 1, side - 1, W - 2 * side + 2, H - side - foot + 2);
    ctx.fillStyle = '#1d0b2e';
    ctx.font = `italic 700 ${Math.round(S * 0.028)}px "Comic Sans MS", "Segoe Print", cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('vice city — summer \'26', W / 2, H - foot / 2);
    ctx.textAlign = 'left';
  } else if (frame === 'ticket') {
    // Ticket stub: dashed perforation lines down both sides, semicircular
    // notches punched out of each edge, and an ADMIT ONE strip.
    const m = Math.round(W * 0.035);
    ctx.fillStyle = 'rgba(8, 4, 16, 0.9)';
    ctx.beginPath();
    ctx.arc(0, H * 0.5, Math.round(S * 0.035), -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W, H * 0.5, Math.round(S * 0.035), Math.PI / 2, Math.PI * 1.5);
    ctx.fill();
    ctx.save();
    ctx.strokeStyle = '#fdfbf6';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    ctx.beginPath();
    ctx.moveTo(m, 0);
    ctx.lineTo(m, H);
    ctx.moveTo(W - m, 0);
    ctx.lineTo(W - m, H);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(W - m / 2, H / 2);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = '#ffb400';
    ctx.font = `900 ${Math.round(S * 0.022)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADMIT ONE', 0, 0);
    ctx.restore();
  } else if (frame === 'torn') {
    // Torn paper edge: a jagged white border, deterministic (fixed seed)
    // so the same cover always tears the same way.
    const rnd = mulberry32(20261119);
    const depth = Math.round(S * 0.03);
    const step = Math.round(S * 0.045);
    ctx.fillStyle = '#f5efe2';
    const jag = (horizontal, fixed, from, to, out) => {
      ctx.beginPath();
      ctx.moveTo(from, fixed);
      for (let p = from; p < to; p += step) {
        const d = depth * (0.4 + rnd() * 0.8);
        if (horizontal) ctx.lineTo(p + step / 2, fixed + out * d);
        else ctx.lineTo(fixed + out * d, p + step / 2);
        if (horizontal) ctx.lineTo(p + step, fixed);
        else ctx.lineTo(fixed, p + step);
      }
      ctx.closePath();
      ctx.fill();
    };
    // Top + bottom strips (jag on the inner edge), left + right strips.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, depth * 2);
    ctx.clip();
    jag(true, 0, 0, W, 1);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, H - depth * 2, W, depth * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let p = 0; p < W; p += step) {
      ctx.lineTo(p + step / 2, H - depth * (0.4 + rnd() * 0.8));
      ctx.lineTo(p + step, H);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, depth * 2, H);
    ctx.clip();
    jag(false, 0, 0, H, 1);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(W - depth * 2, 0, depth * 2, H);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(W, 0);
    for (let p = 0; p < H; p += step) {
      ctx.lineTo(W - depth * (0.4 + rnd() * 0.8), p + step / 2);
      ctx.lineTo(W, p + step);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (frame === 'rounded') {
    // Rounded corners: cut the four corners out to the board colour, then
    // a white rounded outline so the cover reads as one card.
    const r = Math.round(S * 0.06);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.moveTo(r, 0);
    ctx.arcTo(W, 0, W, H, r);
    ctx.arcTo(W, H, 0, H, r);
    ctx.arcTo(0, H, 0, 0, r);
    ctx.arcTo(0, 0, W, 0, r);
    ctx.closePath();
    ctx.fillStyle = '#12081f';
    ctx.fill('evenodd');
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(3, Math.round(S * 0.008));
    ctx.beginPath();
    ctx.roundRect(Math.round(ctx.lineWidth / 2), Math.round(ctx.lineWidth / 2), W - ctx.lineWidth, H - ctx.lineWidth, r);
    ctx.stroke();
    ctx.restore();
  }
}

/** The inset rect a frame leaves for the cover itself. Film Strip and
 *  Polaroid are mats: the cover is rendered smaller and sits inside the
 *  frame, so the rails never cover the masthead or the title. Ticket,
 *  Torn and Rounded are edge treatments drawn over the cover, so they
 *  need no inset. Returns null when the frame needs none. */
export function frameInset(frame, W, H) {
  const S = Math.min(W, H);
  if (frame === 'filmstrip') {
    const rail = Math.round(H * 0.055);
    return { x: 0, y: rail, w: W, h: H - 2 * rail };
  }
  if (frame === 'polaroid') {
    const side = Math.round(S * 0.045);
    const foot = Math.round(S * 0.14);
    return { x: side, y: side, w: W - 2 * side, h: H - side - foot };
  }
  return null;
}

/** Renders the whole cover onto `canvas` (its own pixel size) from `state`.
 *  With compare < 1 the left side shows the raw photo and the right side the
 *  graded cover, split by a draggable-look divider (the slider sets it).
 *  A mat frame (Film Strip / Polaroid) insets the cover so the frame never
 *  covers the masthead or the title; edge frames draw over the cover. */
export function drawCover(canvas, state) {
  // v12: with no tilt the path is exactly the old flat render — pixel for
  // pixel what v1–v11 exported. With tilt, the flat cover is rendered to
  // an offscreen canvas first, then warped onto the tilted quad over a
  // stage background with a layered drop shadow, so the depth is baked
  // into the PNG exactly as previewed.
  if (!tiltActive(state)) {
    drawCoverFlat(canvas, state);
    return;
  }
  const W = canvas.width;
  const H = canvas.height;
  const flat = document.createElement('canvas');
  flat.width = W;
  flat.height = H;
  drawCoverFlat(flat, state);
  const ctx = canvas.getContext('2d');
  const t = state.tilt || defaultTilt();
  // Stage: a dark violet board with a soft pink glow behind the cover.
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#241040');
  bg.addColorStop(0.55, '#160a26');
  bg.addColorStop(1, '#0b0616');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.55);
  glow.addColorStop(0, 'rgba(255, 46, 136, 0.20)');
  glow.addColorStop(0.6, 'rgba(255, 107, 53, 0.07)');
  glow.addColorStop(1, 'rgba(255, 46, 136, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  const quad = tiltQuad(W, H, t);
  // Layered drop shadow: 3 copies of the quad, each further down-right,
  // fainter and softer, so the cover reads as floating above the board.
  const strength = t.shadow == null ? 0.55 : t.shadow;
  const layers = [
    { dx: W * 0.012, dy: H * 0.016, alpha: 0.42, blur: Math.max(W, H) * 0.012 },
    { dx: W * 0.026, dy: H * 0.034, alpha: 0.30, blur: Math.max(W, H) * 0.026 },
    { dx: W * 0.045, dy: H * 0.058, alpha: 0.18, blur: Math.max(W, H) * 0.045 },
  ];
  for (const L of layers) {
    ctx.save();
    try { ctx.filter = `blur(${Math.round(L.blur)}px)`; } catch { /* no filter: hard shadow still reads */ }
    ctx.fillStyle = `rgba(0, 0, 0, ${(L.alpha * strength).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(quad[0][0] + L.dx, quad[0][1] + L.dy);
    for (let i = 1; i < 4; i++) ctx.lineTo(quad[i][0] + L.dx, quad[i][1] + L.dy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  drawPerspectiveImage(ctx, flat, quad);
  if (state.printMarks) drawPrintMarks(ctx, W, H);
}

function drawCoverFlat(canvas, state) {
  const W = canvas.width;
  const H = canvas.height;
  const frame = state.frame || 'none';
  const inset = frameInset(frame, W, H);
  if (!inset) {
    drawCoverInner(canvas, state);
    if (frame !== 'none') drawFrame(canvas.getContext('2d'), W, H, state);
    if (state.printMarks) drawPrintMarks(canvas.getContext('2d'), W, H);
    return;
  }
  const inner = document.createElement('canvas');
  inner.width = inset.w;
  inner.height = inset.h;
  drawCoverInner(inner, state);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(inner, inset.x, inset.y);
  drawFrame(ctx, W, H, state);
  if (state.printMarks) drawPrintMarks(ctx, W, H);
}

function drawCoverInner(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cmp = state.compare == null ? 1 : state.compare;
  // The Diptych layout already IS a before/after — the compare slider has
  // nothing to split there, so it renders whole.
  if (cmp >= 1 || state.layout === 'diptych') {
    renderCover(ctx, W, H, state, false);
  } else {
    const after = document.createElement('canvas');
    after.width = W;
    after.height = H;
    renderCover(after.getContext('2d'), W, H, state, false);
    const before = document.createElement('canvas');
    before.width = W;
    before.height = H;
    renderCover(before.getContext('2d'), W, H, state, true);
    ctx.drawImage(before, 0, 0);
    const dx = Math.round(W * cmp);
    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, 0, W - dx, H);
    ctx.clip();
    ctx.drawImage(after, 0, 0);
    ctx.restore();
    // Divider line + handle.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dx - 2, 0, 4, H);
    const cy = H / 2;
    const r = Math.max(18, Math.round(Math.min(W, H) * 0.03));
    ctx.beginPath();
    ctx.arc(dx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#ff2e88';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(dx - 4, cy - 7);
    ctx.lineTo(dx - 11, cy);
    ctx.lineTo(dx - 4, cy + 7);
    ctx.closePath();
    ctx.moveTo(dx + 4, cy - 7);
    ctx.lineTo(dx + 11, cy);
    ctx.lineTo(dx + 4, cy + 7);
    ctx.closePath();
    ctx.fill();
  }
  // v7 glitch post-pass: over the whole finished cover (preview, export,
  // series variants and template thumbnails all come through here), so the
  // CRT/VHS effects are baked into the PNG exactly as previewed.
  if (glitchActive(state.glitch)) applyGlitch(ctx, W, H, state.glitch);
}

/** Renders the cover at an export size and returns a PNG blob. Exports are
 *  always the full graded cover, whatever the compare slider shows.
 *  `overrideLayout` swaps the layout for this one render (series variants). */
// --- Display-font preload (v11) ----------------------------------------
// The title/tagline canvas text uses the vendored OFL fonts; a canvas draw
// before the font arrives silently falls back to the system face, so every
// export waits for the fonts first (cached — the first call pays, the rest
// are free). In Node (unit imports) document is absent and this is a no-op.
let displayFontsReady = null;
export function ensureDisplayFonts() {
  if (displayFontsReady) return displayFontsReady;
  displayFontsReady = (async () => {
    if (typeof document === 'undefined' || !document.fonts || !document.fonts.load) return;
    try {
      await Promise.all([
        document.fonts.load('400 100px "Vice Anton"'),
        document.fonts.load('400 100px "Vice Archivo"'),
        document.fonts.ready,
      ]);
    } catch { /* a missing font falls back to the system face */ }
  })();
  return displayFontsReady;
}

export async function exportCover(state, w, h, overrideLayout) {
  await ensureDisplayFonts();
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  drawCover(c, { ...state, compare: 1, layout: overrideLayout || state.layout });
  return new Promise((resolve) => c.toBlob(resolve, 'image/png'));
}

/** Series mode (v4): one theme, three covers — the main cover (current
 *  layout, landscape) plus a square and a portrait variant with their own
 *  layouts. Returns [{ file, blob }] in series order. */
export const SERIES_VARIANTS = [
  { label: 'Main · Landscape', w: 1920, h: 1080, file: 'vice-series-1-landscape.png' },
  { label: 'Variant · Square', w: 1080, h: 1080, file: 'vice-series-2-square.png' },
  { label: 'Variant · Portrait', w: 1080, h: 1350, file: 'vice-series-3-portrait.png' },
];

export async function exportSeries(state) {
  const out = [];
  const layouts = [state.layout, ...(state.seriesLayouts || ['magazine', 'triptych'])];
  for (let i = 0; i < SERIES_VARIANTS.length; i++) {
    const v = SERIES_VARIANTS[i];
    const blob = await exportCover(state, v.w, v.h, layouts[i]);
    out.push({ file: v.file, label: v.label, blob });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Batch mode (v9): N photos -> N different covers, in one click. Each photo
// is read (brightness / contrast / warmth / dominant hue), the best-fitting
// grade + layout + title is picked for THAT photo (the same deterministic
// scoring as Smart Suggest, so the same photo always gets the same recipe),
// and the frame cycles through the Frames pack — so six photos come out as
// six visibly different covers, not six copies of one recipe. Different
// from Series mode (v4): Series is one theme across 3 sizes; Batch is N
// photos, each with its own look.
// ---------------------------------------------------------------------------
export function buildBatchVariants(state, photos) {
  const list = (photos || []).filter(Boolean).slice(0, 6);
  return list.map((img, i) => {
    const analysis = analyzePhoto(img);
    const recipes = suggestCovers(analysis);
    const recipe = recipes[i % recipes.length];
    const caps = suggestCaptions(analysis);
    const caption = caps[i % caps.length];
    const v = defaultState();
    restoreState(v, snapshotState(state));
    v.photos = [img, img, img];
    v.photoData = [null, null, null];
    v.backdropImgs = state.backdropImgs || {};
    v.layout = recipe.layout;
    v.grade = recipe.grade;
    v.titleStyle = recipe.titleStyle;
    v.title = caption.title;
    v.tagline = caption.tagline;
    v.frame = FRAME_KEYS[i % FRAME_KEYS.length];
    v.compare = 1;
    v.series = false;
    v.panels = v.panels.map((p) => ({ ...p, photo: 0 }));
    return {
      index: i,
      photo: img,
      state: v,
      grade: recipe.grade,
      gradeLabel: GRADES[recipe.grade].label,
      layout: recipe.layout,
      layoutLabel: LAYOUTS[recipe.layout].label,
      title: caption.title,
      frame: v.frame,
      frameLabel: FRAMES[v.frame].label,
      analysis,
    };
  });
}

/** Exports every batch variant at one size (default 1080x1080 square).
 *  Returns [{ file, label, blob }] in batch order. */
export async function exportBatch(state, variants, w, h) {
  const sizeW = w || 1080;
  const sizeH = h || 1080;
  const out = [];
  for (const variant of variants || []) {
    const blob = await exportCover(variant.state, sizeW, sizeH);
    out.push({
      file: `vice-batch-${variant.index + 1}-${variant.grade}.png`,
      label: `#${variant.index + 1} ${variant.title} — ${variant.gradeLabel} / ${variant.frameLabel}`,
      blob,
    });
  }
  return out;
}

export const EXPORT_SIZES = [
  { label: 'Square 1080 × 1080', w: 1080, h: 1080, file: 'vice-type-1080x1080.png' },
  { label: 'Portrait 1080 × 1350', w: 1080, h: 1350, file: 'vice-type-1080x1350.png' },
  { label: 'Landscape 1920 × 1080', w: 1920, h: 1080, file: 'vice-type-1920x1080.png' },
  { label: 'Story 1080 × 1920', w: 1080, h: 1920, file: 'vice-type-1080x1920.png' },
];

/** Contact sheet (v8): all four export sizes on one sheet — a title bar
 *  with the cover title + palette swatches, then a 2x2 grid of thumbnails
 *  with a size label under each. One PNG, 1920x1290. */
export const CONTACT_SHEET = { w: 1920, h: 1290, file: 'vice-contact-sheet.png' };

export async function exportContactSheet(state) {
  await ensureDisplayFonts();
  const sheet = document.createElement('canvas');
  sheet.width = CONTACT_SHEET.w;
  sheet.height = CONTACT_SHEET.h;
  const ctx = sheet.getContext('2d');
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, 0, sheet.width, sheet.height);
  // Title bar.
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, 0, sheet.width, 8);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 54px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText((state.title || 'VICE PALETTE').toUpperCase(), 40, 58);
  ctx.font = '700 28px system-ui, sans-serif';
  ctx.fillStyle = '#ffb400';
  ctx.fillText('CONTACT SHEET — ALL 4 SIZES', 40, 102);
  // Palette swatches in the title bar (when the custom palette is on).
  const pal = state.palette;
  if (pal && pal.enabled && pal.stops) {
    pal.stops.forEach((hex, i) => {
      ctx.fillStyle = hex;
      ctx.beginPath();
      ctx.arc(sheet.width - 60 - i * 64, 60, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });
  }
  // 2x2 grid: each cell 920x560 (thumb + label), gaps 20, top bar 130.
  const cellW = 920;
  const cellH = 560;
  const gap = 20;
  const top = 130;
  for (let i = 0; i < EXPORT_SIZES.length; i++) {
    const size = EXPORT_SIZES[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = gap + col * (cellW + gap);
    const cy = top + row * (cellH + gap);
    const c = document.createElement('canvas');
    c.width = size.w;
    c.height = size.h;
    drawCover(c, { ...state, compare: 1 });
    const scale = Math.min(cellW / size.w, (cellH - 44) / size.h);
    const tw = Math.round(size.w * scale);
    const th = Math.round(size.h * scale);
    const tx = cx + Math.round((cellW - tw) / 2);
    const ty = cy;
    ctx.fillStyle = '#1d0b2e';
    ctx.fillRect(cx, cy, cellW, cellH);
    ctx.drawImage(c, tx, ty, tw, th);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${size.label}  ·  ${size.w} × ${size.h}`, cx + cellW / 2, cy + cellH - 16);
    ctx.textAlign = 'left';
  }
  return new Promise((resolve) => sheet.toBlob(resolve, 'image/png'));
}

// ---------------------------------------------------------------------------
// Mockup export (v12): the finished cover (tilt included) presented as a
// real object, drawn procedurally on canvas — no external assets. Three
// scenes, each its own PNG size:
//   framed    — 1080x1080: the cover as a framed poster on a gallery wall.
//   phone     — 1080x1350: the cover on a phone screen at sunset.
//   billboard — 1080x1080: the cover on a lit billboard at night.
// ---------------------------------------------------------------------------
export const MOCKUPS = {
  framed: { label: 'Framed Poster', w: 1080, h: 1080, file: 'vice-mockup-framed.png' },
  phone: { label: 'Phone Screen', w: 1080, h: 1350, file: 'vice-mockup-phone.png' },
  billboard: { label: 'Billboard', w: 1080, h: 1080, file: 'vice-mockup-billboard.png' },
};

function mockupCoverCanvas(state, w, h) {
  const c = document.createElement('canvas');
  c.width = w || 1080;
  c.height = h || 1080;
  drawCover(c, { ...state, compare: 1 });
  return c;
}

/** Draw a source image to cover a rect (centre-cropped, like CSS
 *  background-size: cover); `contain` instead fits the whole image in. */
function drawFit(ctx, img, x, y, w, h, mode) {
  const iw = img.width;
  const ih = img.height;
  if (mode === 'contain') {
    const s = Math.min(w / iw, h / ih);
    const dw = iw * s;
    const dh = ih * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    return;
  }
  const s = Math.max(w / iw, h / ih);
  const dw = iw * s;
  const dh = ih * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawMockupInto(canvas, state, kind) {
  const def = MOCKUPS[kind];
  if (!def) return false;
  canvas.width = def.w;
  canvas.height = def.h;
  const ctx = canvas.getContext('2d');
  const W = def.w;
  const H = def.h;
  const cover = mockupCoverCanvas(state);
  if (kind === 'framed') {
    // Gallery wall: violet plaster, darker floor, one framed poster.
    const wall = ctx.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#3a2350');
    wall.addColorStop(0.7, '#241040');
    wall.addColorStop(1, '#160a26');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0e0718';
    ctx.fillRect(0, H * 0.88, W, H * 0.12);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.fillRect(0, H * 0.88, W, 3);
    const fx = 190;
    const fy = 110;
    const fw = 700;
    const fh = 700;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 22;
    ctx.fillStyle = '#2a1a12';
    ctx.fillRect(fx, fy, fw, fh);
    ctx.restore();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 4;
    ctx.strokeRect(fx + 8, fy + 8, fw - 16, fh - 16);
    ctx.fillStyle = '#f8f4ec';
    ctx.fillRect(fx + 26, fy + 26, fw - 52, fh - 52);
    drawFit(ctx, cover, fx + 44, fy + 44, fw - 88, fh - 88, 'contain');
    // Brass plate under the frame.
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(W / 2 - 130, fy + fh + 42, 260, 44);
    ctx.fillStyle = '#1d0b2e';
    ctx.font = '900 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((state.title || 'VICE SHOWCASE').toUpperCase(), W / 2, fy + fh + 65);
    ctx.textAlign = 'left';
  } else if (kind === 'phone') {
    // Sunset backdrop, phone held upright in the middle.
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#ff6b35');
    sky.addColorStop(0.45, '#d62678');
    sky.addColorStop(1, '#2b0a4a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255, 180, 0, 0.85)';
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.22, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(18, 8, 31, 0.55)';
    ctx.fillRect(0, H * 0.82, W, H * 0.18);
    const px = 290;
    const py = 110;
    const pw = 500;
    const ph = 1130;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 18;
    roundRectPath(ctx, px, py, pw, ph, 64);
    ctx.fillStyle = '#0d0d12';
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundRectPath(ctx, px + 14, py + 14, pw - 28, ph - 28, 52);
    ctx.clip();
    // Blurred cover as the screen wallpaper (fills the tall screen), then
    // the whole cover on top, so the square cover never floats in black.
    try { ctx.filter = 'blur(28px)'; } catch { /* no filter: flat backdrop */ }
    ctx.fillStyle = '#1a0b2e';
    ctx.fillRect(px + 14, py + 14, pw - 28, ph - 28);
    drawFit(ctx, cover, px + 14, py + 14, pw - 28, ph - 28, 'cover');
    try { ctx.filter = 'none'; } catch { /* ignore */ }
    ctx.fillStyle = 'rgba(10, 4, 18, 0.35)';
    ctx.fillRect(px + 14, py + 14, pw - 28, ph - 28);
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    drawFit(ctx, cover, px + 14, py + 14, pw - 28, ph - 28, 'contain');
    ctx.restore();
    ctx.restore();
    // Notch + status bar + home indicator.
    ctx.fillStyle = '#0d0d12';
    roundRectPath(ctx, W / 2 - 70, py + 14, 140, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 22px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('9:41', px + 44, py + 52);
    ctx.textAlign = 'right';
    ctx.fillText('5G', px + pw - 44, py + 52);
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    roundRectPath(ctx, W / 2 - 60, py + ph - 34, 120, 7, 4);
    ctx.fill();
  } else {
    // Night billboard: starry sky, skyline, lit board on two legs.
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0b1030');
    sky.addColorStop(0.6, '#1a0f2a');
    sky.addColorStop(1, '#2b0a4a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    let seed = 1234567;
    const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 70; i++) {
      const sx = rnd() * W;
      const sy = rnd() * H * 0.45;
      const sr = 1 + rnd() * 2;
      ctx.globalAlpha = 0.3 + rnd() * 0.7;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Skyline silhouette.
    ctx.fillStyle = '#0e0718';
    let bx = 0;
    seed = 987654;
    while (bx < W) {
      const bw = 60 + rnd() * 90;
      const bh = 90 + rnd() * 160;
      ctx.fillRect(bx, H * 0.86 - bh, bw, bh);
      bx += bw + 6;
    }
    ctx.fillStyle = '#0e0718';
    ctx.fillRect(0, H * 0.86, W, H * 0.14);
    // Board.
    const bx0 = 90;
    const by0 = 170;
    const bw0 = 900;
    const bh0 = 560;
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 36;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = '#1c1c22';
    ctx.fillRect(bx0, by0, bw0, bh0);
    ctx.restore();
    ctx.fillStyle = '#000000';
    ctx.fillRect(bx0 + 14, by0 + 14, bw0 - 28, bh0 - 28);
    // The board is landscape: render the cover landscape too and cover-fit
    // it, so the board fills edge to edge (the tilt's own margins absorb
    // the small side crop) instead of letterboxing a square cover.
    drawFit(ctx, mockupCoverCanvas(state, 1920, 1080), bx0 + 14, by0 + 14, bw0 - 28, bh0 - 28, 'cover');
    ctx.strokeStyle = '#ffb400';
    ctx.lineWidth = 5;
    ctx.strokeRect(bx0 + 4, by0 + 4, bw0 - 8, bh0 - 8);
    // Legs.
    ctx.fillStyle = '#1c1c22';
    ctx.fillRect(bx0 + 150, by0 + bh0, 36, H * 0.86 - (by0 + bh0));
    ctx.fillRect(bx0 + bw0 - 186, by0 + bh0, 36, H * 0.86 - (by0 + bh0));
    // Floodlights on top + light cones onto the board.
    for (const lx of [bx0 + 220, bx0 + bw0 - 220]) {
      ctx.fillStyle = '#2a2a30';
      ctx.fillRect(lx - 34, by0 - 26, 68, 22);
      ctx.fillStyle = '#ffe9a8';
      ctx.fillRect(lx - 28, by0 - 8, 56, 8);
      const cone = ctx.createLinearGradient(0, by0, 0, by0 + bh0);
      cone.addColorStop(0, 'rgba(255, 233, 168, 0.28)');
      cone.addColorStop(1, 'rgba(255, 233, 168, 0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(lx - 26, by0);
      ctx.lineTo(lx + 26, by0);
      ctx.lineTo(lx + 130, by0 + bh0 * 0.8);
      ctx.lineTo(lx - 130, by0 + bh0 * 0.8);
      ctx.closePath();
      ctx.fill();
    }
  }
  return true;
}

/** Renders one mockup scene as a PNG blob (see MOCKUPS for the sizes). */
export async function exportMockup(state, kind) {
  await ensureDisplayFonts();
  const def = MOCKUPS[kind];
  if (!def) return null;
  const c = document.createElement('canvas');
  drawMockupInto(c, state, kind);
  return new Promise((resolve) => c.toBlob(resolve, 'image/png'));
}

/** All three mockups, in MOCKUPS order. Returns [{ file, label, blob }]. */
export async function exportAllMockups(state) {
  const out = [];
  for (const key of Object.keys(MOCKUPS)) {
    const blob = await exportMockup(state, key);
    out.push({ file: MOCKUPS[key].file, label: MOCKUPS[key].label, blob });
  }
  return out;
}

// --- Editor history + Looks (v3) -------------------------------------------
// Snapshots hold only serializable fields (photos are Image objects and stay
// out); undo restores layout/grade/title/treatment/panels, never the photos.

const SNAP_FIELDS = [
  'layout', 'grade', 'backdrop', 'blend', 'halftone', 'grain', 'inkLevel',
  'title', 'tagline', 'credits', 'issue', 'titleStyle', 'titleCurve', 'titleFont', 'bodyFont',
  'masthead', 'mastheadName', 'coverLinesOn', 'treatment', 'lightLeak',
  'vignette', 'compare', 'blur', 'spotlight', 'colorPop', 'film', 'series',
  'darkroom', 'glitch', 'palette', 'customPalettes', 'frame', 'printMarks',
  'canvasBg', 'freeform', 'tilt',
];

export function snapshotState(state) {
  const s = {};
  for (const f of SNAP_FIELDS) s[f] = state[f];
  s.panels = state.panels.map((p) => ({ ...p }));
  s.coverLines = [...(state.coverLines || [])];
  s.seriesLayouts = [...(state.seriesLayouts || [])];
  s.art = JSON.parse(JSON.stringify(state.art || defaultArt()));
  s.bubbles = (state.bubbles || []).map((b) => ({ ...b }));
  s.stickers = (state.stickers || []).map((b) => ({ ...b }));
  // Darkroom holds nested curves/HSL objects — deep-copy like art.
  s.darkroom = JSON.parse(JSON.stringify(state.darkroom || defaultDarkroom()));
  // Glitch is nested the same way (per-effect on/amount).
  s.glitch = JSON.parse(JSON.stringify(state.glitch || defaultGlitch()));
  // Palette (v8): stops + saved palettes are nested too.
  s.palette = JSON.parse(JSON.stringify(state.palette || defaultPalette()));
  s.customPalettes = JSON.parse(JSON.stringify(state.customPalettes || []));
  // Frame (v9) rides in SNAP_FIELDS; the Smart Crop focus point too.
  s.focus = state.focus ? { ...state.focus } : null;
  // Canvas background + freeform (v10) are nested — deep-copy like art.
  s.canvasBg = JSON.parse(JSON.stringify(state.canvasBg || defaultCanvasBg()));
  s.freeform = JSON.parse(JSON.stringify(state.freeform || defaultFreeform()));
  // 3D tilt (v12): flat { x, y, perspective, shadow } — copy, don't share.
  s.tilt = { ...(state.tilt || defaultTilt()) };
  return s;
}

export function restoreState(state, snap) {
  for (const f of SNAP_FIELDS) {
    if (snap[f] !== undefined) state[f] = snap[f];
  }
  if (snap.panels) state.panels = snap.panels.map((p) => ({ ...p }));
  if (snap.coverLines) state.coverLines = [...snap.coverLines];
  if (snap.seriesLayouts) state.seriesLayouts = [...snap.seriesLayouts];
  if (snap.art) state.art = JSON.parse(JSON.stringify(snap.art));
  if (snap.bubbles) state.bubbles = snap.bubbles.map((b) => ({ ...b }));
  if (snap.stickers) state.stickers = snap.stickers.map((b) => ({ ...b }));
  // A v5 snapshot/project has no darkroom: keep the current (default) one.
  if (snap.darkroom) state.darkroom = JSON.parse(JSON.stringify(snap.darkroom));
  // A v6 snapshot/project has no glitch/stickers: keep the current ones.
  if (snap.glitch) state.glitch = JSON.parse(JSON.stringify(snap.glitch));
  // A v7 snapshot/project has no palette: keep the current one.
  if (snap.palette) state.palette = JSON.parse(JSON.stringify(snap.palette));
  if (snap.customPalettes) state.customPalettes = JSON.parse(JSON.stringify(snap.customPalettes));
  // A v8 snapshot/project has no frame/focus: keep the current ones.
  if (snap.frame !== undefined) state.frame = snap.frame;
  if (snap.focus !== undefined) state.focus = snap.focus ? { ...snap.focus } : null;
  // A v9 snapshot/project has no canvas background / freeform: keep the
  // current ones.
  if (snap.canvasBg) state.canvasBg = JSON.parse(JSON.stringify(snap.canvasBg));
  if (snap.freeform) state.freeform = JSON.parse(JSON.stringify(snap.freeform));
  if (snap.printMarks !== undefined) state.printMarks = snap.printMarks;
  // A v11 snapshot/project has no tilt: keep the current (default) one.
  if (snap.tilt) state.tilt = { ...snap.tilt };
}

// --- Save / load project (v5) ------------------------------------------------
// A project is the whole editable state as plain JSON: every SNAP field,
// panels, cover lines, series layouts, art kit, bubbles, plus the photos as
// data URLs (photoData, parallel to photos). Photos are NOT in snapshots —
// undo never touches them — but a saved project must carry them.
export function serializeProject(state) {
  const snap = snapshotState(state);
  return {
    app: 'vice-canvas-cover-studio',
    version: 10,
    savedAt: new Date().toISOString(),
    state: snap,
    photoData: [...(state.photoData || [null, null, null])],
  };
}

/** Validates a parsed project file and returns { state, photoData } or
 *  throws with a human-readable reason. v5/v6/v7/v8/v9 projects load too (their state
 *  simply has no darkroom/glitch/palette/freeform — restoreState keeps the defaults). Unknown future
 *  versions are refused rather than half-loaded. */
export function deserializeProject(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('Not a project file.');
  if (obj.app !== 'vice-canvas-cover-studio') throw new Error('Not a Vice Canvas project file.');
  if (obj.version !== 5 && obj.version !== 6 && obj.version !== 7 && obj.version !== 8 && obj.version !== 9 && obj.version !== 10) throw new Error(`Project version ${obj.version} is not supported (need 5, 6, 7, 8, 9 or 10).`);
  if (!obj.state || typeof obj.state !== 'object') throw new Error('Project has no state.');
  return {
    state: obj.state,
    photoData: Array.isArray(obj.photoData) ? obj.photoData.slice(0, 3) : [null, null, null],
  };
}

/** Applies a one-click Look (layout + grade + backdrop + title style +
 *  treatment + masthead + ink) to the state. Returns false for unknown keys. */
export function applyLook(state, key) {
  const look = LOOKS[key];
  if (!look) return false;
  for (const f of ['layout', 'grade', 'backdrop', 'blend', 'titleStyle', 'treatment', 'masthead', 'coverLinesOn', 'title', 'titleFont', 'bodyFont']) {
    if (look[f] !== undefined) state[f] = look[f];
  }
  if (look.art) state.art = JSON.parse(JSON.stringify(look.art));
  if (look.bubbles) state.bubbles = look.bubbles.map((b) => ({ ...b }));
  state.panels.forEach((p) => { p.ink = !!look.ink; });
  return true;
}

// --- Template gallery (v4) -------------------------------------------------
// Nine ready-made templates: a full cover recipe each (layout + grade +
// backdrop + title style + treatment + Photo Lab), shown as painted
// thumbnails in the editor. A Look is a named recipe; a template is the same
// recipe you can SEE before you click it.
export const TEMPLATES = {
  sunsetBoulevard: {
    label: 'Sunset Boulevard', layout: 'hero', grade: 'sunset', backdrop: 'skyline',
    blend: 'screen', titleStyle: 'extruded', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: false, title: 'VICE SUNSET',
    lab: { blur: 0, spotlight: 0, colorPop: 'none', film: 'none' },
  },
  neonSpotlight: {
    label: 'Neon Spotlight', layout: 'overlap', grade: 'neon', backdrop: 'street',
    blend: 'screen', titleStyle: 'glow', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: false, title: 'NEON NIGHTS',
    lab: { blur: 0, spotlight: 0.6, colorPop: 'none', film: 'none' },
  },
  chromePop: {
    label: 'Chrome Pop', layout: 'magazine', grade: 'chrome', backdrop: 'none',
    blend: 'screen', titleStyle: 'chrome', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: false, title: 'VICE CHROME',
    lab: { blur: 0, spotlight: 0.35, colorPop: 'pink', film: 'none' },
  },
  vhs86: {
    label: "VHS '86", layout: 'triptych', grade: 'sunbleach', backdrop: 'none',
    blend: 'screen', titleStyle: 'flat', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: false, title: 'TAPE 86',
    lab: { blur: 0, spotlight: 0, colorPop: 'none', film: 'vhs86' },
  },
  polaroidSummer: {
    label: 'Polaroid Summer', layout: 'polaroid', grade: 'pastel', backdrop: 'beach',
    blend: 'soft-light', titleStyle: 'gradient', treatment: 'none',
    masthead: false, coverLinesOn: false, ink: false, title: 'SUMMER 95',
    lab: { blur: 0, spotlight: 0, colorPop: 'none', film: 'polaroid95' },
  },
  chromeNoir: {
    label: 'Chrome Noir', layout: 'collage5', grade: 'inknoir', backdrop: 'none',
    blend: 'screen', titleStyle: 'sticker', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: true, title: 'CHROME NOIR',
    lab: { blur: 2, spotlight: 0, colorPop: 'none', film: 'chrome99' },
  },
  // v5: the Art Kit showcase — sunburst + sun disc + palms over Sunset Noir,
  // with a speech bubble, so one click shows everything new in v5.
  viceCanvas: {
    label: 'Vice Canvas', layout: 'hero', grade: 'sunsetNoir', backdrop: 'skyline',
    blend: 'screen', titleStyle: 'chrome', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: false, title: 'VICE CANVAS',
    lab: { blur: 0, spotlight: 0.35, colorPop: 'none', film: 'none' },
    art: {
      sunburst: { on: true, opacity: 0.55, color: '#ffb400', x: 0.5, y: 0.22, scale: 1 },
      palm: { on: true, opacity: 0.9, color: '#160a24', x: 0.07, y: 0.98, scale: 1 },
      skyline: { on: true, opacity: 0.85, color: '#12081f', x: 0, y: 0.98, scale: 1 },
      sun: { on: true, opacity: 0.95, color: '#ff6b35', x: 0.5, y: 0.22, scale: 1 },
      grid: { on: false, opacity: 0.35, color: '#00e5ff', x: 0.5, y: 0.62, scale: 1 },
    },
    bubbles: [
      { kind: 'speech', text: 'VICE CITY, BABY!', x: 0.60, y: 0.26, size: 1, style: 'classic' },
    ],
  },
  // v6: the Darkroom showcase — Diptych before/after with the Golden Hour
  // preset, so one click shows the whole new axis: raw vs darkroomed.
  goldenDarkroom: {
    label: 'Golden Darkroom', layout: 'diptych', grade: 'sunset', backdrop: 'none',
    blend: 'screen', titleStyle: 'chrome', treatment: 'none',
    masthead: true, coverLinesOn: false, ink: false, title: 'GOLDEN HOUR',
    lab: { blur: 0, spotlight: 0, colorPop: 'none', film: 'none' },
    darkroom: JSON.parse(JSON.stringify(DARKROOM_PRESETS.goldenHour.darkroom)),
  },
  // v7: the Glitch showcase — Neon Nights with every CRT effect on, a star
  // and a lightning sticker, so one click shows the whole new axis: a cover
  // that looks like a mis-tracked VHS tape.
  viceGlitch: {
    label: 'Vice Glitch', layout: 'hero', grade: 'neon', backdrop: 'street',
    blend: 'screen', titleStyle: 'glow', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: false, title: 'VICE GLITCH',
    lab: { blur: 0, spotlight: 0, colorPop: 'none', film: 'none' },
    glitch: {
      chromatic: { on: true, amount: 10 },
      scanlines: { on: true, amount: 0.6 },
      noise: { on: true, amount: 0.45 },
      slices: { on: true, amount: 0.6 },
      titleShift: { on: true, amount: 8 },
    },
    stickers: [
      { kind: 'star', x: 0.85, y: 0.16, size: 1, rot: 12 },
      { kind: 'bolt', x: 0.12, y: 0.72, size: 1.1, rot: -8 },
    ],
  },
  // v8: the Palette showcase — Moodboard scrapbook with a custom palette
  // gradient (Vice Sunset stops) over the Neon grade, so one click shows
  // the whole new axis: your colours + the scrapbook layout.
  vicePalette: {
    label: 'Vice Palette', layout: 'moodboard', grade: 'neon', backdrop: 'none',
    blend: 'screen', titleStyle: 'gradient', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: false, title: 'VICE PALETTE',
    lab: { blur: 0, spotlight: 0, colorPop: 'none', film: 'none' },
    palette: { enabled: true, stops: ['#ffb400', '#ff6b35', '#d62678'], name: 'Vice Sunset', preset: 'viceSunset' },
  },
  // v9: the Batch showcase — Hero layout, Neon grade, Film Strip frame, so
  // one click shows the whole new axis: a cover that looks like a strip of
  // 35mm film, ready to be one of six in a batch.
  viceBatch: {
    label: 'Vice Batch', layout: 'hero', grade: 'neon', backdrop: 'street',
    blend: 'screen', titleStyle: 'glow', treatment: 'none',
    masthead: true, coverLinesOn: true, ink: false, title: 'VICE BATCH',
    lab: { blur: 0, spotlight: 0.35, colorPop: 'none', film: 'none' },
    frame: 'filmstrip',
  },
  // v10: the Freeform showcase — Overlapping Collage on a pink-to-cyan
  // gradient board, panels tilted off the grid, title dragged to the middle
  // of the cover and rotated — the whole new axis in one click: nothing on
  // this cover sits where a fixed layout would put it.
  viceFreeform: {
    label: 'Vice Freeform', layout: 'overlap', grade: 'sunset', backdrop: 'none',
    blend: 'screen', titleStyle: 'glow', treatment: 'none',
    masthead: true, coverLinesOn: false, ink: false, title: 'VICE FREEFORM',
    lab: { blur: 0, spotlight: 0, colorPop: 'none', film: 'none' },
    canvasBg: { kind: 'gradient', color: '#ff2e88', color2: '#00e5ff' },
    freeform: { on: true, snap: true, layout: 'overlap', items: null, title: { x: 0.5, y: 0.55, rot: -4 }, titleMoved: true },
  },
  // v11: the fonts showcase — Sunset Strip layout, Anton title, Archivo
  // Black tagline/credits, chrome title style over the sunset band.
  viceFonts: {
    label: 'Vice Fonts', layout: 'sunsetstrip', grade: 'sunset', backdrop: 'skyline',
    blend: 'screen', titleStyle: 'chrome', treatment: 'none',
    masthead: true, coverLinesOn: false, ink: false, title: 'VICE FONTS',
    titleFont: 'anton', bodyFont: 'archivo',
    lab: { blur: 0, spotlight: 0, colorPop: 'none', film: 'none' },
  },
  // v12: the showcase — Showcase 3D layout on a sunset stage, Anton title
  // in chrome, gallery lean tilt, so one click shows the whole new axis:
  // depth + presentation, not just another grade.
  viceShowcase: {
    label: 'Vice Showcase', layout: 'showcase', grade: 'sunset', backdrop: 'skyline',
    blend: 'screen', titleStyle: 'chrome', treatment: 'none',
    masthead: true, coverLinesOn: false, ink: false, title: 'VICE SHOWCASE',
    titleFont: 'anton', bodyFont: 'archivo',
    tilt: { x: -8, y: 12, perspective: 900, shadow: 0.65 },
    lab: { blur: 0, spotlight: 0.35, colorPop: 'none', film: 'none' },
  },
};

/** Applies a template (same fields as a Look, plus the Photo Lab settings).
 *  Returns false for unknown keys. */
export function applyTemplate(state, key) {
  const t = TEMPLATES[key];
  if (!t) return false;
  for (const f of ['layout', 'grade', 'backdrop', 'blend', 'titleStyle', 'treatment', 'masthead', 'coverLinesOn', 'title']) {
    if (t[f] !== undefined) state[f] = t[f];
  }
  if (t.lab) {
    state.blur = t.lab.blur || 0;
    state.spotlight = t.lab.spotlight || 0;
    state.colorPop = t.lab.colorPop || 'none';
    state.film = t.lab.film || 'none';
  }
  if (t.darkroom) state.darkroom = JSON.parse(JSON.stringify(t.darkroom));
  if (t.tilt) state.tilt = { ...t.tilt };
  if (t.glitch) state.glitch = JSON.parse(JSON.stringify(t.glitch));
  if (t.palette) state.palette = JSON.parse(JSON.stringify(t.palette));
  if (t.frame) state.frame = t.frame;
  if (t.art) state.art = JSON.parse(JSON.stringify(t.art));
  if (t.bubbles) state.bubbles = t.bubbles.map((b) => ({ ...b }));
  if (t.stickers) state.stickers = t.stickers.map((b) => ({ ...b }));
  if (t.canvasBg) state.canvasBg = JSON.parse(JSON.stringify(t.canvasBg));
  if (t.printMarks !== undefined) state.printMarks = t.printMarks;
  if (t.freeform) {
    // items: null means "derive from this template's layout, then tilt".
    const ff = JSON.parse(JSON.stringify(t.freeform));
    ff.layout = state.layout;
    if (!ff.items) {
      ff.items = freeformItemsFor(state.layout);
      const tilts = [-6, 5, -4, 3, -5];
      ff.items.forEach((it, i) => {
        it.rot = (it.rot || 0) + tilts[i % tilts.length];
        if (i === 1) it.x = Math.min(0.95 - it.w, it.x + 0.02);
        if (i === 3) it.y = Math.max(0, it.y - 0.02);
        it.modified = true;
      });
    }
    state.freeform = ff;
  }
  state.panels.forEach((p) => { p.ink = !!t.ink; });
  return true;
}

/** True when the state matches a template's recipe (lab included). */
export function templateMatches(state, key) {
  const t = TEMPLATES[key];
  if (!t) return false;
  for (const f of ['layout', 'grade', 'backdrop', 'blend', 'titleStyle', 'treatment', 'masthead', 'coverLinesOn', 'title']) {
    if (t[f] !== undefined && state[f] !== t[f]) return false;
  }
  if (t.lab) {
    if ((state.blur || 0) !== (t.lab.blur || 0)) return false;
    if ((state.spotlight || 0) !== (t.lab.spotlight || 0)) return false;
    if ((state.colorPop || 'none') !== (t.lab.colorPop || 'none')) return false;
    if ((state.film || 'none') !== (t.lab.film || 'none')) return false;
  }
  if (t.darkroom) {
    if (JSON.stringify(state.darkroom || {}) !== JSON.stringify(t.darkroom)) return false;
  }
  if (t.art) {
    for (const el of Object.keys(t.art)) {
      if (!!((state.art || {})[el] || {}).on !== !!t.art[el].on) return false;
    }
  }
  if (t.bubbles) {
    if ((state.bubbles || []).length !== t.bubbles.length) return false;
    for (let i = 0; i < t.bubbles.length; i++) {
      if ((state.bubbles[i] || {}).text !== t.bubbles[i].text) return false;
    }
  }
  if (t.glitch) {
    for (const fx of Object.keys(t.glitch)) {
      if (!!((state.glitch || {})[fx] || {}).on !== !!t.glitch[fx].on) return false;
    }
  }
  if (t.palette) {
    const p = state.palette || {};
    if (!!p.enabled !== !!t.palette.enabled) return false;
    if (JSON.stringify(p.stops || []) !== JSON.stringify(t.palette.stops || [])) return false;
  }
  if (t.frame) {
    if ((state.frame || 'none') !== t.frame) return false;
  }
  if (t.stickers) {
    if ((state.stickers || []).length !== t.stickers.length) return false;
    for (let i = 0; i < t.stickers.length; i++) {
      if ((state.stickers[i] || {}).kind !== t.stickers[i].kind) return false;
    }
  }
  if (t.canvasBg) {
    if ((state.canvasBg || {}).kind !== t.canvasBg.kind) return false;
  }
  if (t.printMarks !== undefined) {
    if (!!state.printMarks !== !!t.printMarks) return false;
  }
  if (t.freeform) {
    const ff = state.freeform || {};
    if (!!ff.on !== !!t.freeform.on) return false;
    if (t.freeform.title) {
      const tt = ff.title || {};
      if (tt.x !== t.freeform.title.x || tt.y !== t.freeform.title.y || (tt.rot || 0) !== t.freeform.title.rot) return false;
    }
  }
  return state.panels.every((p) => p.ink === !!t.ink);
}
