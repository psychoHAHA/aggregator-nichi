import { maxOfMin } from '../helpers/helper.js';

export class ReelsBindings {
  constructor({ state, dom, navigation, playback, options }) {
    this.state = state;
    this.dom = dom;
    this.navigation = navigation;
    this.playback = playback;
    this.options = options;

    this.onPointerUp = this.playback.resumeHold.bind(this.playback);
    this.onPointerCancel = this.playback.resumeHold.bind(this.playback);
    this.onSlideChange = this.navigation.handleSlideChange.bind(this.navigation);
    this.onCloseReelsClick = this.handleCloseReelsClick.bind(this);

    this.hasErrorWithModal = false;
  }

  init() {
    this.bindPreviewTriggers();
    this.bindProgressSeek();
    this.bindHoldEvents();
    this.bindSegmentNav();
    this.bindCloseReelsTriggers();
    this.bindModalLifecycle();
  }

  destroy() {
    if (this.state.onHoldPointerDown) {
      this.state.modalEl?.removeEventListener('pointerdown', this.state.onHoldPointerDown);
      this.state.onHoldPointerDown = null;
    }

    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerCancel);
    document.removeEventListener('click', this.onCloseReelsClick);

    this.state.seekHandlers.forEach(({ bar, onPointerDown }) => {
      bar.removeEventListener('pointerdown', onPointerDown);
    });
    this.state.seekHandlers = [];

    this.state.previewHandlers.forEach(({ trigger, onClick }) => {
      trigger.removeEventListener('click', onClick);
    });
    this.state.previewHandlers = [];

    this.state.navHandlers.forEach(({ button, onClick }) => {
      button.removeEventListener('click', onClick);
    });
    this.state.navHandlers = [];

    this.state.modalSwiper?.off('slideChange', this.onSlideChange);
  }

  bindPreviewTriggers() {
    const triggers = document.querySelectorAll(this.options.previewSelector);
    if (!triggers.length || !this.state.modalSwiper) return;

    triggers.forEach((trigger) => {
      const onClick = () => {
        const slide = trigger.closest('.swiper-slide') || trigger;
        const slides = Array.from(slide.parentElement.querySelectorAll('.swiper-slide'));
        const idx = slides.indexOf(slide);

        this.state.pendingIndex = Math.max(0, idx);

        if (this.state.isModalOpened) {
          this.state.modalSwiper.slideTo(this.state.pendingIndex, 0);
          return;
        }

        const modalInstance = this.getModalInstance();
        modalInstance?.open();
      };

      trigger.addEventListener('click', onClick);
      this.state.previewHandlers.push({ trigger, onClick });
    });
  }

  bindSegmentNav() {
    if (!this.state.modalEl) return;

    const buttons = this.state.modalEl.querySelectorAll('[data-reels-nav]');

    buttons.forEach((button) => {
      const onClick = (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (button.dataset.reelsNav === 'prev') {
          this.navigation.prevSegmentOrSlide();
        } else {
          this.navigation.nextSegmentOrSlide();
        }
      };

      button.addEventListener('click', onClick);
      this.state.navHandlers.push({ button, onClick });
    });
  }

  bindProgressSeek() {
    if (!this.state.modalEl || !this.state.modalSwiper) return;

    const bars = this.state.modalEl.querySelectorAll('[data-reels-progress]');

    bars.forEach((bar) => {
      const onPointerDown = (event) => {
        event.preventDefault();
        event.stopPropagation();

        const slideElement = bar.closest('.swiper-slide');
        if (!slideElement) return;

        const segmentIndex = Number(bar.dataset.segmentIndex ?? 0);
        const isActiveSlide = slideElement.classList.contains('swiper-slide-active');

        const handleActiveBar = () => {
          const activeSlide = this.dom.getActiveSlide();
          if (!activeSlide) return;

          if (segmentIndex === this.state.activeSegmentIndex) {
            const rect = bar.getBoundingClientRect();
            const ratio = maxOfMin((event.clientX - rect.left) / rect.width);
            this.playback.seekActiveSlideToRatio(activeSlide, ratio);
            return;
          }

          this.navigation.goToSegment(activeSlide, segmentIndex);
        };

        if (!isActiveSlide) {
          const slideIndex = Array.from(this.state.modalSwiper.slides).indexOf(slideElement);
          if (slideIndex < 0) return;

          this.state.modalSwiper.slideTo(slideIndex);
          this.state.modalSwiper.once('slideChangeTransitionEnd', () => {
            const activeSlide = this.dom.getActiveSlide();
            if (!activeSlide) return;
            this.navigation.goToSegment(activeSlide, segmentIndex);
          });
          return;
        }

        handleActiveBar();
      };

      bar.addEventListener('pointerdown', onPointerDown);
      this.state.seekHandlers.push({ bar, onPointerDown });
    });
  }

  bindHoldEvents() {
    if (!this.state.modalEl) return;

    this.state.onHoldPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (event.target.closest('[data-reels-nav]')) return;
      if (event.target.closest('[data-reels-progress]')) return;
      if (event.target.closest('.button')) return;

      this.playback.pauseHold();
    };

    this.state.modalEl.addEventListener('pointerdown', this.state.onHoldPointerDown);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerCancel);
  }

  bindModalLifecycle() {
    if (!this.state.modalSwiper) return;

    this.state.modalSwiper.on('slideChange', this.onSlideChange);

    const modalInstance = this.getModalInstance();
    if (!modalInstance) return;

    modalInstance.onOpen(() => {
      this.state.isModalOpened = true;
      this.state.resetPauseState();
      this.state.resetActiveSegment();

      this.state.modalSwiper.update();
      this.state.modalSwiper.slideTo(this.state.pendingIndex, 0);
      this.navigation.handleSlideChange();
    });

    modalInstance.onClose(() => {
      this.state.isModalOpened = false;
      this.state.resetPauseState();

      this.playback.stopProgress();
      this.playback.stopAllVideos(true);
      this.playback.resetAllProgress();
    });
  }

  bindCloseReelsTriggers() {
    document.removeEventListener('click', this.onCloseReelsClick);
    document.addEventListener('click', this.onCloseReelsClick);
  }

  handleCloseReelsClick(event) {
    const trigger = event.target.closest('[data-close-reels]');
    if (!trigger) return;

    const modalInstance = this.getModalInstance();
    modalInstance?.close?.();
  }

  getModalInstance() {
    if (this.state.modalInstance) {
      return this.state.modalInstance;
    }

    const modals = window.Modals;
    const isInitialized = Boolean(modals?._isInitialized);

    if (!modals || !isInitialized) {
      this.logModalError(
        '[reels] vgmodals не инициализирован. Установите/подключите vgmodals до setupReels().',
      );
      return null;
    }

    const modalId = this.options.modalId || 'reels';
    const instance = modals.getModal(modalId);

    if (!instance) {
      this.logModalError(`[reels] Модальное окно "${modalId}" не найдено.`);
      return null;
    }

    this.state.modalInstance = instance;
    return instance;
  }

  logModalError(message) {
    if (this.hasErrorWithModal) return;
    this.hasErrorWithModal = true;
    console.error(message);
  }
}
