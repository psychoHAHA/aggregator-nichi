export class ReelsDom {
  constructor(state) {
    this.state = state;
  }

  getActiveSlide() {
    if (!this.state.modalSwiper) return null;
    return this.state.modalSwiper.slides[this.state.modalSwiper.activeIndex] || null;
  }

  getSlideBars(slideElement) {
    return Array.from(slideElement?.querySelectorAll('[data-reels-progress]') || []);
  }

  getSlideMediaSlots(slideElement) {
    return Array.from(slideElement?.querySelectorAll('[data-reel-media]') || []);
  }

  getActiveMediaSlot(slideElement) {
    return slideElement?.querySelector('[data-reel-media].active') || null;
  }

  getActiveMediaElement(slideElement) {
    const slot = this.getActiveMediaSlot(slideElement);
    return slot?.querySelector('video, img') || null;
  }

  getActiveVideo(slideElement) {
    const media = this.getActiveMediaElement(slideElement);
    return media?.tagName === 'VIDEO' ? media : null;
  }

  getActiveMediaKind(slideElement) {
    const media = this.getActiveMediaElement(slideElement);
    if (!media) return null;
    return media.tagName === 'VIDEO' ? 'video' : 'image';
  }

  getActiveSegmentDuration(slideElement) {
    const slot = this.getActiveMediaSlot(slideElement);
    const raw = Number(slot?.dataset.duration ?? 0);

    if (Number.isFinite(raw) && raw > 0) {
      return raw;
    }

    return 0;
  }
}
