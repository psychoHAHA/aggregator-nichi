// Fonts
const fontRG = new FontFace(
  'Random Grotesque Spacious',
  'url("/assets/css/RG-Spacious/RG-SpaciousRegular.woff2")',
)
const fontCygre = new FontFace(
  'Cygre',
  'url("/assets/css/Cygre/Cygre-Regular.woff2")',
)

import { initCookieConsent } from './vendors/cookie.js'

document.fonts.add(fontRG)
document.fonts.add(fontCygre)

new (class Frontend {
  constructor() {
    this.smoother = null

    $(() => {
      this.setGastronomySwiper()
      // this.setReviewsSwiper()
      this.setReviewsSlider()
      this.setBlogSlider()
    })

    Promise.all([fontRG.load(), fontCygre.load(), document.fonts.ready]).then(
      () => {
        // this.initScroll();
        this.initAnimations()
        ScrollTrigger.refresh()
      },
    )
  }

  /* =====================
        SCROLL SMOOTHER
    ===================== */

  initScroll() {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText)

    if (this.smoother) this.smoother.kill()

    this.smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.2,
      effects: true,
      smoothTouch: false,
      normalizeScroll: true,
      ignoreMobileResize: true,
    })
  }

  /* =====================
     SWIPERS
  ===================== */

  setGastronomySwiper() {
    const next = $('.gastronomy__gallery-nav .swiper-button-next')
    const prev = $('.gastronomy__gallery-nav .swiper-button-prev')

    const smWrapper = $('.gastronomy__gallery-sm .swiper-wrapper')
    const smSlides = smWrapper.find('.swiper-slide')
    smSlides.last().prependTo(smWrapper)

    const smSwiper = new Swiper('.gastronomy__gallery-sm .swiper', {
      allowTouchMove: false,
      loop: true,
      parallax: true,
    })

    const mainSwiper = new Swiper('.gastronomy__gallery-main .swiper', {
      allowTouchMove: false,
      loop: true,
      parallax: true,
      speed: 1000,
      controller: {
        control: smSwiper,
      },
      navigation: {
        nextEl: next[0],
        prevEl: prev[0],
      },
    })

    mainSwiper.on('init resize update', () => {
      ScrollTrigger.refresh()
    })
  }

  // setReviewsSwiper() {
  //   new Swiper('.reviews__slider .swiper', {
  //     speed: 800,
  //     slidesPerView: 1,
  //     spaceBetween: 0,
  //     navigation: {
  //       nextEl: '.reviews__slider .swiper-button-next',
  //       prevEl: '.reviews__slider .swiper-button-prev',
  //     },
  //     breakpoints: {
  //       992: {
  //         slidesPerView: 3,
  //       },
  //     },
  //   })
  // }

  setReviewsSlider() {
    const sliderEl = document.querySelector('.reviews__slider');
    // Если самого слайдера нет, выходим сразу
    if (!sliderEl || !window.Swiper) return;

    const prev = document.querySelector('.reviews__button--prev');
    const next = document.querySelector('.reviews__button--next');

    new window.Swiper(sliderEl, {
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 8,
      navigation: {
        prevEl: prev ? prev : undefined,
        nextEl: next ? next : undefined,
      },
      breakpoints: {
        328: { slidesPerView: 1.2 },
        768: {
          slidesPerView: 2,
          slidesPerGroup: 1,
          spaceBetween: 16,
        },
        1200: {
          slidesPerView: 3,
          slidesPerGroup: 1,
          spaceBetween: 20,
        },
      },
    });
  }
  setBlogSlider() {
    const sliderEl = document.querySelector('.blog__slider')
    if (!sliderEl || !window.Swiper) return

    new window.Swiper(sliderEl, {
      slidesPerView: 1,
      slidesPerGroup: 1,
      spaceBetween: 8,
      navigation: {
        prevEl: '.blog__button--prev',
        nextEl: '.blog__button--next',
      },
      breakpoints: {
        328: {
          slidesPerView: 1.15,
        },
        768: {
          slidesPerView: 2,
          slidesPerGroup: 1,
          spaceBetween: 16,
        },
        1200: {
          slidesPerView: 3,
          slidesPerGroup: 1,
          spaceBetween: 20,
        },
      },
    })
  }

  /* =====================
     ANIMATIONS
  ===================== */

  initAnimations() {
    /* TEXT — LIGHT REVEAL */

    document.querySelectorAll('[data-animate-text]').forEach((el) => {
      const split = new SplitText(el, {
        type: 'lines',
        linesClass: 'split-line',
      })

      gsap.from(split.lines, {
        y: 80,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: el,
          start: 'top 75%',
          once: true,
          onLeave: () => split.revert(),
        },
      })
    })

    /* IMAGES — HEAVY REVEAL */

    document
      .querySelectorAll(
        '.base-gallery, .intro-banner__image, .interior, .gastronomy__content-asset, .gastronomy .swiper-slide:first-child',
      )
      .forEach((container) => {
        const images = container.querySelectorAll('img')
        if (!images.length) return

        gsap.from(images, {
          y: 140,
          opacity: 0,
          duration: 1.4,
          ease: 'power3.out',
          stagger: images.length > 1 ? 0.2 : 0,
          scrollTrigger: {
            trigger: container,
            start: 'top 75%',
            once: true,
          },
        })
      })

    /* FADE IN — NEUTRAL */

    document.querySelectorAll('[data-animation-fadein]').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 10,
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true,
        },
      })
    })
  }
})()

class ReservationForm {
  constructor() {
    // date input
    this.$dateInput = $('.js-reservation-date-input')

    // guests input
    this.$guestsInput = $('.js-reservation-guests-input')
    this.$btnIncrement = $('.js-increment')
    this.$btnDecrement = $('.js-decrement')

    // internal state
    this.MIN = 1
    this.MAX = 20 // можно поставить лимит по гостям
    this.guests = 1

    this.init()
  }

  init() {
    this.initCalendar()
    this.initGuestsCounter()
    this.updateGuestsInput()
  }

  // ------------------------------------------------------------
  // Calendar (дата посещения)
  // ------------------------------------------------------------
  initCalendar() {
    this.$dateInput.daterangepicker({
      singleDatePicker: true,
      autoUpdateInput: false,
      minDate: moment(),
      locale: {
        format: 'DD.MM.YYYY',
        applyLabel: 'Сохранить',
        cancelLabel: 'Назад',
        daysOfWeek: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        monthNames: [
          'Январь',
          'Февраль',
          'Март',
          'Апрель',
          'Май',
          'Июнь',
          'Июль',
          'Август',
          'Сентябрь',
          'Октябрь',
          'Ноябрь',
          'Декабрь',
        ],
        firstDay: 1,
      },
    })

    this.$dateInput.attr('autocomplete', 'off')

    this.$dateInput.on('apply.daterangepicker', (ev, picker) => {
      this.$dateInput
        .val(picker.startDate.format('DD.MM.YYYY'))
        .trigger('change')
    })
  }

  // ------------------------------------------------------------
  // Guests counter
  // ------------------------------------------------------------
  initGuestsCounter() {
    this.$btnIncrement.on('click', () => {
      if (this.guests < this.MAX) {
        this.guests++
        this.updateGuestsInput()
      }
    })

    this.$btnDecrement.on('click', () => {
      if (this.guests > this.MIN) {
        this.guests--
        this.updateGuestsInput()
      }
    })
  }

  updateGuestsInput() {
    this.$guestsInput.val(this.guests)
    this.$btnDecrement.toggleClass('disabled', this.guests === this.MIN)
    this.$btnIncrement.toggleClass('disabled', this.guests === this.MAX)
  }
}

// Инициализация
$(document).ready(() => {
  new ReservationForm()
})

document.addEventListener('DOMContentLoaded', async () => {
  const { setupReels } = await import('./module-reels/setup-reels.js')
  const reelsMock = window.__REELS_MOCK__
  if (reelsMock?.length) {
    setupReels(reelsMock, {
      previewSwiper: {
        centerInsufficientSlides: true,
        slidesPerView: 4,
        spaceBetween: 12,
        breakpoints: {
          328: {
            slidesPerView: 3.2,
            spaceBetween: 8,
          },
          768: { slidesPerView: 5 },
          1280: { slidesPerView: 8, spaceBetween: 8 },
        },
      },
      modalSwiper: {
        spaceBetween: 24,
        breakpoints: {
          768: { slidesPerView: 2.2 },
          1200: { slidesPerView: 5 },
        },
      },
    })
  }

  const runCookieConsent = () => {
    const phpSettings = window.themeSettings?.cookieConsent
    if (!phpSettings) return

    initCookieConsent({
      expireDays: 30,
      ...phpSettings,
      cookieTitleHTML:
        phpSettings.cookieTitleHTML ?? phpSettings.cookieTitle,
      onAccept: () => { },
    })
  }
  runCookieConsent()

  const infoSliders = document.querySelectorAll('.info__slider-wrapper')

  if (infoSliders.length) {
    const SwiperCtor = window.Swiper
    if (!SwiperCtor) {
      console.error('[info] Swiper is not available on window.')
      return
    }

    infoSliders.forEach((wrapper) => {
      const slider = wrapper.querySelector('.info__slider')
      if (!slider) return

      new SwiperCtor(slider, {
        loop: false,
        speed: 800,
        effect: 'fade',
        fadeEffect: {
          crossFade: true,
        },
        slidesPerView: 1,

        navigation: {
          nextEl: wrapper.querySelector('.info__button--next'),
          prevEl: wrapper.querySelector('.info__button--prev'),
        },

        pagination: {
          el: wrapper.querySelector('.info__slider-pagination'),
          clickable: true,
        },
      })
    })
  }

  const { initVGMap } = await import('./vendors/victorymap.js')
  initVGMap()

  function initReviewsModal() {
    const modalElement = document.querySelector('[data-modal="modalReviews"]')
    const modalContent = modalElement?.querySelector(
      '[data-reviews-modal-content]',
    )
    const triggers = document.querySelectorAll('.reviews__slide-button')

    if (!modalElement || !modalContent || !triggers.length) return

    const fillModalFromSlide = (slide) => {
      modalContent.innerHTML = ''
      if (!slide) return

      const top = slide.querySelector('.reviews__slide-top')
      const content = slide.querySelector('.reviews__slide-content')

      if (top) {
        modalContent.appendChild(top.cloneNode(true))
      }

      if (content) {
        modalContent.appendChild(content.cloneNode(true))
      }
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const slide = trigger.closest('.reviews__slide')
        fillModalFromSlide(slide)
      })
    })

    const reviewsModal = Modals.getModal('modalReviews')
    if (!modalElement) return

    reviewsModal.onClose(() => {
      modalContent.innerHTML = ''
    })
  }

  initReviewsModal()

  /**
 * Кнопка «Смотреть больше» только если текст отзыва длиннее порога (обрезан в карточке).
 */
  const REVIEWS_TEXT_MAX_LEN = 200

  function initReviewsSlideButtonVisibility() {
    const reviewTexts = document.querySelectorAll(
      'section.reviews .reviews__slider .reviews__slide-content',
    )

    if (reviewTexts.length === 0) return

    reviewTexts.forEach((textElement) => {
      const content = textElement.textContent.trim()
      const slideContainer = textElement.closest('.reviews__slide')

      if (!slideContainer) return

      const button = slideContainer.querySelector('.reviews__slide-button')
      if (!button) return

      if (content.length > REVIEWS_TEXT_MAX_LEN) {
        button.style.display = 'flex'
      } else {
        button.style.display = 'none'
      }
    })
  }

  initReviewsSlideButtonVisibility()
})
