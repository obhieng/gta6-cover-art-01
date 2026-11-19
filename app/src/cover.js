// Vice Type Cover Studio — the cover renderer (v3).
// Draws a multi-panel poster cover on any 2D canvas from a plain state object:
// photos, per-panel crop/position/caption/ink, layout, grade, scene backdrop,
// title engine and print textures. Pure canvas, no network, no external assets.
//
// v3 adds: Title engine v2 (curved text, 3D extruded, gradient fill, sticker
// outline, glow, masthead bar, cover lines), the Magazine layout, 6 one-click
// Looks, before/after compare, treatments (duotone / threshold / solarize),
// light-leak + vignette toggles. Everything from v1/v2 is kept.

export const LAYOUTS = {
  hero: { label: 'Hero + strip', panels: 4 },
  grid3: { label: 'Grid 3-panel', panels: 3 },
  collage5: { label: 'Collage 5-panel', panels: 5 },
  diagonal: { label: 'Diagonal split', panels: 2 },
  overlap: { label: 'Overlapping Collage', panels: 4 },
  polaroid: { label: 'Polaroid Strip', panels: 3 },
  triptych: { label: 'Triptych Center', panels: 3 },
  magazine: { label: 'Magazine Cover', panels: 1 },
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
};

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
};

export const TITLE_STYLES = {
  flat: { label: 'Flat Bold' },
  extruded: { label: '3D Extruded' },
  gradient: { label: 'Gradient Fill' },
  sticker: { label: 'Sticker Outline' },
  glow: { label: 'Neon Glow' },
  curved: { label: 'Curved Arc' },
};

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

function getProcessedPanel(img, r, panel, grade, level, treatment) {
  const cap = 800;
  const scale = Math.min(1, cap / Math.max(r.w, r.h));
  const w = Math.max(2, Math.round(r.w * scale));
  const h = Math.max(2, Math.round(r.h * scale));
  const key = [
    imgId(img), w, h, panel.zoom || 1, panel.dx || 0, panel.dy || 0,
    grade.label, level, panel.ink ? 'ink' : 'plain', treatment || 'none',
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
  if (treatment && treatment !== 'none') applyTreatmentPixels(g, w, h, treatment);
  if (inkCache.size > 16) inkCache.clear();
  inkCache.set(key, c);
  return c;
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
  }
  g.putImageData(imgData, 0, 0);
}

/** Paints the photo (ink-processed / treated or plain graded) into rect r. Caller clips. */
function paintPhoto(ctx, img, r, panel, grade, inkLevel, treatment) {
  if (!img) {
    ctx.fillStyle = '#241a33';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    return;
  }
  if (panel.ink || (treatment && treatment !== 'none')) {
    const proc = getProcessedPanel(img, r, panel, grade, inkLevel, treatment || 'none');
    ctx.drawImage(proc, r.x, r.y, r.w, r.h);
  } else {
    ctx.filter = grade.filter;
    const d = coverFitRect(img, r, panel.zoom || 1, panel.dx || 0, panel.dy || 0);
    ctx.drawImage(img, d.x, d.y, d.w, d.h);
    ctx.filter = 'none';
  }
}

function drawCaptionBar(ctx, r, text, dark) {
  const barH = Math.max(22, Math.round(r.h * 0.085));
  ctx.fillStyle = dark ? 'rgba(8, 6, 16, 0.62)' : 'rgba(248, 244, 236, 0.92)';
  ctx.fillRect(r.x, r.y + r.h - barH, r.w, barH);
  let size = Math.max(11, Math.round(barH * 0.44));
  ctx.font = `700 ${size}px system-ui, sans-serif`;
  while (ctx.measureText(text.toUpperCase()).width > r.w - 16 && size > 9) {
    size -= 1;
    ctx.font = `700 ${size}px system-ui, sans-serif`;
  }
  ctx.fillStyle = dark ? '#fff' : '#1d0b2e';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), r.x + 8, r.y + r.h - barH / 2);
}

function drawPanel(ctx, img, r, panel, grade, inkLevel, vignette, treatment) {
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
    paintPhoto(ctx, img, photoRect, panel, grade, inkLevel, treatment);
    ctx.restore();
    // Tint + vignette over the photo area only.
    ctx.save();
    ctx.beginPath();
    ctx.rect(photoRect.x, photoRect.y, photoRect.w, photoRect.h);
    ctx.clip();
    const tint = ctx.createLinearGradient(0, photoRect.y, 0, photoRect.y + photoRect.h);
    tint.addColorStop(0, grade.top);
    tint.addColorStop(1, grade.bottom);
    ctx.fillStyle = tint;
    ctx.fillRect(photoRect.x, photoRect.y, photoRect.w, photoRect.h);
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
  paintPhoto(ctx, img, r, panel, grade, inkLevel, treatment);
  const tint = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  tint.addColorStop(0, grade.top);
  tint.addColorStop(1, grade.bottom);
  ctx.fillStyle = tint;
  ctx.fillRect(r.x, r.y, r.w, r.h);
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
  if (text && !r.noCaption) drawCaptionBar(ctx, r, text, true);
  ctx.restore();
  // White frame line around the panel (thicker for the collage stack).
  ctx.save();
  clipPanel(ctx, r);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = r.border || Math.max(2, Math.round(Math.min(r.w, r.h) * 0.008));
  ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
  ctx.restore();
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

/** One title word in the chosen style, drawn at (x, y) baseline. */
function drawTitleWord(ctx, word, x, y, size, family, colorIdx, style) {
  const color = WORD_COLORS[colorIdx % WORD_COLORS.length];
  ctx.font = `900 ${size}px ${family}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  const w = ctx.measureText(word).width;
  if (style === 'extruded') {
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
 *  the curve's tangent, with a sticker outline + gradient fill. */
function drawCurvedWord(ctx, word, x, y, size, family, colorIdx, amp) {
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

function drawTitleBlock(ctx, W, H, state) {
  const pad = Math.round(W * 0.045);
  // Size everything from the SHORTER side: in a wide landscape cover a
  // width-based title would grow so tall its tagline/credits crash into the
  // hero panel's caption bar.
  const S = Math.min(W, H);
  const mastheadH = state.masthead ? Math.round(S * 0.085) : 0;
  const words = (state.title || 'VICE LIGHTS').trim().toUpperCase().split(/\s+/).filter(Boolean);
  const family = '"Arial Black", "Helvetica Neue", system-ui, sans-serif';
  const maxW = W - pad * 2;
  let size = Math.round(S * 0.115);
  for (const w of words) {
    size = Math.min(size, fitFont(ctx, w, maxW, Math.round(S * 0.115), 900, family));
  }
  const style = state.titleStyle || 'flat';
  const amp = size * 0.32 * (state.titleCurve == null ? 0.6 : state.titleCurve);
  const lineH = size * 0.92;
  let y = (mastheadH ? mastheadH + pad * 0.6 : pad) + size * 0.78;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  words.forEach((word, i) => {
    if (style === 'curved') {
      drawCurvedWord(ctx, word, pad, y, size, family, i, amp);
    } else {
      drawTitleWord(ctx, word, pad, y, size, family, i, style);
    }
    y += lineH;
  });
  // Tagline in italic, credits right under it — never at the foot, where the
  // per-panel caption bars live.
  const tagSize = Math.max(13, Math.round(S * 0.022));
  ctx.font = `italic 700 ${tagSize}px system-ui, sans-serif`;
  ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 6;
  ctx.fillText(state.tagline || '', pad, y + tagSize * 0.4);
  const footSize = Math.max(11, Math.round(S * 0.016));
  ctx.font = `700 ${footSize}px system-ui, sans-serif`;
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
    panels: state.panels.map((p) => ({ ...p, ink: false })),
  };
}

/** Renders one full cover onto a 2D context. `raw` renders the ungraded
 *  version used by the before/after compare. */
function renderCover(ctx, W, H, state, raw) {
  const s = raw ? rawState(state) : state;
  const grade = s.grade === '__raw__' ? RAW_GRADE : (GRADES[s.grade] || GRADES.sunset);
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, 0, W, H);
  // Scene backdrop behind the panels (and through the gutters).
  const bd = s.backdropImgs && s.backdropImgs[s.backdrop];
  if (bd) {
    const d = coverFitRect(bd, { x: 0, y: 0, w: W, h: H }, 1, 0, 0);
    ctx.drawImage(bd, d.x, d.y, d.w, d.h);
    ctx.fillStyle = 'rgba(10, 4, 18, 0.25)';
    ctx.fillRect(0, 0, W, H);
  }
  const rects = layoutPanels(s.layout, W, H);
  rects.forEach((r, i) => {
    const panel = s.panels[i] || { photo: 0, zoom: 1, dx: 0, dy: 0, caption: '', ink: false };
    const img = s.photos[panel.photo] || null;
    if (r.rot) {
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((r.rot * Math.PI) / 180);
      ctx.translate(-cx, -cy);
      drawPanel(ctx, img, r, panel, grade, s.inkLevel || 3, s.vignette, s.treatment);
      ctx.restore();
    } else {
      drawPanel(ctx, img, r, panel, grade, s.inkLevel || 3, s.vignette, s.treatment);
    }
  });
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
  if (s.masthead) drawMasthead(ctx, W, H, s);
  drawTitleBlock(ctx, W, H, s);
  if (s.coverLinesOn) drawCoverLines(ctx, W, H, s);
}

/** Renders the whole cover onto `canvas` (its own pixel size) from `state`.
 *  With compare < 1 the left side shows the raw photo and the right side the
 *  graded cover, split by a draggable-look divider (the slider sets it). */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cmp = state.compare == null ? 1 : state.compare;
  if (cmp >= 1) {
    renderCover(ctx, W, H, state, false);
    return;
  }
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

/** Renders the cover at an export size and returns a PNG blob. Exports are
 *  always the full graded cover, whatever the compare slider shows. */
export function exportCover(state, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  drawCover(c, { ...state, compare: 1 });
  return new Promise((resolve) => c.toBlob(resolve, 'image/png'));
}

export const EXPORT_SIZES = [
  { label: 'Square 1080 × 1080', w: 1080, h: 1080, file: 'vice-type-1080x1080.png' },
  { label: 'Portrait 1080 × 1350', w: 1080, h: 1350, file: 'vice-type-1080x1350.png' },
  { label: 'Landscape 1920 × 1080', w: 1920, h: 1080, file: 'vice-type-1920x1080.png' },
];

// --- Editor history + Looks (v3) -------------------------------------------
// Snapshots hold only serializable fields (photos are Image objects and stay
// out); undo restores layout/grade/title/treatment/panels, never the photos.

const SNAP_FIELDS = [
  'layout', 'grade', 'backdrop', 'blend', 'halftone', 'grain', 'inkLevel',
  'title', 'tagline', 'credits', 'issue', 'titleStyle', 'titleCurve',
  'masthead', 'mastheadName', 'coverLinesOn', 'treatment', 'lightLeak',
  'vignette', 'compare',
];

export function snapshotState(state) {
  const s = {};
  for (const f of SNAP_FIELDS) s[f] = state[f];
  s.panels = state.panels.map((p) => ({ ...p }));
  s.coverLines = [...(state.coverLines || [])];
  return s;
}

export function restoreState(state, snap) {
  for (const f of SNAP_FIELDS) {
    if (snap[f] !== undefined) state[f] = snap[f];
  }
  if (snap.panels) state.panels = snap.panels.map((p) => ({ ...p }));
  if (snap.coverLines) state.coverLines = [...snap.coverLines];
}

/** Applies a one-click Look (layout + grade + backdrop + title style +
 *  treatment + masthead + ink) to the state. Returns false for unknown keys. */
export function applyLook(state, key) {
  const look = LOOKS[key];
  if (!look) return false;
  for (const f of ['layout', 'grade', 'backdrop', 'blend', 'titleStyle', 'treatment', 'masthead', 'coverLinesOn', 'title']) {
    if (look[f] !== undefined) state[f] = look[f];
  }
  state.panels.forEach((p) => { p.ink = !!look.ink; });
  return true;
}
