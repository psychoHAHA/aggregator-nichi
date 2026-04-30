import { normalizeReels } from '../../reels.contract.js';

export function fromWpData(raw = []) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeReels(item));
}
