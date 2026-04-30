import { createProgressBar, createStoryMediaEl } from './render-helpers.js';

export function renderReelsModal(stories = []) {
  const wrapper = document.querySelector('[data-reels-modal-wrapper]');
  const tpl = wrapper?.querySelector('template');
  if (!wrapper || !tpl) return;

  wrapper.querySelectorAll('.swiper-slide[data-generated="1"]').forEach((el) => el.remove());

  const frag = document.createDocumentFragment();

  stories.forEach((story) => {
    const slide = tpl.content.firstElementChild.cloneNode(true);
    slide.dataset.generated = '1';

    slide.querySelectorAll('[data-reel]').forEach((el) => {
      const key = el.dataset.reel;
      const value = story[key] ?? '';
      const attr = el.dataset.reelAttr;

      if (attr) {
        el.setAttribute(attr, value);
      } else {
        el.textContent = value;
      }
    });

    if (!story.avatar) {
      const avatarImg = slide.querySelector('img[data-reel="avatar"]');
      avatarImg?.parentElement?.remove();
    }

    const barsRoot = slide.querySelector('[data-reel-progress-bars]');
    const mediasRoot = slide.querySelector('[data-reel-medias]');

    if (barsRoot) {
      barsRoot.replaceChildren();

      (story.items || []).forEach((_, index) => {
        const bar = createProgressBar(index);
        barsRoot.append(bar);
      });
    }

    if (mediasRoot) {
      mediasRoot.replaceChildren();

      (story.items || []).forEach((item, index) => {
        const mediaSlot = document.createElement('div');
        mediaSlot.dataset.reelMedia = '';
        mediaSlot.dataset.segmentIndex = String(index);
        mediaSlot.dataset.duration = String(item.duration ?? 0);

        if (index === 0) {
          mediaSlot.classList.add('active');
        }

        const mediaEl = createStoryMediaEl(item, story.title || 'Рилс');
        if (mediaEl) {
          mediaSlot.append(mediaEl);
        }

        mediasRoot.append(mediaSlot);
      });
    }

    frag.append(slide);
  });

  wrapper.append(frag);
}
