// Fixed scenes for screenshots: ?shot=editor shows the editor with the samples
// loaded; ?shot=cover shows the cover alone at the requested size.
// window.__shotReady is set once the scene is painted.
// Extra query params: ink=1 (comic-ink on every panel), inkLevel=1..5,
// backdrop=<key>, blend=<mode>, look=<key>, titleStyle=<key>, titleCurve=0..1,
// masthead=0/1, coverLines=0/1, treatment=<key>, lightLeak=1, vignette=0,
// template=<key> (v4), series=1 (v4: show the 3-cover series strip),
// blur=0..8, spotlight=0..1, colorPop=<key>, film=<key> (v4 Photo Lab),
// art=1 (v5: sunburst + sun disc + palms on), skyline=1 / grid=1 (v5: those
// elements on), bubble=<text> (v5: first bubble's text), bubbleKind=<kind>,
// bubbleStyle=<style>, focus=artkit (v5 editor shot: scroll the Art Kit
// fieldset into view; the sticky preview stays visible).
// darkroom=goldenHour|blueHour (v6: one-click darkroom preset),
// focus=darkroom (v6 editor shot: scroll the Darkroom fieldset into view),
// suggest=1 (v6 editor shot: run Smart Suggest so the 3 cards show).
// glitch=1 (v7: all CRT effects on — chromatic + scanlines + noise +
// slices + title shift), glitchChromatic=<px> / glitchScan / glitchNoise /
// glitchSlices=<0..1> / glitchTitle=<px> (v7: single-effect overrides),
// stickers=1 (v7: 3 stickers on) / stickers=0 (none),
// captions=1 (v7 editor shot: run Auto-caption so the 3 cards show),
// focus=glitch|captions (v7 editor shot: scroll that fieldset into view),
// size=story (v7: 1080x1920 export size).
// palette=<preset>|hex,hex,hex (v8: enable the custom palette with a preset
// or 3 hex stops), extract=1 (v8: extract the dominant colours from the
// loaded photo and apply the first 3 as stops), cotd=1|<YYYY-MM-DD> (v8:
// apply Cover of the Day), focus=palette (v8 editor shot: scroll the
// Palette fieldset into view).
import { BACKDROPS, LOOKS, TEMPLATES, applyLook, applyTemplate, applyDarkroomPreset, PALETTE_PRESETS, applyCoverOfTheDay } from './cover.js';

export async function runShot(shot, query, api) {
  const { state, loadDefaults, redraw, canvas } = api;
  const template = query.get('template');
  if (template && TEMPLATES[template]) applyTemplate(state, template);
  const look = query.get('look');
  if (look && LOOKS[look]) applyLook(state, look);
  const layout = query.get('layout');
  if (layout) state.layout = layout;
  const grade = query.get('grade');
  if (grade) state.grade = grade;
  const title = query.get('title') || query.get('caption');
  if (title) api.setTitle(title);
  if (query.get('halftone') === '0') state.halftone = false;
  if (query.get('grain') === '0') state.grain = false;
  if (query.get('ink') === '1') state.panels.forEach((p) => { p.ink = true; });
  const inkLevel = Number(query.get('inkLevel'));
  if (inkLevel >= 1 && inkLevel <= 5) state.inkLevel = inkLevel;
  const backdrop = query.get('backdrop');
  if (backdrop && BACKDROPS[backdrop]) state.backdrop = backdrop;
  const blend = query.get('blend');
  if (blend) state.blend = blend;
  const titleStyle = query.get('titleStyle');
  if (titleStyle) state.titleStyle = titleStyle;
  const titleCurve = query.get('titleCurve');
  if (titleCurve !== null && !Number.isNaN(Number(titleCurve))) state.titleCurve = Number(titleCurve);
  if (query.get('masthead') === '1') state.masthead = true;
  if (query.get('masthead') === '0') state.masthead = false;
  if (query.get('coverLines') === '1') state.coverLinesOn = true;
  if (query.get('coverLines') === '0') state.coverLinesOn = false;
  const treatment = query.get('treatment');
  if (treatment) state.treatment = treatment;
  if (query.get('lightLeak') === '1') state.lightLeak = true;
  if (query.get('vignette') === '0') state.vignette = false;
  // v4 Photo Lab + Series mode.
  const blur = Number(query.get('blur'));
  if (!Number.isNaN(blur) && blur >= 0 && blur <= 8) state.blur = blur;
  const spotlight = Number(query.get('spotlight'));
  if (!Number.isNaN(spotlight) && spotlight >= 0 && spotlight <= 1) state.spotlight = spotlight;
  const colorPop = query.get('colorPop');
  if (colorPop) state.colorPop = colorPop;
  const film = query.get('film');
  if (film) state.film = film;
  if (query.get('series') === '1') state.series = true;
  // v5 Procedural Art Kit + bubbles.
  if (query.get('art') === '1') {
    state.art.sunburst.on = true;
    state.art.sun.on = true;
    state.art.palm.on = true;
  }
  if (query.get('skyline') === '1') state.art.skyline.on = true;
  if (query.get('grid') === '1') state.art.grid.on = true;
  if (query.get('sunburst') === '1') state.art.sunburst.on = true;
  if (query.get('palm') === '1') state.art.palm.on = true;
  if (query.get('sun') === '1') state.art.sun.on = true;
  const bubbleText = query.get('bubble');
  if (bubbleText) {
    if (!state.bubbles.length) {
      state.bubbles.push({ kind: 'speech', text: bubbleText, x: 0.60, y: 0.26, size: 1, style: 'classic' });
    } else {
      state.bubbles[0].text = bubbleText;
    }
  }
  const bubbleKind = query.get('bubbleKind');
  if (bubbleKind && state.bubbles[0]) state.bubbles[0].kind = bubbleKind;
  const bubbleStyle = query.get('bubbleStyle');
  if (bubbleStyle && state.bubbles[0]) state.bubbles[0].style = bubbleStyle;
  if (query.get('bubbles') === '0') state.bubbles = [];
  // v6 Darkroom preset + Smart Suggest.
  const darkroom = query.get('darkroom');
  if (darkroom) applyDarkroomPreset(state, darkroom);
  // v7 Glitch / CRT effects.
  if (query.get('glitch') === '1') {
    state.glitch.chromatic = { on: true, amount: 10 };
    state.glitch.scanlines = { on: true, amount: 0.6 };
    state.glitch.noise = { on: true, amount: 0.45 };
    state.glitch.slices = { on: true, amount: 0.6 };
    state.glitch.titleShift = { on: true, amount: 8 };
  }
  const glitchNum = (param, key, field, max) => {
    const raw = query.get(param);
    if (raw === null) return; // absent param must not touch the preset (Number(null) is 0!)
    const v = Number(raw);
    if (!Number.isNaN(v) && v >= 0 && v <= max) {
      state.glitch[key][field] = v;
      state.glitch[key].on = v > 0;
    }
  };
  glitchNum('glitchChromatic', 'chromatic', 'amount', 40);
  glitchNum('glitchScan', 'scanlines', 'amount', 1);
  glitchNum('glitchNoise', 'noise', 'amount', 1);
  glitchNum('glitchSlices', 'slices', 'amount', 1);
  glitchNum('glitchTitle', 'titleShift', 'amount', 32);
  // v7 Stickers.
  if (query.get('stickers') === '1') {
    state.stickers = [
      { kind: 'star', x: 0.85, y: 0.16, size: 1, rot: 12 },
      { kind: 'bolt', x: 0.12, y: 0.72, size: 1.1, rot: -8 },
      { kind: 'heart', x: 0.68, y: 0.68, size: 0.9, rot: 6 },
    ];
  }
  if (query.get('stickers') === '0') state.stickers = [];
  // v8 Custom palette + Cover of the Day.
  const paletteParam = query.get('palette');
  if (paletteParam) {
    if (PALETTE_PRESETS[paletteParam]) {
      state.palette = { enabled: true, stops: [...PALETTE_PRESETS[paletteParam].stops], name: PALETTE_PRESETS[paletteParam].label, preset: paletteParam };
    } else {
      const stops = paletteParam.split(',').map((s) => s.trim()).filter((s) => /^#[0-9a-fA-F]{6}$/.test(s));
      if (stops.length >= 2) {
        while (stops.length < 3) stops.push(stops[stops.length - 1]);
        state.palette = { enabled: true, stops: stops.slice(0, 3), name: 'Custom', preset: null };
      }
    }
  }
  const cotd = query.get('cotd');
  if (cotd !== null) {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(cotd) ? cotd : undefined;
    applyCoverOfTheDay(state, date);
  }
  if (api.syncButtons) api.syncButtons();
  await loadDefaults();
  // v8: extract the dominant colours AFTER the samples load, so the swatch
  // row and the applied stops come from the real photo.
  if (query.get('extract') === '1' && api.runPaletteExtract) api.runPaletteExtract();
  if (query.get('suggest') === '1') {
    // Compact the Darkroom fieldset for the shot so the tone curve, the
    // sliders AND the 3 suggestion cards all fit in one 1280-tall frame.
    document.body.classList.add('shot-suggest');
    if (api.runSuggest) api.runSuggest();
  }
  // v7 Auto-caption: same photo reading, three ready titles.
  if (query.get('captions') === '1' && api.runCaptions) api.runCaptions();
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const size = query.get('size') || 'landscape';
    const dims = {
      square: [1080, 1080],
      portrait: [1080, 1350],
      landscape: [1920, 1080],
      story: [1080, 1920],
    }[size] || [1920, 1080];
    canvas.width = dims[0];
    canvas.height = dims[1];
    redraw();
  } else {
    document.body.classList.add('shot-editor');
    redraw();
    // v5: scroll a named fieldset into view (the sticky preview stays put).
    const focus = query.get('focus');
    if (focus === 'artkit') {
      const el = document.getElementById('fs-artkit');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'bubbles') {
      const el = document.getElementById('fs-bubbles');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'darkroom') {
      const el = document.getElementById('fs-darkroom');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'glitch') {
      const el = document.getElementById('fs-glitch');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'captions') {
      const el = document.getElementById('fs-captions');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'palette') {
      const el = document.getElementById('fs-palette');
      if (el) el.scrollIntoView({ block: 'start' });
    }
    // With Smart Suggest on, nudge down a little so the 3rd suggestion card
    // clears the bottom edge (the curve stays fully in frame).
    if (query.get('suggest') === '1') window.scrollBy(0, 40);
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
