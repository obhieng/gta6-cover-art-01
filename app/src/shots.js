// Fixed scenes for screenshots: ?shot=editor shows the editor with the samples
// loaded; ?shot=cover shows the cover alone at the requested size.
// window.__shotReady is set once the scene is painted.
// Extra query params: ink=1 (comic-ink on every panel), inkLevel=1..5,
// backdrop=<key>, blend=<mode>.
import { BACKDROPS } from './cover.js';

export async function runShot(shot, query, api) {
  const { state, loadDefaults, redraw, canvas } = api;
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
    redraw();
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
