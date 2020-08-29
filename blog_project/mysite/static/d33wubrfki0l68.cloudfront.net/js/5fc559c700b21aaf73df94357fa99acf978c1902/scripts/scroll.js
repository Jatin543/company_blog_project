;(function(){

  document.body.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // I'm sorry, Edge has bugs with position: sticky and performance issues. Too low market share for us to optimise :/
  if (/Edge/.test(navigator.userAgent)) {
    reduceMotion = true;

    document.body.classList.add('reduced-motion');
  }

  // Check for IntersectObserver support
  if (!'IntersectionObserver' in window ||
      !'IntersectionObserverEntry' in window ||
      !'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
    reduceMotion = true;

    document.body.classList.add('reduced-motion');
  }

  // Toggle

  var toggle = document.querySelectorAll('[data-toggle]');

  for (var i = toggle.length - 1; i >= 0; i--) {
    toggle[i].addEventListener("click", onToggle)
  }

  function onToggle(e) {
    var target = document.querySelector(this.dataset.toggle);

    target.classList.toggle('toggle-active');

    if (!stickyNav) return;
    if (target.classList.contains('toggle-active')) {
      stickyNav.classList.remove('on');
    } else {
      stickyNav.classList.add('on');
    }

  }



  // Scroll class

  var latestKnownScrollY = window.pageYOffset || 0,
      scrollDebounce = false,
      scrollListeners = [];


  function resetScrollDebounce() {

    scrollDebounce = false;

  }

  function onScroll() {

    if(scrollDebounce) {
      return;
    }

    requestAnimationFrame(resetScrollDebounce);

    latestKnownScrollY = window.pageYOffset; // No IE8

    for (var i = scrollListeners.length - 1; i >= 0; i--) {
      scrollListeners[i]({
        latestKnownScrollY
      });
    }

    scrollDebounce = true;

  }

  window.addEventListener('scroll', onScroll, { passive: false });


  class ScrollSection {

    constructor(element, { onInView, onOutOfView, onScroll, threshold = 0 }) {

      this.el = element;

      this.onInView = onInView;
      this.onOutOfView = onOutOfView;
      this.onScroll = onScroll;

      this.observer = new IntersectionObserver((e) => this.intersectionObserver(e), {
        threshold
      });
      this.observer.observe(this.el);

    }

    intersectionObserver([event]) {

      if (event.intersectionRatio > 0) {
        this.inView(event);
        return;
      }

      this.outOfView(event);

    }

    inView(event) {

      if(this.onInView) {
        this.onInView(event);
      }

      if(this.onScroll) {
        this.onScroll({
          latestKnownScrollY
        });

        scrollListeners.push(this.onScroll);

      }

    }

    outOfView(event) {

      if(this.onOutOfView) {
        this.onOutOfView(event);
      }

      if(this.onScroll) {

        scrollListeners = scrollListeners.filter(item => {
          return item != this.onScroll;
        });
      }

    }

    get relativeScrollY() {
      return latestKnownScrollY - this.el.offsetTop;
    }

  }


  // Screensize debouncer

  var latestKnownSize = {
        height: window.innerHeight || 0,
        width: window.innerWidth || 0,
      },
      sizeDebounce = false,
      sizeListeners = [];


  function resetSizeDebounce() {

    sizeDebounce = false;

  }

  function onResize() {

    if(sizeDebounce) {
      return;
    }

    requestAnimationFrame(resetSizeDebounce);

    latestKnownSize = {
      height: window.innerHeight,
      width: window.innerWidth,
    };

    for (var i = sizeListeners.length - 1; i >= 0; i--) {
      sizeListeners[i](latestKnownSize);
    }

    sizeDebounce = true;

  }

  window.addEventListener('resize', onResize, { passive: false });


  // Fade in

  (function(){

    var fadeInElement = document.querySelectorAll("[data-fade-in]");

    if (!fadeInElement || reduceMotion) return;

    for (var i = fadeInElement.length - 1; i >= 0; i--) {
      fadeInElement[i].classList.add('hidden');
    }

    setTimeout(function(){

      for (var i = fadeInElement.length - 1; i >= 0; i--) {
        new ScrollSection(fadeInElement[i], {
          threshold: [.5, 1],
          onInView: fadeInShow
        });
      }

    }, 300);

    function fadeInShow(event) {

      var element = event.target,
          delay = !isNaN(element.dataset.fadeIn) && element.dataset.fadeIn.length ? element.dataset.fadeIn : 0;

      setTimeout(function(){

        element.classList.remove('hidden');
        element.classList.add('fadeInUp');

      }, delay);

    }

  })();



  // Video

  (function(){
    var videoElements = document.querySelectorAll("[data-play-on-scroll]");

    if (!videoElements) return;

    var videoReset;

    for (var i = videoElements.length - 1; i >= 0; i--) {

      videoElements[i].dataset.playOnScroll = 1;

      new ScrollSection(videoElements[i], {
        threshold: [0, 0.6, 1],
        onInView: videoInView,
        onOutOfView: videoOutOfView
      });

    }

    function videoInView(event) {

      if (videoReset) {
        clearTimeout(videoReset);
      }

      if (event.intersectionRatio > 0.6 && event.target.dataset.playOnScroll === '1') {

        event.target.play().catch(function () {
          var fallbackImageSrc = event.target.dataset.fallbackImage;
          if (fallbackImageSrc) {
            var image = document.createElement("img");
            image.src = fallbackImageSrc;
            event.target.parentNode.replaceChild(image, event.target);
          }
        });

        event.target.dataset.playOnScroll = 0;
      }
    }

    function videoOutOfView(event) {

      videoReset = setTimeout(() => {

        event.target.pause();
        event.target.currentTime = 0;
        event.target.dataset.playOnScroll = 1;

      }, 500);

    }

  })();



  // Header scrolled state

  (function(){

    var headerTrigger = document.querySelector(".header-scroll-trigger");

    if (!headerTrigger) return;

    var headerContainer = document.querySelector(".header-container");

    new ScrollSection(headerTrigger, {
      threshold: 0,
      onInView: topOfPage,
      onOutOfView: scrolled
    });


    function topOfPage() {
      headerContainer.classList.remove('scrolled');
    }

    function scrolled() {
      headerContainer.classList.add('scrolled');
    }

  })();



  // Homepage Hero animation

  (function(){

    var heroContainer = document.querySelector(".page-home .container.hero");

    if (!heroContainer || reduceMotion) return;

    var hero = heroContainer.querySelector(".hero-headline"),
        heroTarget = heroContainer.querySelector(".hero-transform-target"),
        heroUI = heroContainer.querySelector(".hero-ui"),
        mediaZoom = window.matchMedia('(min-width: 80em)'),
        duration,
        translate,
        scale;

    heroTarget.style.transform = "scale(1)";

    heroSection = new ScrollSection(heroContainer, {
      onScroll: morphHero
    });

    function morphHero() {

      var progress = Math.max(0, 1 - Math.max((duration - heroSection.relativeScrollY) / duration, 0)),
          progressUI = calcProgressRange(progress, 0, .6);

      heroTarget.style.transform = `scale(${1 - progress * scale}) translate(${progress * translate}%, 0)`;
      heroUI.style.opacity = progressUI;

    }

    function setHeroSizeVariables(latestKnownSize) {

        duration = heroContainer.clientHeight - (latestKnownSize.height + latestKnownSize.width * .05);
        scale = 1 - Math.min(latestKnownSize.width * .55, latestKnownSize.height * .8) / latestKnownSize.width;
        translate = mediaZoom.matches ? 6.51 : 7.8125

        // The UI is 100 pixels off-center when the canvas is 768px wide. On smaller screens we zoom the hero to 120%
        // 100/768*100/2 = 6.510416666666667
        // 100/768*120/2 = 7.8125

        morphHero();

    }

    sizeListeners.push(setHeroSizeVariables);

    setHeroSizeVariables(latestKnownSize);

    function calcProgressRange(progress, start, end) {
      var length = end - start;
      return Math.max(0, Math.min(1, (progress - start) / length))
    }

  })();



  // Template parallax

  (function(){

    var templateContainer = document.querySelector(".home-templates");

    if (!templateContainer || reduceMotion) return;

    var templateColumns = templateContainer.querySelectorAll(".template-grid__column"),
        duration = templateContainer.clientHeight,
        columnSpeed = [-.6, -.4, -.7, -.5, -.65, -.35, -.55],
        columnCount = templateColumns.length,
        multiplier = 1.35;

    templateSection = new ScrollSection(templateContainer, {
      onScroll: morphTemplate
    });

    function morphTemplate() {

      var progress = 1 - Math.max((duration - templateSection.relativeScrollY) / duration, 0);

      for (var i = columnCount - 1; i >= 0; i--) {
        templateColumns[i].style.transform = `translate(0, calc(${progress * multiplier * columnSpeed[i]}em))`;
      }

    }

    function setTemplateSizeVariables(latestKnownSize) {

        duration = templateContainer.clientHeight;

        morphTemplate();

    }

    sizeListeners.push(setTemplateSizeVariables);

    setTemplateSizeVariables(latestKnownSize);

  })();



  // Formatting

  (function(){

    var formattingContainer = document.querySelector(".home-formatting");

    if (!formattingContainer || reduceMotion) return;

    var formattingVideo = formattingContainer.querySelector("video"),
        formattingText = formattingContainer.querySelector(".text"),
        formattingPlayed = false,
        formattingSection;

    formattingContainer.classList.add('format-animation');

    setTimeout(function(){

      formattingSection = new ScrollSection(formattingText, {
        threshold: [0, 0.7, 1],
        onInView: formattingInView,
        onOutOfView: formattingOutOfView
      });

    }, 500);

    function formattingInView(event) {

      if (event.intersectionRatio < 0.7 || formattingPlayed) return;

      setTimeout(function(){

        formattingVideo.play();
        formattingContainer.classList.remove('format-animation');

      }, 500);

      formattingPlayed = true;

    }

    function formattingOutOfView(event) {

      formattingContainer.classList.add('format-animation');

      formattingPlayed = false;

    }

  })();



  // Sharing parallax

  (function(){

    var sharingContainer = document.querySelector(".home-sharing");

    if (!sharingContainer || reduceMotion) return;

    var shadow = sharingContainer.querySelector(".sharing-visual__shadow"),
        plane = sharingContainer.querySelector(".sharing-visual__plane"),
        access = sharingContainer.querySelector(".sharing-visual__access"),
        hand = sharingContainer.querySelector(".sharing-visual__hand"),
        invite = sharingContainer.querySelector(".sharing-visual__invite"),
        angle = -32 * (Math.PI / 180),
        duration;

    sharingSection = new ScrollSection(sharingContainer, {
      onScroll: morphSharing
    });

    function morphSharing() {

      var progress = 1 - Math.max((duration - sharingSection.relativeScrollY) / duration, 0),
          x = (progress + .2) * Math.cos(angle),
          y = (progress + .2) * Math.sin(angle),
          shadowX = Math.min(x * 15, 1.6);

      shadow.style.transform = `translate(${shadowX}em, 0)`;
      plane.style.transform = `translate(${x * 27}em, ${y * 27}em)`;
      access.style.transform = `translate(0, ${progress * -4}em)`;
      hand.style.transform = `translate(${progress * 2}em, ${progress * -3 + 1}em) rotate(${progress * 5 - 4}deg)`;
      invite.style.transform = `translate(0, ${progress * -8}em)`;

    }

    function setSharingSizeVariables(latestKnownSize) {

        duration = Math.max(sharingContainer.clientHeight, window.innerHeight);

        morphSharing();

    }

    sizeListeners.push(setSharingSizeVariables);

    setSharingSizeVariables(latestKnownSize);

  })();



  // About page parallax

  (function(){

    var aboutHeroContainer = document.querySelector(".hero.about");

    if (!aboutHeroContainer) return;

    var headerContainer = document.querySelector(".header-container"),
        aboutTitle = document.querySelector(".hero-headline"),
        aboutImage = document.querySelector(".hero-gurl-center"),
        headerHeight = headerContainer.clientHeight,
        duration = aboutHeroContainer.clientHeight;

    if (reduceMotion) {

      aboutHeroSection = new ScrollSection(aboutHeroContainer, {
        threshold: [0],
        onInView: heroInView,
        onOutOfView: heroOutOfView
      });

      return;

    }

    aboutHeroSection = new ScrollSection(aboutHeroContainer, {
      threshold: [0],
      onInView: heroInView,
      onOutOfView: heroOutOfView,
      onScroll: scrollAboutHero
    });

    function heroInView(event) {
      headerContainer.classList.add("blue", "negative");
    }

    function heroOutOfView(event) {
      headerContainer.classList.remove("blue", "negative");
    }

    function scrollAboutHero() {

      var progress = 1 - Math.max((duration - aboutHeroSection.relativeScrollY - headerHeight) / duration, 0);

      aboutTitle.style.transform = `translate(0, ${progress * -25}%)`;

    }

    function setHeroSizeVariables() {
        duration = aboutHeroContainer.clientHeight;
        headerHeight = headerContainer.clientHeight;

        scrollAboutHero();
    }

    sizeListeners.push(setHeroSizeVariables);

    setHeroSizeVariables();

    aboutImage.addEventListener('load', setHeroSizeVariables);

  })();


  // Constant change nav
  var stickyNav = document.querySelector('.scroll-nav');

  (function(){
    var constantChangeHero = document.querySelector('.constant-change-signup');
    var htmlEl = document.querySelector('html');

    constantChangeNav = new ScrollSection(constantChangeHero, {
      threshold: [0],
      onInView: heroInView,
      onOutOfView: heroOutOfView
    });

    function heroInView(event) {
      stickyNav.classList.remove('on');
      htmlEl.classList.remove('scroll-offset');
    }

    function heroOutOfView(event) {
      stickyNav.classList.add('on');
    }

    var constantChangeSection = document.querySelectorAll('.constant-change-section');

    if (!constantChangeSection) return

    for (var i = constantChangeSection.length - 1; i >= 0; i--) {

      new ScrollSection(constantChangeSection[i], {
        threshold: [0],
        onInView: sectionInView
      });

      function sectionInView(event) {
        htmlEl.classList.add('scroll-offset');
      }

    }

  })();

})();
;
