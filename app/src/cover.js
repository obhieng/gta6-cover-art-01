// Vice Lights Cover Studio — the cover renderer.
// Draws a multi-panel poster cover on any 2D canvas from a plain state object:
// photos, per-panel crop/position/caption, layout, grade, title engine and
// print textures. Pure canvas, no network, no external assets.

export const LAYOUTS = {
  hero: { label: 'Hero + strip', panels: 4 },
  grid3: { label: 'Grid 3-panel', panels: 3 },
  collage5: { label: 'Collage 5-panel', panels: 5 },
  diagonal: { label: 'Diagonal split', panels: 2 },
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
};

const WORD_COLORS = ['#ff2e88', '#ffb400', '#00e5ff', '#ffffff', '#ff6b35', '#7CFF6B'];

export function defaultState() {
  return {
    layout: 'hero',
    grade: 'sunset',
    halftone: true,
    grain: true,
    title: 'VICE LIGHTS',
    tagline: 'One city. One night. No brakes.',
    credits: 'Starring NOE  •  LEON  •  MARIA',
    issue: '07',
    photos: [null, null, null],
    // One slot per panel (max 5); photo = index into photos, zoom 1 = fit.
    panels: [
      { photo: 0, zoom: 1, dx: 0, dy: 0, caption: 'Golden hour on the boulevard' },
      { photo: 1, zoom: 1, dx: 0, dy: 0, caption: 'The pier at last light' },
      { photo: 0, zoom: 1.15, dx: 0.06, dy: 0, caption: 'Top down, windows down' },
      { photo: 1, zoom: 1.2, dx: -0.05, dy: 0.04, caption: 'Neon after midnight' },
      { photo: 0, zoom: 1.1, dx: 0, dy: -0.05, caption: 'Meet me where the palms bend' },
    ],
  };
}

/** Panel rectangles for a layout, in pixels, with a thin white gutter. */
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

function drawPanel(ctx, img, r, panel, grade) {
  ctx.save();
  clipPanel(ctx, r);
  if (img) {
    ctx.filter = grade.filter;
    const d = coverFitRect(img, r, panel.zoom || 1, panel.dx || 0, panel.dy || 0);
    ctx.drawImage(img, d.x, d.y, d.w, d.h);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#241a33';
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  const tint = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  tint.addColorStop(0, grade.top);
  tint.addColorStop(1, grade.bottom);
  ctx.fillStyle = tint;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  // Vignette: darken the panel edges so the grade reads as print, not a filter.
  const vg = ctx.createRadialGradient(
    r.x + r.w / 2, r.y + r.h / 2, Math.min(r.w, r.h) * 0.35,
    r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w, r.h) * 0.75,
  );
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = vg;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  // Per-panel caption: its own story line, comic-strip style.
  const text = (panel.caption || '').trim();
  if (text) {
    const barH = Math.max(22, Math.round(r.h * 0.085));
    ctx.fillStyle = 'rgba(8, 6, 16, 0.62)';
    ctx.fillRect(r.x, r.y + r.h - barH, r.w, barH);
    let size = Math.max(11, Math.round(barH * 0.44));
    ctx.font = `700 ${size}px system-ui, sans-serif`;
    while (ctx.measureText(text.toUpperCase()).width > r.w - 16 && size > 9) {
      size -= 1;
      ctx.font = `700 ${size}px system-ui, sans-serif`;
    }
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), r.x + 8, r.y + r.h - barH / 2);
  }
  ctx.restore();
  // White frame line around the panel.
  ctx.save();
  clipPanel(ctx, r);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = Math.max(2, Math.round(Math.min(r.w, r.h) * 0.008));
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

function drawTitleBlock(ctx, W, H, state) {
  const pad = Math.round(W * 0.045);
  // Size everything from the SHORTER side: in a wide landscape cover a
  // width-based title would grow so tall its tagline/credits crash into the
  // hero panel's caption bar.
  const S = Math.min(W, H);
  const words = (state.title || 'VICE LIGHTS').trim().toUpperCase().split(/\s+/).filter(Boolean);
  const family = '"Arial Black", "Helvetica Neue", system-ui, sans-serif';
  const maxW = W - pad * 2;
  let size = Math.round(S * 0.115);
  for (const w of words) {
    size = Math.min(size, fitFont(ctx, w, maxW, Math.round(S * 0.115), 900, family));
  }
  const lineH = size * 0.92;
  let y = pad + size * 0.78;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  words.forEach((word, i) => {
    ctx.font = `900 ${size}px ${family}`;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(10, 4, 18, 0.9)';
    ctx.lineWidth = Math.max(3, size * 0.07);
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeText(word, pad, y);
    ctx.fillStyle = WORD_COLORS[i % WORD_COLORS.length];
    ctx.fillText(word, pad, y);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
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
  // Issue badge, top right.
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

/** Renders the whole cover onto `canvas` (its own pixel size) from `state`. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const grade = GRADES[state.grade] || GRADES.sunset;
  ctx.fillStyle = '#12081f';
  ctx.fillRect(0, 0, W, H);
  const rects = layoutPanels(state.layout, W, H);
  rects.forEach((r, i) => {
    const panel = state.panels[i] || { photo: 0, zoom: 1, dx: 0, dy: 0, caption: '' };
    const img = state.photos[panel.photo] || null;
    drawPanel(ctx, img, r, panel, grade);
  });
  if (state.halftone) {
    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = ctx.createPattern(getHalftoneTile(), 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (state.grain) {
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = ctx.createPattern(getGrainTile(), 'repeat');
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  drawTitleBlock(ctx, W, H, state);
}

/** Renders the cover at an export size and returns a PNG blob. */
export function exportCover(state, w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  drawCover(c, state);
  return new Promise((resolve) => c.toBlob(resolve, 'image/png'));
}

export const EXPORT_SIZES = [
  { label: 'Square 1080 × 1080', w: 1080, h: 1080, file: 'vice-lights-1080x1080.png' },
  { label: 'Portrait 1080 × 1350', w: 1080, h: 1350, file: 'vice-lights-1080x1350.png' },
  { label: 'Landscape 1920 × 1080', w: 1920, h: 1080, file: 'vice-lights-1920x1080.png' },
];
