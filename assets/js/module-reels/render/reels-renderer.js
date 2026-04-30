import { renderReelsPreview } from './preview-renderer.js';
import { renderReelsModal } from './modal-renderer.js';

export function renderReels(stories = []) {
  renderReelsPreview(stories);
  renderReelsModal(stories);
}
