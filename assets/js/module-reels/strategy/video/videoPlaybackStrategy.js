export class VideoPlaybackStrategy {
  constructor({ state, dom, playback, navigation }) {
    this.state = state;
    this.dom = dom;
    this.playback = playback;
    this.navigation = navigation;
  }

  play({ activeSlide, resume = false }) {
    if (!activeSlide || this.dom.getActiveMediaKind(activeSlide) !== 'video') return;

    const video = this.dom.getActiveVideo(activeSlide);
    if (!video) return;

    const runVideo = () => {
      if (!resume) {
        try {
          video.currentTime = 0;
        } catch {}

        this.playback.setSegmentProgress(activeSlide, 0);
      }

      video.playsInline = true;

      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }

      const tick = () => {
        if (!this.state.isModalOpened || this.state.isHolding) return;

        const duration = video.duration || 0;
        if (duration > 0) {
          const percent = Math.min((video.currentTime / duration) * 100, 100);
          this.playback.setSegmentProgress(activeSlide, percent);

          if (video.ended || video.currentTime >= duration - 0.05) {
            this.navigation.nextSegmentOrSlide();
            return;
          }
        }

        this.state.rafId = requestAnimationFrame(tick);
      };

      this.state.rafId = requestAnimationFrame(tick);
    };

    if (video.readyState >= 1) {
      runVideo();
    } else {
      video.addEventListener('loadedmetadata', runVideo, { once: true });
      video.load();
    }
  }

  pause({ activeSlide }) {
    if (!activeSlide) return;

    this.dom.getActiveVideo(activeSlide)?.pause();
  }

  seek({ slideElement, ratio }) {
    if (!slideElement) return;

    const video = this.dom.getActiveVideo(slideElement);
    if (!video) return;

    const applySeek = () => {
      const duration = video.duration || 0;
      if (!duration) return;

      video.currentTime = ratio * duration;
      this.playback.setSegmentProgress(slideElement, ratio * 100);

      if (!this.state.isHolding && this.state.isModalOpened) {
        this.playback.startActiveProgress({ resume: true });
      }
    };

    if (video.readyState >= 1) {
      applySeek();
    } else {
      video.addEventListener('loadedmetadata', applySeek, { once: true });
      video.load();
    }
  }
}
