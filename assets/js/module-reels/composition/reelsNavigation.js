export class ReelsNavigation {
  constructor({ state, dom, playback = null }) {
    this.state = state;
    this.dom = dom;
    this.playback = playback;
  }

  setPlayback(playback) {
    this.playback = playback;
  }

  getNavButtons() {
    if (!this.state.modalEl) {
      return { prevButton: null, nextButton: null };
    }

    return {
      prevButton: this.state.modalEl.querySelector('[data-reels-nav="prev"]'),
      nextButton: this.state.modalEl.querySelector('[data-reels-nav="next"]'),
    };
  }

  clearNavClasses() {
    const { prevButton, nextButton } = this.getNavButtons();

    prevButton?.classList.remove('has-media-prev', 'has-reel-prev');
    nextButton?.classList.remove('has-media-next', 'has-reel-next');
  }

  updateNavClasses(slideElement = this.dom.getActiveSlide()) {
    const { prevButton, nextButton } = this.getNavButtons();
    if (!prevButton || !nextButton) return;

    const swiper = this.state.modalSwiper;
    if (!slideElement || !swiper) {
      this.clearNavClasses();
      return;
    }

    const slots = this.dom.getSlideMediaSlots(slideElement);

    const hasMediaPrev = slots.length > 0 && this.state.activeSegmentIndex > 0;
    const hasMediaNext = slots.length > 0 && this.state.activeSegmentIndex < slots.length - 1;

    const hasReelPrev = swiper.activeIndex > 0;
    const hasReelNext = swiper.activeIndex < swiper.slides.length - 1;

    prevButton.classList.toggle('has-media-prev', hasMediaPrev);
    prevButton.classList.toggle('has-reel-prev', hasReelPrev);

    nextButton.classList.toggle('has-media-next', hasMediaNext);
    nextButton.classList.toggle('has-reel-next', hasReelNext);
  }

  setActiveSegment(slideElement, index) {
    const slots = this.dom.getSlideMediaSlots(slideElement);

    if (!slots.length) {
      this.state.activeSegmentIndex = 0;
      this.updateNavClasses(slideElement);
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, slots.length - 1));
    this.state.activeSegmentIndex = safeIndex;

    slots.forEach((slot, i) => {
      slot.classList.toggle('active', i === safeIndex);
    });

    this.updateNavClasses(slideElement);
  }

  goToSegment(slideElement, segmentIndex) {
    if (!slideElement) return;

    this.playback.stopProgress();
    this.state.holdElapsed = 0;

    this.setActiveSegment(slideElement, segmentIndex);
    this.playback.startActiveProgress({ resume: false });
  }

  nextSegmentOrSlide() {
    const activeSlide = this.dom.getActiveSlide();
    if (!activeSlide) return;

    const slots = this.dom.getSlideMediaSlots(activeSlide);

    if (this.state.activeSegmentIndex < slots.length - 1) {
      this.state.activeSegmentIndex += 1;
      this.state.holdElapsed = 0;
      this.setActiveSegment(activeSlide, this.state.activeSegmentIndex);
      this.playback.startActiveProgress({ resume: false });
      return;
    }

    const swiper = this.state.modalSwiper;
    if (!swiper) return;

    const isLastSlide = swiper.activeIndex >= swiper.slides.length - 1;
    if (isLastSlide) {
      this.state.modalInstance?.close?.();
      return;
    }

    swiper.slideNext();
  }

  prevSegmentOrSlide() {
    const activeSlide = this.dom.getActiveSlide();
    if (!activeSlide) return;

    if (this.state.activeSegmentIndex > 0) {
      this.state.holdElapsed = 0;
      this.setActiveSegment(activeSlide, this.state.activeSegmentIndex - 1);
      this.playback.startActiveProgress({ resume: false });
      return;
    }

    this.state.modalSwiper?.slidePrev();
  }

  handleSlideChange() {
    this.state.isHolding = false;
    this.state.holdElapsed = 0;
    this.state.activeSegmentIndex = 0;

    const activeSlide = this.dom.getActiveSlide();
    if (activeSlide) {
      this.setActiveSegment(activeSlide, 0);
    } else {
      this.clearNavClasses();
    }

    this.playback.startActiveProgress({ resume: false });
  }
}
