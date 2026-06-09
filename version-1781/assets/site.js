(function () {
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (header) {
    const onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const thumbs = Array.from(hero.querySelectorAll('[data-hero-thumb]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === index);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    };

    const reset = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        reset();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        reset();
      });
    }

    show(0);
    start();
  }

  const searchInput = document.querySelector('[data-search-input]');
  const searchCards = Array.from(document.querySelectorAll('[data-search-card]'));
  const categoryButtons = Array.from(document.querySelectorAll('[data-filter-category]'));
  let activeCategory = 'all';

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');
  if (searchInput && initialQuery) {
    searchInput.value = initialQuery;
  }

  const applySearch = function () {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    searchCards.forEach(function (card) {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const meta = (card.getAttribute('data-meta') || '').toLowerCase();
      const category = card.getAttribute('data-category') || '';
      const matchesText = !query || title.indexOf(query) !== -1 || meta.indexOf(query) !== -1;
      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      card.classList.toggle('hidden', !(matchesText && matchesCategory));
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
    applySearch();
  }

  categoryButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeCategory = button.getAttribute('data-filter-category') || 'all';
      categoryButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applySearch();
    });
  });
})();

function initMoviePlayer(sourceUrl) {
  const video = document.getElementById('movie-player');
  const startButton = document.getElementById('player-start');
  if (!video || !startButton || !sourceUrl) {
    return;
  }

  let ready = false;
  let loading = false;

  const loadHls = function (callback) {
    if (window.Hls) {
      callback();
      return;
    }
    if (loading) {
      const wait = window.setInterval(function () {
        if (window.Hls) {
          window.clearInterval(wait);
          callback();
        }
      }, 120);
      return;
    }
    loading = true;
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = callback;
    document.head.appendChild(script);
  };

  const attach = function () {
    if (ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      ready = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      ready = true;
      return;
    }
    loadHls(attach);
  };

  const play = function () {
    attach();
    startButton.classList.add('hidden');
    video.setAttribute('controls', 'controls');
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        startButton.classList.remove('hidden');
      });
    }
  };

  startButton.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
}
