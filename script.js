document.addEventListener("DOMContentLoaded", function () {
  // Browser detection
  const userAgent = navigator.userAgent.toLowerCase();
  const isChrome =
    /chrome|crios/i.test(userAgent) &&
    !/opr|opera|chromium|edg|ucbrowser|googlebot/i.test(userAgent);
  const isFirefox =
    /firefox|fxios/i.test(userAgent) && !/seamonkey/i.test(userAgent);

  // Total Slide Count
  const totalSlides = document.querySelectorAll(".swiper-slide").length;
  const totalCountFormatted =
    totalSlides < 10 ? "0" + totalSlides : totalSlides;

  // Update all total count elements
  document.querySelectorAll(".total-count").forEach((el) => {
    el.textContent = "/ " + totalCountFormatted;
  });

  // Get counter data
  const swiperCounter = document.querySelector(".swiper-counter");
  const total_count = swiperCounter
    ? swiperCounter.getAttribute("data-counter")
    : "";

  // Update total count from data attribute if exists
  if (total_count) {
    document.querySelectorAll(".total-count").forEach((el) => {
      el.innerHTML = total_count;
    });
  }

  // Check if autoplay should be enabled
  const autoplaySlides = document.querySelectorAll(
    ".swiper-slide[data-swiper-autoplay]"
  );
  let autoplayConfig = false;

  if (autoplaySlides.length > 0) {
    const delay = parseInt(
      autoplaySlides[0].getAttribute("data-swiper-autoplay")
    );
    autoplayConfig = {
      delay: delay,
      disableOnInteraction: false,
    };
  }

  // Choose parallax mode based on browser
  if (isChrome || isFirefox) {
    parallax_skew();
  } else {
    parallax_default();
  }

  // Parallax Skew Mode (Chrome & Firefox with clip-path animations)
  function parallax_skew() {
    // Remove parallax attributes for custom animation
    document.querySelectorAll(".swiper-slide .slide-image").forEach((el) => {
      el.removeAttribute("data-swiper-parallax");
      el.removeAttribute("data-swiper-parallax-scale");
    });

    document.querySelectorAll(".slide-title-container").forEach((el) => {
      el.removeAttribute("data-swiper-parallax");
    });

    // Initialize Swiper
    const swiper = new Swiper(".swiper-container", {
      slidesPerView: 1,
      direction: "vertical",
      loop: true,
      speed: 0,
      autoplay: autoplayConfig,
      parallax: true,
      effect: "fade",
      watchOverflow: true,
      simulateTouch: false,
      allowTouchMove: false, // Neu: Touch-Bewegung deaktivieren
      mousewheel: {
        enabled: true,
        releaseOnEdges: true,
        sensitivity: 1,
        forceToAxis: true,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      on: {
        init: function () {
          // Fade in animation on load
          gsap.to(".swiper-container", {
            opacity: 1,
            duration: 0.8,
            ease: "power2.inOut",
          });
        },

        slideChange: function () {
          document.querySelectorAll(".swiper-slide").forEach((slide) => {
            slide.classList.remove("swiper-slide-nth-next-2");
          });
        },

        slidePrevTransitionStart: function () {
          // Swiper während Animation sperren
          this.allowSlideNext = false;
          this.allowSlidePrev = false;
          this.params.mousewheel.enabled = false;
          this.mousewheel.disable();

          const scrollLock = document.querySelector(".scroll-lock");
          if (scrollLock) scrollLock.style.display = "block";

          const activeIndex = this.activeIndex;
          const activeSlide = this.slides[activeIndex];
          const realIndex = activeSlide.getAttribute("data-swiper-slide-index");

          document.querySelectorAll(".swiper-slide").forEach((slide) => {
            slide.classList.remove("swiper-slide-nth-next-2");
          });

          const targetSlide = document.querySelector(
            `.swiper-slide[data-swiper-slide-index="${realIndex}"]`
          );
          if (targetSlide && targetSlide.nextElementSibling) {
            targetSlide.nextElementSibling.classList.add(
              "swiper-slide-nth-next-2"
            );
          }

          const nthNext2 = document.querySelector(".swiper-slide-nth-next-2");
          if (nthNext2) nthNext2.style.opacity = "1";

          const swiperInstance = this;

          gsap.to(".swiper-slide-nth-next-2", {
            clipPath: "polygon(0 100%, 100% 140%, 100% 140%, 0 100%)",
            duration: 1.2,
            delay: 0.1,
            ease: "power1.out",
          });

          gsap.to(".swiper-slide-nth-next-2", {
            clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
            duration: 0.6,
            delay: 0.4,
            ease: "power1.out",
            onComplete: function () {
              onCompleteUp(swiperInstance);
            },
          });

          function onCompleteUp(swiper) {
            const scrollLock = document.querySelector(".scroll-lock");
            if (scrollLock) scrollLock.style.display = "none";

            const activeSlide = document.querySelector(".swiper-slide-active");
            if (activeSlide) activeSlide.focus();

            document.querySelectorAll(".swiper-slide").forEach((slide) => {
              slide.style.clipPath = "";
            });

            const nthNext2 = document.querySelector(".swiper-slide-nth-next-2");
            if (nthNext2) nthNext2.style.opacity = "0";

            // Swiper wieder freigeben
            swiper.allowSlideNext = true;
            swiper.allowSlidePrev = true;
            swiper.params.mousewheel.enabled = true;
            swiper.mousewheel.enable();
          }
        },

        slideNextTransitionStart: function () {
          // Swiper während Animation sperren
          this.allowSlideNext = false;
          this.allowSlidePrev = false;
          this.params.mousewheel.enabled = false;
          this.mousewheel.disable();

          const scrollLock = document.querySelector(".scroll-lock");
          if (scrollLock) scrollLock.style.display = "block";

          document.querySelectorAll(".swiper-slide").forEach((slide) => {
            slide.classList.remove(
              "swiper-slide-nth-prev-2",
              "swiper-slide-nth-next-2"
            );
          });

          const prevSlide = document.querySelector(".swiper-slide-prev");
          if (prevSlide) {
            prevSlide.style.clipPath =
              "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
          }

          const swiperInstance = this;

          gsap.from(".swiper-slide-active", {
            clipPath: "polygon(0 130%, 100% 100%, 100% 100%, 0 100%)",
            duration: 1,
            delay: 0.1,
            onComplete: function () {
              onCompleteDown(swiperInstance);
            },
          });

          function onCompleteDown(swiper) {
            document.querySelectorAll(".swiper-slide").forEach((slide) => {
              slide.style.clipPath = "";
            });

            const scrollLock = document.querySelector(".scroll-lock");
            if (scrollLock) scrollLock.style.display = "none";

            const activeSlide = document.querySelector(".swiper-slide-active");
            if (activeSlide) activeSlide.focus();

            // Swiper wieder freigeben
            swiper.allowSlideNext = true;
            swiper.allowSlidePrev = true;
            swiper.params.mousewheel.enabled = true;
            swiper.mousewheel.enable();
          }
        },

        slideChangeTransitionStart: function () {
          document.querySelectorAll(".swiper-slide").forEach((slide) => {
            slide.style.clipPath = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
          });

          gsap.fromTo(
            ".swiper-slide-duplicate-active .slide-image, .swiper-slide-active .slide-image",
            { scale: 1.15 },
            {
              scale: 1,
              duration: 1.6,
              ease: "power4.out",
              delay: 0.15,
            }
          );
        },
      },
    });

    // Arrow down / scroll-sign click event
    const scrollSign = document.querySelector(".scroll-sign");
    if (scrollSign) {
      scrollSign.addEventListener("click", function (e) {
        e.preventDefault();
        if (swiper.allowSlideNext) {
          swiper.slideNext();
        }
      });
    }

    const arrowDown = document.querySelector(".arrow-down");
    if (arrowDown) {
      arrowDown.addEventListener("click", function (e) {
        e.preventDefault();
        if (swiper.allowSlideNext) {
          swiper.slideNext();
        }
      });
    }
  }

  // Parallax Default Mode (Safari and other browsers)
  function parallax_default() {
    const swiper = new Swiper(".swiper-container", {
      slidesPerView: 1,
      direction: "vertical",
      loop: true,
      cssMode: false, // cssMode deaktivieren für bessere Kontrolle
      speed: 1000,
      autoplay: autoplayConfig,
      parallax: true,
      effect: "slide",
      watchOverflow: true,
      simulateTouch: false,
      allowTouchMove: false, // Touch-Bewegung deaktivieren
      mousewheel: {
        enabled: true,
        releaseOnEdges: true,
        sensitivity: 1,
        forceToAxis: true,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      on: {
        init: function () {
          gsap.to(".swiper-container", {
            opacity: 1,
            duration: 0.8,
            ease: "power2.inOut",
          });
        },

        slideChangeTransitionStart: function () {
          // Swiper während Animation sperren
          this.allowSlideNext = false;
          this.allowSlidePrev = false;
          this.params.mousewheel.enabled = false;
          this.mousewheel.disable();
        },

        slideChangeTransitionEnd: function () {
          // Swiper nach Animation wieder freigeben
          this.allowSlideNext = true;
          this.allowSlidePrev = true;
          this.params.mousewheel.enabled = true;
          this.mousewheel.enable();
        },

        slideChange: function () {
          gsap.fromTo(
            ".swiper-slide-active .slide-image",
            { scale: 1.15 },
            {
              scale: 1,
              duration: 1.6,
              ease: "power4.out",
              delay: 0.15,
            }
          );
        },
      },
    });

    // Arrow down / scroll-sign click event
    const scrollSign = document.querySelector(".scroll-sign");
    if (scrollSign) {
      scrollSign.addEventListener("click", function (e) {
        e.preventDefault();
        if (swiper.allowSlideNext) {
          swiper.slideNext();
        }
      });
    }

    const arrowDown = document.querySelector(".arrow-down");
    if (arrowDown) {
      arrowDown.addEventListener("click", function (e) {
        e.preventDefault();
        if (swiper.allowSlideNext) {
          swiper.slideNext();
        }
      });
    }
  }
});
