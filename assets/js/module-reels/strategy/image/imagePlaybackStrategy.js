export class ImagePlaybackStrategy {
  constructor({ state, dom, playback, navigation }) {
    this.state = state;
    this.dom = dom;
    this.playback = playback;
    this.navigation = navigation;
  }

  play({ activeSlide, fromElapsed = 0 }) {
    if (!activeSlide || this.dom.getActiveMediaKind(activeSlide) !== 'image') return;

    const segmentDuration = this.dom.getActiveSegmentDuration(activeSlide);
    if (segmentDuration <= 0) {
      this.navigation.nextSegmentOrSlide();
      return;
    }

    this.state.holdElapsed = fromElapsed;
    this.state.holdStartedAt = performance.now() - this.state.holdElapsed;

    const tick = (now) => {
      if (!this.state.isModalOpened || this.state.isHolding) return;

      const elapsed = Math.min(now - this.state.holdStartedAt, segmentDuration);
      this.state.holdElapsed = elapsed;

      const percent = (elapsed / segmentDuration) * 100;
      this.playback.setSegmentProgress(activeSlide, percent);

      if (elapsed >= segmentDuration) {
        this.state.holdElapsed = 0;
        this.navigation.nextSegmentOrSlide();
        return;
      }

      this.state.rafId = requestAnimationFrame(tick);
    };

    this.state.rafId = requestAnimationFrame(tick);
  }

  pause({ activeSlide }) {
    if (!activeSlide) return;

    const segmentDuration = this.dom.getActiveSegmentDuration(activeSlide);
    if (segmentDuration <= 0) return;

    this.state.holdElapsed = Math.min(
      performance.now() - this.state.holdStartedAt,
      segmentDuration,
    );
  }

  seek({ slideElement, ratio }) {
    if (!slideElement) return;

    const segmentDuration = this.dom.getActiveSegmentDuration(slideElement);
    if (segmentDuration <= 0) return;

    this.state.holdElapsed = ratio * segmentDuration;
    this.state.holdStartedAt = performance.now() - this.state.holdElapsed;

    this.playback.setSegmentProgress(slideElement, ratio * 100);

    if (!this.state.isHolding && this.state.isModalOpened) {
      this.playback.startActiveProgress({ resume: true });
    }
  }
}
