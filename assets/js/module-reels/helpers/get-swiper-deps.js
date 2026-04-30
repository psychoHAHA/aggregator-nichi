let swiperDepsPromise;

export async function getSwiperDeps() {
  if (!swiperDepsPromise) {
    swiperDepsPromise = Promise.resolve().then(() => {
      const Swiper = window.Swiper;
      if (!Swiper) {
        throw new Error('Swiper is not available on window. Ensure swiper-bundle.min.js is loaded before script.js');
      }

      return {
        Swiper,
        Navigation: Swiper.Navigation || null,
        Pagination: Swiper.Pagination || null,
      };
    });
  }

  return swiperDepsPromise;
}
