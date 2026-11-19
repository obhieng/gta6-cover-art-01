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
// captions=1 (v7 editor shot: run Auto-caption so the 3 cards show;
// v18: the same run now shows 6 cards — the 3 classic + 3 v2 styles),
// focus=glitch|captions (v7 editor shot: scroll that fieldset into view),
// size=story (v7: 1080x1920 export size).
// palette=<preset>|hex,hex,hex (v8: enable the custom palette with a preset
// or 3 hex stops), extract=1 (v8: extract the dominant colours from the
// loaded photo and apply the first 3 as stops), cotd=1|<YYYY-MM-DD> (v8:
// apply Cover of the Day), focus=palette (v8 editor shot: scroll the
// Palette fieldset into view).
// frame=<key> (v9: apply a Frames-pack border treatment), batch=1 (v9: build
// the 6-cover batch grid after the samples load), smartcrop=1 (v9: steer
// panel 1 onto its photo's focus point), focus=batch (v9 editor shot: scroll
// the Batch fieldset into view).
// freeform=1 (v10: switch Freeform on with a tilted preset — panels off the
// grid, title dragged to mid-cover), titlePos=x,y,rot (v10: the title
// block's freeform centre + rotation, e.g. 0.5,0.55,-4), printmarks=1 (v10:
// bleed + crop marks + safe area), canvasbg=gradient|solid|dots|grid (v10:
// canvas background kind) + bgcolor/bgcolor2 hex (v10: the two colours),
// focus=freeform (v10 editor shot: scroll the Freeform fieldset into view
// and show the selected panel + snap guide).
// titleFont=anton|archivo|system, bodyFont=anton|archivo|system (v11: the
// OFL display face for the title / tagline+credits), focus=fonts (v11
// editor shot: scroll the Title engine fieldset — with the font picker —
// into view).
// tilt=x,y (v12: 3D tilt in degrees, -20..20 each), tiltPersp=400..1600,
// tiltShadow=0..1 (v12: perspective distance + shadow strength),
// mockup=framed|phone|billboard (v12: cover shot renders that mockup scene
// instead of the bare cover), focus=showcase (v12 editor shot: scroll the
// 3D Tilt & Mockups fieldset into view).
// logo=sample (v13: stamp the procedural VL monogram onto the cover —
// demo only, never a brand mark), logoPos=<position> / logoSize=0..0.3 /
// logoOpacity=0..1 (v13: where + how big + how see-through the mark is),
// gallery=1 (v13 editor shot: save the current cover to the session
// gallery twice, so the gallery shows entries), focus=gallery (v13 editor
// shot: scroll the Session gallery fieldset into view).
// pairing=posterClassic|tallTight|heavyGrotesque (v14: apply a font pairing
// — title + tagline faces at once), focus=export (v14 editor shot: scroll
// the Export fieldset into view, so the Export everything button +
// progress bar are visible).
// fxHighlight=#rrggbb / fxHighlightOpacity=0..1 / fxStroke=#rrggbb /
// fxShadow=#rrggbb (v15: Title FX — picking a colour turns its switch on;
// fxHighlight=0 / fxStroke=0 / fxShadow=0 turns that switch off),
// stickers=new (v16: 3 new-kind stickers — crown, shades, sparkle),
// stickers=v20 (v20: the 3 newest kinds — palm tree, smiling sun,
// cassette), focus=stickers|zip (v16 editor shot: scroll the Stickers
// fieldset — the Export fieldset with the Download ZIP button sits right
// below it — or the Export fieldset itself into view).
// harmony=complementary|analogous|triadic (v17: apply that colour-theory
// scheme from the loaded photo's dominant colour), harmony=1 (v17 editor
// shot: build the 3 harmony cards from the photo),
// frameColor=#rrggbb (v17: the Neon Border glow colour),
// focus=harmony (v17 editor shot: scroll the Color harmony fieldset into
// view; the Custom size panel sits in the Export fieldset, focus=export).
// focus=titlefx (v15 editor shot: scroll the Title engine fieldset —
// with the Title FX controls — into view; Help + A/B compare sit right
// below it), ab=1 (v15 editor shot: open the A/B compare without
// scrolling, so the divider + both covers show in the same frame).
// timeline=1 (v19: run four real gestures — Look, layout, frame, title
// — so the History Timeline strip shows four labelled thumbnails +
// the Now tile), focus=timeline (v19 editor shot: scroll the History
// Timeline fieldset into view).
// caption3=retro|breaking|liner (v21: apply that Auto-caption v3 card —
// title + tagline + cover lines — from the loaded photo's own reading,
// so a cover shot can wear a Retro Ad / Breaking News / Album Liner
// caption without clicking), tiltShadowStyle=soft|hard|neon (v21: the
// Tilt Pro shadow style for the shot's tilt).
// double=1|screen|lighten|overlay|multiply|soft-light (v22: blend photo 2
// into panel 1 — mode 1 means screen — with doubleOpacity=0..1,
// doublePhoto=<0..2> and doublePanel=<0..4> overrides),
// focus=double (v22 editor shot: scroll the Double Exposure fieldset
// into view).
// furniture=1 (v23: turn the Magazine Furniture on — barcode + issue
// line — with furnitureIssue / furnitureDate / furniturePrice /
// furnitureBarcode=0 overrides), focus=furniture (v23 editor shot:
// scroll the Magazine Furniture fieldset into view).
// clock=1|<hour> (v24: turn the Vice Clock on — 1 means 18:30 Golden
// Hour, any other value sets the hour, e.g. clock=21 for Blue Hour),
// focus=clock (v24 editor shot: scroll the Vice Clock fieldset into view).
// weather=<kind> (v25: turn the Vice Weather on with that kind —
// weatherInt=<0-100> sets the intensity, e.g. weather=storm&weatherInt=80),
// focus=weather (v25 editor shot: scroll the Vice Weather fieldset into view).
// era=<year> (v26: turn the Vice Era on with that year —
// eraInt=<0-100> sets the intensity, e.g. era=1986&eraInt=80),
// focus=era (v26 editor shot: scroll the Vice Era fieldset into view).
import { BACKDROPS, LOOKS, TEMPLATES, applyLook, applyTemplate, applyDarkroomPreset, PALETTE_PRESETS, applyCoverOfTheDay, FRAMES, freeformItemsFor, defaultFreeform, FONTS, ensureDisplayFonts, MOCKUPS, makeSampleLogoDataURL, LOGO_POSITIONS, defaultLogo, FONT_PAIRINGS, defaultTitleFx, extractPalette, applyHarmony, analyzePhoto, suggestCaptionsV3, applyDoubleExposure, BLEND_MODES, defaultFurniture, clampFurnitureIssue, clampFurnitureDate, clampFurniturePrice, defaultTimeOfDay, clampTimeHour, defaultWeather, clampWeatherIntensity, clampWeatherKind, defaultEra, clampEraIntensity, clampEra } from './cover.js';

export async function runShot(shot, query, api) {
  const { state, loadDefaults, redraw, canvas } = api;
  // v11: title/body font params + wait for the OFL faces before painting,
  // so screenshots show the real display lettering, never the fallback.
  const titleFont = query.get('titleFont');
  if (titleFont && FONTS[titleFont]) state.titleFont = titleFont;
  const bodyFont = query.get('bodyFont');
  if (bodyFont && FONTS[bodyFont]) state.bodyFont = bodyFont;
  // v14: a font pairing applies both faces at once (after the single-face
  // params above, so pairing wins when both are given).
  const pairing = query.get('pairing');
  if (pairing && FONT_PAIRINGS[pairing]) {
    state.titleFont = FONT_PAIRINGS[pairing].titleFont;
    state.bodyFont = FONT_PAIRINGS[pairing].bodyFont;
  }
  await ensureDisplayFonts();
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
  // v15 Title FX params: fxHighlight / fxHighlightOpacity / fxStroke /
  // fxShadow (hex colours; picking one turns its switch on). Absent
  // params leave the state alone — Number(null) is 0, so null is
  // always checked explicitly before Number().
  const fxOf = () => state.titleFx || (state.titleFx = defaultTitleFx());
  const fxHl = query.get('fxHighlight');
  if (fxHl && /^#[0-9a-fA-F]{6}$/.test(fxHl)) { fxOf().highlight = fxHl; fxOf().highlightOn = true; }
  if (query.get('fxHighlight') === '0') fxOf().highlightOn = false;
  const fxHlOpRaw = query.get('fxHighlightOpacity');
  if (fxHlOpRaw !== null) {
    const v = Number(fxHlOpRaw);
    if (!Number.isNaN(v) && v >= 0 && v <= 1) fxOf().highlightOpacity = v;
  }
  const fxStroke = query.get('fxStroke');
  if (fxStroke && /^#[0-9a-fA-F]{6}$/.test(fxStroke)) { fxOf().stroke = fxStroke; fxOf().strokeOn = true; }
  if (query.get('fxStroke') === '0') fxOf().strokeOn = false;
  const fxShadow = query.get('fxShadow');
  if (fxShadow && /^#[0-9a-fA-F]{6}$/.test(fxShadow)) { fxOf().shadow = fxShadow; fxOf().shadowOn = true; }
  if (query.get('fxShadow') === '0') fxOf().shadowOn = false;
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
  // v16: the new sticker kinds, with their own colours.
  if (query.get('stickers') === 'new') {
    state.stickers = [
      { kind: 'crown', x: 0.88, y: 0.12, size: 1.1, rot: 10, color: '#ffb400' },
      { kind: 'shades', x: 0.45, y: 0.82, size: 1, rot: -8, color: '#111111' },
      { kind: 'sparkle', x: 0.72, y: 0.72, size: 0.9, rot: 14, color: '#00e5ff' },
    ];
  }
  // v20: the three newest sticker kinds — palm tree, smiling sun,
  // cassette — one of each, spread across the three panels.
  if (query.get('stickers') === 'v20') {
    state.stickers = [
      { kind: 'palmtree', x: 0.12, y: 0.62, size: 1.3, rot: -6, color: '#2d8a4e' },
      { kind: 'sunface', x: 0.88, y: 0.55, size: 1.1, rot: 8, color: '#ffb400' },
      { kind: 'cassette', x: 0.5, y: 0.86, size: 1, rot: -4, color: '#ff2e88' },
    ];
  }
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
  // v9 Frames pack.
  const frame = query.get('frame');
  if (frame && FRAMES[frame]) state.frame = frame;
  // v17: the Neon Border glow colour (validated hex, else ignored).
  const frameColor = query.get('frameColor');
  if (frameColor && /^#[0-9a-fA-F]{6}$/.test(frameColor)) state.frameColor = frameColor;
  // v10 Freeform mode + print marks + canvas background.
  const canvasBg = query.get('canvasbg');
  if (canvasBg) {
    const bg = state.canvasBg || { kind: 'none', color: '#ff2e88', color2: '#00e5ff' };
    bg.kind = canvasBg;
    const c1 = query.get('bgcolor');
    if (c1 && /^#[0-9a-fA-F]{6}$/.test(c1)) bg.color = c1;
    const c2 = query.get('bgcolor2');
    if (c2 && /^#[0-9a-fA-F]{6}$/.test(c2)) bg.color2 = c2;
    state.canvasBg = bg;
  }
  if (query.get('printmarks') === '1') state.printMarks = true;
  if (query.get('freeform') === '1') {
    const ff = defaultFreeform();
    ff.on = true;
    ff.layout = state.layout;
    ff.items = freeformItemsFor(state.layout);
    const tilts = [-6, 5, -4, 3, -5];
    ff.items.forEach((it, i) => {
      it.rot = (it.rot || 0) + tilts[i % tilts.length];
      if (i === 1) it.x = Math.min(0.95 - it.w, it.x + 0.02);
      if (i === 3) it.y = Math.max(0, it.y - 0.02);
      it.modified = true;
    });
    ff.title = { x: 0.5, y: 0.55, rot: -4 };
    ff.titleMoved = true;
    state.freeform = ff;
  }
  const titlePos = query.get('titlePos');
  if (titlePos) {
    const parts = titlePos.split(',').map(Number);
    if (parts.length >= 2 && parts.slice(0, 2).every((v) => !Number.isNaN(v) && v >= 0 && v <= 1)) {
      if (!state.freeform) state.freeform = defaultFreeform();
      state.freeform.title = { x: parts[0], y: parts[1], rot: parts.length >= 3 && !Number.isNaN(parts[2]) ? parts[2] : 0 };
      state.freeform.titleMoved = true;
    }
  }
  // v13: logo / watermark params — logo=sample stamps the procedural VL
  // monogram (demo only); logoPos/logoSize/logoOpacity place it.
  if (query.get('logo') === 'sample') {
    const dataUrl = makeSampleLogoDataURL();
    if (dataUrl) {
      const pos = query.get('logoPos');
      if (pos && LOGO_POSITIONS[pos]) state.logo.position = pos;
      const lsize = Number(query.get('logoSize'));
      if (!Number.isNaN(lsize) && lsize > 0 && lsize <= 0.3) state.logo.size = lsize;
      // NB: Number(null) is 0 — an absent param must not zero the opacity.
      const lopRaw = query.get('logoOpacity');
      const lop = lopRaw === null ? NaN : Number(lopRaw);
      if (!Number.isNaN(lop) && lop >= 0 && lop <= 1) state.logo.opacity = lop;
      state.logo.dataUrl = dataUrl;
      try {
        const img = new Image();
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = dataUrl; });
        state.logoImg = img;
      } catch { state.logoImg = null; }
    }
  }
  // v12: 3D tilt params — tilt=x,y in degrees, plus perspective + shadow.
  // Parsed BEFORE syncButtons so the slider labels show the shot's tilt.
  const tiltParam = query.get('tilt');
  if (tiltParam) {
    const parts = tiltParam.split(',').map(Number);
    if (parts.length >= 2 && parts.slice(0, 2).every((v) => !Number.isNaN(v) && v >= -20 && v <= 20)) {
      state.tilt = state.tilt || { x: 0, y: 0, perspective: 900, shadow: 0.55 };
      state.tilt.x = parts[0];
      state.tilt.y = parts[1];
    }
  }
  const tiltPerspRaw = query.get('tiltPersp');
  const tiltPersp = tiltPerspRaw === null ? NaN : Number(tiltPerspRaw);
  if (!Number.isNaN(tiltPersp) && tiltPersp >= 400 && tiltPersp <= 1600) {
    state.tilt = state.tilt || { x: 0, y: 0, perspective: 900, shadow: 0.55 };
    state.tilt.perspective = tiltPersp;
  }
  // NB: Number(null) is 0 — an absent param must not zero the shadow.
  const tiltShadowRaw = query.get('tiltShadow');
  const tiltShadow = tiltShadowRaw === null ? NaN : Number(tiltShadowRaw);
  if (!Number.isNaN(tiltShadow) && tiltShadow >= 0 && tiltShadow <= 1) {
    state.tilt = state.tilt || { x: 0, y: 0, perspective: 900, shadow: 0.55 };
    state.tilt.shadow = tiltShadow;
  }
  // v21: the Tilt Pro shadow style (soft / hard / neon) for the shot.
  const tiltStyleRaw = query.get('tiltShadowStyle');
  if (tiltStyleRaw && ['soft', 'hard', 'neon'].includes(tiltStyleRaw)) {
    state.tilt = state.tilt || { x: 0, y: 0, perspective: 900, shadow: 0.55 };
    state.tilt.shadowStyle = tiltStyleRaw;
  }
  if (api.syncButtons) api.syncButtons();
  await loadDefaults();
  // v9 Smart Crop: after the samples load, so the focus comes from the real
  // photo (panel 1's photo by default).
  if (query.get('smartcrop') === '1' && api.runSmartCrop) api.runSmartCrop();
  // v9 Batch mode: after the samples + backdrops load, so the grid is built
  // from 5 distinct images + a repeat of the first.
  if (query.get('batch') === '1' && api.runBatch) {
    document.body.classList.add('shot-batch');
    api.runBatch();
  }
  // v13: session gallery — save the current cover twice (two titles) so
  // the editor shot shows a gallery with entries in it.
  if (query.get('gallery') === '1' && api.saveToGallery) {
    api.saveToGallery(`${state.title || 'VICE'} — landscape`);
    const savedTitle = state.title;
    state.title = 'VICE PRINT';
    if (api.syncButtons) api.syncButtons();
    redraw();
    api.saveToGallery('VICE PRINT — A4');
    state.title = savedTitle;
    if (api.syncButtons) api.syncButtons();
    redraw();
  }
  // v8: extract the dominant colours AFTER the samples load, so the swatch
  // row and the applied stops come from the real photo.
  if (query.get('extract') === '1' && api.runPaletteExtract) api.runPaletteExtract();
  // v17: colour harmony — after the samples load, so the scheme comes from
  // the real photo's dominant colour. harmony=<scheme> applies that scheme
  // to Title FX; harmony=1 only builds the 3 cards (editor shot).
  const harmonyParam = query.get('harmony');
  if (harmonyParam) {
    const img = state.photos[0] || state.photos[1] || null;
    const base = img ? (extractPalette(img)[0] || '#ff6b35') : '#ff6b35';
    if (harmonyParam === '1') {
      if (api.runHarmony) api.runHarmony();
    } else {
      applyHarmony(state, harmonyParam, base);
      if (api.syncButtons) api.syncButtons();
      redraw();
    }
  }
  if (query.get('suggest') === '1') {
    // Compact the Darkroom fieldset for the shot so the tone curve, the
    // sliders AND the 3 suggestion cards all fit in one 1280-tall frame.
    document.body.classList.add('shot-suggest');
    if (api.runSuggest) api.runSuggest();
  }
  // v19: History Timeline demo — four real gestures, so the strip shows
  // four labelled thumbnails plus the Now tile (after the samples load,
  // so the thumbnails are painted from the real photos).
  if (query.get('timeline') === '1' && api.runTimelineDemo) api.runTimelineDemo();
  // v7 Auto-caption: same photo reading, three ready titles.
  if (query.get('captions') === '1' && api.runCaptions) api.runCaptions();
  // v21: caption3=retro|breaking|liner — apply that Auto-caption v3 card
  // (title + tagline + cover lines) from the loaded photo's own pixel
  // reading, so a cover shot can wear a v3 caption without clicking.
  const caption3 = query.get('caption3');
  if (caption3) {
    const img3 = state.photos[(state.panels[0] || {}).photo || 0] || state.photos[0];
    if (img3) {
      const styleKey = { retro: 'Retro Ad', breaking: 'Breaking News', liner: 'Album Liner' }[String(caption3).toLowerCase()];
      const card = styleKey ? suggestCaptionsV3(analyzePhoto(img3)).find((c) => c.style === styleKey) : null;
      if (card) {
        state.title = card.title;
        state.tagline = card.tagline;
        if (card.coverLines) {
          state.coverLines = [...card.coverLines];
          state.coverLinesOn = true;
        }
      }
    }
  }
  // v22: Double Exposure — double=1 (screen) or a mode name blends a
  // second photo into a panel (panel 1, photo 2 by default).
  const doubleParam = query.get('double');
  if (doubleParam) {
    const mode = doubleParam === '1' ? 'screen' : doubleParam;
    if (BLEND_MODES[mode]) {
      // NB: Number(null) is 0 — an absent param must not become photo 0
      // (the base photo of panel 1), or the blend is refused as a no-op.
      const panelRaw = query.get('doublePanel');
      const panelIdx = panelRaw === null ? 0 : Number(panelRaw);
      const photoRaw = query.get('doublePhoto');
      const photoIdx = photoRaw === null ? 1 : Number(photoRaw);
      const opRaw = query.get('doubleOpacity');
      const op = opRaw === null ? 0.7 : Number(opRaw);
      applyDoubleExposure(
        state,
        Number.isInteger(panelIdx) && panelIdx >= 0 && panelIdx < state.panels.length ? panelIdx : 0,
        Number.isInteger(photoIdx) && photoIdx >= 0 && photoIdx < state.photos.length ? photoIdx : 1,
        mode,
        Number.isNaN(op) ? 0.7 : op,
      );
    }
  }
  // v23: Magazine Furniture — furniture=1 turns the barcode + issue line
  // on (after any template, so the param wins when both are given).
  if (query.get('furniture') === '1') {
    state.furniture = state.furniture || defaultFurniture();
    state.furniture.on = true;
    const fIssue = query.get('furnitureIssue');
    if (fIssue !== null) state.furniture.issue = clampFurnitureIssue(fIssue);
    const fDate = query.get('furnitureDate');
    if (fDate !== null) state.furniture.date = clampFurnitureDate(fDate);
    const fPrice = query.get('furniturePrice');
    if (fPrice !== null) state.furniture.price = clampFurniturePrice(fPrice);
    if (query.get('furnitureBarcode') === '0') state.furniture.barcode = false;
  }
  // v24: Vice Clock — clock=1 turns it on at 18:30 Golden Hour, any other
  // value sets the hour (after any template, so the param wins).
  const clockParam = query.get('clock');
  if (clockParam !== null) {
    state.timeOfDay = state.timeOfDay || defaultTimeOfDay();
    state.timeOfDay.on = true;
    state.timeOfDay.hour = clockParam === '1' ? 18.5 : clampTimeHour(clockParam);
  }
  // v25: Vice Weather — weather=<kind> turns it on with that kind,
  // weatherInt=<0-100> sets the intensity (after any template, so the
  // param wins when both are given).
  const weatherParam = query.get('weather');
  if (weatherParam !== null) {
    state.weather = state.weather || defaultWeather();
    state.weather.on = true;
    state.weather.kind = clampWeatherKind(weatherParam);
    const wi = query.get('weatherInt');
    if (wi !== null) state.weather.intensity = clampWeatherIntensity(Number(wi) / 100);
  }
  // v26: Vice Era — era=<year> turns it on with that year,
  // eraInt=<0-100> sets the intensity (after any template, so the
  // param wins when both are given).
  const eraParam = query.get('era');
  if (eraParam !== null) {
    state.era = state.era || defaultEra();
    state.era.on = true;
    state.era.era = clampEra(eraParam);
    const ei = query.get('eraInt');
    if (ei !== null) state.era.intensity = clampEraIntensity(Number(ei) / 100);
  }
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    // v12: mockup=<kind> renders that mockup scene (its own PNG size)
    // instead of the bare cover — the shot IS the mockup export.
    const mockup = query.get('mockup');
    if (mockup && MOCKUPS[mockup] && api.exportMockup) {
      const dims = MOCKUPS[mockup];
      canvas.width = dims.w;
      canvas.height = dims.h;
      const blob = await api.exportMockup(state, mockup);
      const url = URL.createObjectURL(blob);
      try {
        const img = new Image();
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
        canvas.getContext('2d').drawImage(img, 0, 0);
      } finally {
        URL.revokeObjectURL(url);
      }
      requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
      return;
    }
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
    } else if (focus === 'harmony') {
      // v17: scroll the Color harmony fieldset into view so the 3 scheme
      // cards (with their swatches) are visible in the editor shot.
      const el = document.getElementById('fs-harmony');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'batch') {
      const el = document.getElementById('fs-batch');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'fonts') {
      // v11: scroll the Title engine fieldset into view so the font
      // picker (title + tagline faces) is visible in the editor shot.
      const el = document.getElementById('fs-title');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'titlefx') {
      // v15: scroll the Title FX fieldset into view — its own panel, with
      // the Help list and the A/B compare right below it in the same frame.
      const el = document.getElementById('fs-titlefx');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'showcase') {
      // v12: scroll the 3D Tilt & Mockups fieldset into view so the tilt
      // sliders, presets and mockup buttons are visible in the editor shot.
      const el = document.getElementById('fs-showcase');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'gallery') {
      // v13: scroll the Session gallery fieldset into view so the saved
      // covers are visible in the editor shot.
      const el = document.getElementById('fs-gallery');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'export') {
      // v14: scroll the Export fieldset into view so the Export everything
      // button + progress bar are visible in the editor shot.
      const el = document.getElementById('fs-export');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'stickers') {
      // v16: scroll the Stickers fieldset into view — the 10 kinds, the
      // colour pickers and the Add button; the Export fieldset with the
      // Download ZIP button sits right below it in the same frame.
      const el = document.getElementById('fs-stickers');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'zip') {
      // v16: same fieldset as focus=export — the Download ZIP button
      // lives in the Export fieldset, next to Export everything.
      const el = document.getElementById('fs-export');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'freeform') {
      const el = document.getElementById('fs-freeform');
      if (el) el.scrollIntoView({ block: 'start' });
      if (api.freeformDemo) api.freeformDemo();
    } else if (focus === 'timeline') {
      // v19: scroll the History Timeline fieldset into view so the
      // labelled thumbnails + the Now tile are visible in the editor shot.
      const el = document.getElementById('fs-timeline');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'double') {
      // v22: scroll the Double Exposure fieldset into view so the blend
      // controls (mode, strength, swap) are visible in the editor shot.
      const el = document.getElementById('fs-double');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'furniture') {
      // v23: scroll the Magazine Furniture fieldset into view so the
      // barcode toggle + issue/date/price inputs are visible in the shot.
      const el = document.getElementById('fs-furniture');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'clock') {
      // v24: scroll the Vice Clock fieldset into view so the toggle, hour
      // slider + readout and the 5 time presets are visible in the shot.
      const el = document.getElementById('fs-clock');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'weather') {
      // v25: scroll the Vice Weather fieldset into view so the toggle,
      // intensity slider + readout and the 5 weather presets are visible
      // in the shot.
      const el = document.getElementById('fs-weather');
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (focus === 'era') {
      // v26: scroll the Vice Era fieldset into view so the toggle,
      // intensity slider + readout and the 5 era presets are visible
      // in the shot.
      const el = document.getElementById('fs-era');
      if (el) el.scrollIntoView({ block: 'start' });
    }
    // With Smart Suggest on, nudge down a little so the 3rd suggestion card
    // clears the bottom edge (the curve stays fully in frame).
    if (query.get('suggest') === '1') window.scrollBy(0, 40);
    // v15: A/B compare — open it without scrolling (the focus scroll
    // above already placed the Title FX + Help + compare stack in frame).
    if (query.get('ab') === '1' && api.openAB) await api.openAB(false);
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
