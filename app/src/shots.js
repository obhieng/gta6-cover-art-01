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
import { BACKDROPS, LOOKS, TEMPLATES, applyLook, applyTemplate } from './cover.js';

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
  if (api.syncButtons) api.syncButtons();
  await loadDefaults();
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
    const size = query.get('size') || 'landscape';
    const dims = {
      square: [1080, 1080],
      portrait: [1080, 1350],
      landscape: [1920, 1080],
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
    }
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
