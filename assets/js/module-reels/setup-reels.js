import { renderReels } from './render/reels-renderer.js';
import { initReels } from './facade/initReels.js';

export async function setupReels(stories = [], options = {}) {
  renderReels(stories);
  const module = await initReels(options);
  return module;
}
