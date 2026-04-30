import { ReelsState } from './reelsState.js';
import { ReelsDom } from '../composition/reelsDom.js';
import { ReelsNavigation } from '../composition/reelsNavigation.js';
import { ReelsBindings } from '../composition/reelsBindings.js';
import { ReelsPlayback } from '../composition/reelsPlayback.js';
import { getSwiperDeps } from '../helpers/get-swiper-deps.js';

export class ReelsModule {
  constructor(options = {}) {
    this.options = {
      previewSelector: '[data-reels-preview-trigger]',
      modalSwiperSelector: '[data-swiper="reels-modal"]',
      previewSwiperSelector: '[data-swiper="reels"]',
      previewSwiper: {},
      modalSwiper: {},
      modalId: 'reels',
      ...options,
    };

    this.state = new ReelsState();
    this.dom = new ReelsDom(this.state);

    this.navigation = new ReelsNavigation({
      state: this.state,
      dom: this.dom,
    });

    this.playback = new ReelsPlayback({
      state: this.state,
      dom: this.dom,
      navigation: this.navigation,
    });

    this.navigation.setPlayback(this.playback);

    this.bindings = new ReelsBindings({
      state: this.state,
      dom: this.dom,
      navigation: this.navigation,
      playback: this.playback,
      options: this.options,
    });
  }

  async init() {
    this.state.modalEl = document.querySelector(this.options.modalSwiperSelector);
    if (!this.state.modalEl) return;

    await this.initPreviewSwiper();
    await this.initModalSwiper();
    this.bindings.init();
  }

  async initPreviewSwiper() {
    const root = document.querySelector(this.options.previewSwiperSelector);
    if (!root) return;

    const swiperEl = root.querySelector('.swiper');
    if (!swiperEl) return;

    const { Swiper, Navigation, Pagination } = await getSwiperDeps();
    const modules = [Navigation, Pagination].filter(Boolean);

    const baseConfig = {
      slidesPerView: 3.4,
      spaceBetween: 8,

      breakpoints: {
        768: {
          slidesPerView: 6,
          spaceBetween: 10,
        },
        1280: {
          slidesPerView: 8,
          spaceBetween: 40,
        },
      },

      navigation: {
        nextEl: root.querySelector('.swiper-btn-reels-next'),
        prevEl: root.querySelector('.swiper-btn-reels-prev'),
      },
    };
    if (modules.length) {
      baseConfig.modules = modules;
    }

    const userConfig = this.options.previewSwiper || {};

    const previewConfig = {
      ...baseConfig,
      ...userConfig,
      breakpoints: {
        ...baseConfig.breakpoints,
        ...(userConfig.breakpoints || {}),
      },
      navigation: {
        ...baseConfig.navigation,
        ...(userConfig.navigation || {}),
      },
    };

    this.state.previewSwiper = new Swiper(swiperEl, previewConfig);
  }

  async initModalSwiper() {
    const { Swiper, Navigation, Pagination } = await getSwiperDeps();
    const modules = [Navigation, Pagination].filter(Boolean);

    const baseConfig = {
      slidesPerView: 1,
      spaceBetween: 40,
      centeredSlides: true,
      slideToClickedSlide: true,
      watchSlidesProgress: true,
      watchOverflow: true,

      breakpoints: {
        768: {
          slidesPerView: 2.5,
        },
        1200: {
          slidesPerView: 3.8,
        },
      },
    };
    if (modules.length) {
      baseConfig.modules = modules;
    }

    const userConfig = this.options.modalSwiper || {};

    const modalConfig = {
      ...baseConfig,
      ...userConfig,
      breakpoints: {
        ...baseConfig.breakpoints,
        ...(userConfig.breakpoints || {}),
      },
    };

    this.state.modalSwiper = new Swiper(this.state.modalEl, modalConfig);
  }

  destroy() {
    this.bindings.destroy();
    this.playback.stopProgress();
    this.playback.stopAllVideos(true);

    this.state.modalSwiper?.destroy(true, true);
    this.state.modalSwiper = null;

    this.state.previewSwiper?.destroy(true, true);
    this.state.previewSwiper = null;
  }
}
