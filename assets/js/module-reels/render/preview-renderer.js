export function renderReelsPreview(stories = []) {
  const wrapper = document.querySelector('[data-reels-preview-wrapper]');
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

    frag.append(slide);
  });

  wrapper.append(frag);
}
