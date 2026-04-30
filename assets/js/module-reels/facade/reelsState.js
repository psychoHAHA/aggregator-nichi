export class ReelsState {
  constructor() {
    this.previewSwiper = null;
    this.modalSwiper = null;
    this.modalEl = null;
    this.modalInstance = null;

    this.rafId = null;
    this.isModalOpened = false;
    this.isHolding = false;

    this.holdElapsed = 0;
    this.holdStartedAt = 0;
    this.onHoldPointerDown = null;

    this.pendingIndex = 0;
    this.activeSegmentIndex = 0;

    this.seekHandlers = [];
    this.previewHandlers = [];
    this.navHandlers = [];
  }

  resetPauseState() {
    this.isHolding = false;
    this.holdElapsed = 0;
    this.holdStartedAt = 0;
  }

  resetActiveSegment() {
    this.activeSegmentIndex = 0;
  }

  clearAnimationFrame() {
    if (!this.rafId) return;

    cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }
}
