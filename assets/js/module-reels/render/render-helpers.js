export function isVideoSrc(src = '') {
  return /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(src);
}

export function createProgressBar(index) {
  const bar = document.createElement('button');
  bar.type = 'button';
  bar.dataset.reelsProgress = '';
  bar.dataset.segmentIndex = String(index);
  return bar;
}

export function createStoryMediaEl(item, alt = '') {
  if (!item?.src) return null;

  if (isVideoSrc(item.src)) {
    const video = document.createElement('video');
    video.src = item.src;
    video.playsInline = true;
    video.preload = 'metadata';
    return video;
  }

  const img = document.createElement('img');
  img.src = item.src;
  img.alt = alt;
  img.loading = 'lazy';
  return img;
}
