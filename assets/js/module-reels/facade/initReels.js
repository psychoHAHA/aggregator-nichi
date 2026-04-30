import { ReelsModule } from './reelsModule.js';

export async function initReels(options = {}) {
  const module = new ReelsModule(options);
  await module.init();
  return module;
}
