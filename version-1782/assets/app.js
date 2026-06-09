(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('[data-dot]'));
    const prev = carousel.querySelector('[data-prev]');
    const next = carousel.querySelector('[data-next]');
    let current = Math.max(0, slides.findIndex((slide) => slide.classList.contains('active')));
    let timer = null;

    const show = (index) => {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    const start = () => {
      timer = window.setInterval(() => show(current + 1), 5200);
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.dataset.dot || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(current + 1);
        restart();
      });
    }

    show(current);
    start();
  });

  const homeSearch = document.querySelector('[data-home-search]');
  if (homeSearch) {
    homeSearch.addEventListener('submit', (event) => {
      const input = homeSearch.querySelector('input[name="q"]');
      if (input && input.value.trim()) {
        event.preventDefault();
        window.location.href = `./search.html?q=${encodeURIComponent(input.value.trim())}`;
      }
    });
  }

  document.querySelectorAll('[data-search-form]').forEach((form) => {
    const scope = form.parentElement || document;
    const input = form.querySelector('[data-search-input]');
    const category = form.querySelector('[data-filter-category]');
    const region = form.querySelector('[data-filter-region]');
    const type = form.querySelector('[data-filter-type]');
    const year = form.querySelector('[data-filter-year]');
    const reset = form.querySelector('[data-reset-filters]');
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const empty = scope.querySelector('[data-empty-state]');

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    const apply = () => {
      const query = input ? input.value.trim().toLowerCase() : '';
      const categoryValue = category ? category.value : '';
      const regionValue = region ? region.value : '';
      const typeValue = type ? type.value : '';
      const yearValue = year ? year.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const text = [
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category,
        ].join(' ').toLowerCase();
        const matched = (!query || text.includes(query))
          && (!categoryValue || card.dataset.category === categoryValue)
          && (!regionValue || card.dataset.region === regionValue)
          && (!typeValue || card.dataset.type === typeValue)
          && (!yearValue || card.dataset.year === yearValue);
        card.hidden = !matched;
        if (matched) visible += 1;
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    [input, category, region, type, year].filter(Boolean).forEach((node) => {
      node.addEventListener('input', apply);
      node.addEventListener('change', apply);
    });

    if (reset) {
      reset.addEventListener('click', () => {
        if (input) input.value = '';
        [category, region, type, year].filter(Boolean).forEach((node) => {
          node.value = '';
        });
        apply();
      });
    }

    apply();
  });

  document.querySelectorAll('[data-player]').forEach((shell) => {
    const video = shell.querySelector('video');
    const overlay = shell.querySelector('[data-play-button]');
    const buttons = Array.from(document.querySelectorAll('.source-btn'));
    let hls = null;
    let loadedSource = '';

    const loadSource = (source, autoplay) => {
      if (!video || !source) return;
      if (loadedSource === source && autoplay) {
        video.play().catch(() => {});
        return;
      }
      loadedSource = source;

      if (hls) {
        hls.destroy();
        hls = null;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          if (autoplay) video.play().catch(() => {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        if (autoplay) video.play().catch(() => {});
      } else {
        video.src = source;
        if (autoplay) video.play().catch(() => {});
      }
    };

    const start = () => {
      const source = video.dataset.src;
      if (overlay) overlay.classList.add('hidden');
      loadSource(source, true);
    };

    if (video) {
      loadSource(video.dataset.src, false);
      video.addEventListener('play', () => {
        if (overlay) overlay.classList.add('hidden');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        if (!video) return;
        buttons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        video.dataset.src = button.dataset.src;
        if (overlay) overlay.classList.add('hidden');
        loadSource(button.dataset.src, true);
      });
    });
  });
})();
