import { maxOfMin } from '../helpers/helper.js';
import { ImagePlaybackStrategy } from '../strategy/image/imagePlaybackStrategy.js';
import { VideoPlaybackStrategy } from '../strategy/video/videoPlaybackStrategy.js';

export class ReelsPlayback {
  constructor({ state, dom, navigation = null }) {
    this.state = state;
    this.dom = dom;
    this.navigation = navigation;

    this.imageStrategy = new ImagePlaybackStrategy({
      state: this.state,
      dom: this.dom,
      playback: this,
      navigation: this.navigation,
    });

    this.videoStrategy = new VideoPlaybackStrategy({
      state: this.state,
      dom: this.dom,
      playback: this,
      navigation: this.navigation,
    });
  }

  setNavigation(navigation) {
    this.navigation = navigation;
    this.imageStrategy.navigation = navigation;
    this.videoStrategy.navigation = navigation;
  }

  setSegmentProgress(slideElement, percent) {
    const bars = this.dom.getSlideBars(slideElement);
    if (!bars.length) return;

    const safePercent = Math.max(0, Math.min(100, percent));

    bars.forEach((bar, index) => {
      let value = 0;

      if (index < this.state.activeSegmentIndex) {
        value = 100;
      } else if (index === this.state.activeSegmentIndex) {
        value = safePercent;
      }

      bar.style.setProperty('--progress', `${value}%`);
    });
  }

  resetAllProgress() {
    if (!this.state.modalSwiper) return;

    this.state.modalSwiper.slides.forEach((slide) => {
      this.dom.getSlideBars(slide).forEach((bar) => {
        bar.style.setProperty('--progress', '0%');
      });
    });
  }

  stopProgress() {
    if (!this.state.rafId) return;

    cancelAnimationFrame(this.state.rafId);
    this.state.rafId = null;
  }

  stopAllVideos(reset = false) {
    if (!this.state.modalEl) return;

    this.state.modalEl.querySelectorAll('video').forEach((video) => {
      video.pause();

      if (reset) {
        try {
          video.currentTime = 0;
        } catch {}
      }
    });
  }

  stopSlideVideos(slideElement, reset = false) {
    this.dom.getSlideMediaSlots(slideElement).forEach((slot) => {
      const video = slot.querySelector('video');
      if (!video) return;

      video.pause();

      if (reset) {
        try {
          video.currentTime = 0;
        } catch {}
      }
    });
  }

  startActiveProgress({ resume = false } = {}) {
    this.stopProgress();

    const activeSlide = this.dom.getActiveSlide();
    if (!activeSlide) return;

    if (!resume) {
      this.resetAllProgress();
      this.stopAllVideos(true);
      this.state.holdElapsed = 0;
    }

    if (this.dom.getActiveMediaKind(activeSlide) === 'video') {
      this.videoStrategy.play({ activeSlide, resume });
      return;
    }

    this.imageStrategy.play({
      activeSlide,
      fromElapsed: resume ? this.state.holdElapsed : 0,
    });
  }

  pauseHold() {
    if (!this.state.isModalOpened || this.state.isHolding) return;

    this.state.isHolding = true;
    this.stopProgress();

    const activeSlide = this.dom.getActiveSlide();
    if (!activeSlide) return;

    if (this.dom.getActiveMediaKind(activeSlide) === 'video') {
      this.videoStrategy.pause({ activeSlide });
      return;
    }

    this.imageStrategy.pause({ activeSlide });
  }

  resumeHold() {
    if (!this.state.isModalOpened || !this.state.isHolding) return;

    this.state.isHolding = false;
    this.startActiveProgress({ resume: true });
  }

  seekActiveSlideToRatio(slideElement, ratio) {
    const safeRatio = maxOfMin(ratio);
    const kind = this.dom.getActiveMediaKind(slideElement);
    if (!kind) return;

    if (kind === 'video') {
      this.videoStrategy.seek({
        slideElement,
        ratio: safeRatio,
      });
      return;
    }

    this.imageStrategy.seek({
      slideElement,
      ratio: safeRatio,
    });
  }
}
