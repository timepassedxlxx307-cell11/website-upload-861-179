(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function matchText(card, query) {
    if (!query) {
      return true;
    }
    var haystack = [
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.year,
      card.dataset.genre,
      card.textContent
    ].join(" ").toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function filterGrid(root) {
    var queryInput = $('[data-filter-query]', root);
    var typeSelect = $('[data-filter-type]', root);
    var yearSelect = $('[data-filter-year]', root);
    var cards = $all('.movie-card', root);
    var empty = $('.empty-state', root);

    function apply() {
      var query = normalize(queryInput && queryInput.value);
      var type = normalize(typeSelect && typeSelect.value);
      var year = normalize(yearSelect && yearSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matchText(card, query);
        if (type && normalize(card.dataset.type) !== type) {
          ok = false;
        }
        if (year && normalize(card.dataset.year) !== year) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [queryInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function setupMobileMenu() {
    var toggle = $('[data-menu-toggle]');
    var panel = $('[data-mobile-menu]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dots button', hero);
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });

      var active = slides[current];
      var title = $('[data-hero-title]', hero);
      var summary = $('[data-hero-summary]', hero);
      var year = $('[data-hero-year]', hero);
      var type = $('[data-hero-type]', hero);
      var genre = $('[data-hero-genre]', hero);
      var category = $('[data-hero-category]', hero);
      var region = $('[data-hero-region]', hero);
      var link = $('[data-hero-link]', hero);

      if (active) {
        if (title) {
          title.textContent = active.dataset.title || "";
        }
        if (summary) {
          summary.textContent = active.dataset.summary || "";
        }
        if (year) {
          year.textContent = active.dataset.year || "";
        }
        if (type) {
          type.textContent = active.dataset.type || "";
        }
        if (genre) {
          genre.textContent = active.dataset.genre || "";
        }
        if (category) {
          category.textContent = active.dataset.category || "";
        }
        if (region) {
          region.textContent = active.dataset.region || "";
        }
        if (link) {
          link.href = active.dataset.href || "#";
        }
      }
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function setupSearchPage() {
    var root = $('[data-search-page]');
    if (!root || !window.SEARCH_DATA) {
      return;
    }
    var form = $('[data-search-form]', root);
    var input = $('[data-search-input]', root);
    var typeSelect = $('[data-search-type]', root);
    var yearSelect = $('[data-search-year]', root);
    var list = $('[data-search-results]', root);
    var info = $('[data-search-info]', root);
    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";

    function render() {
      var query = normalize(input.value);
      var type = normalize(typeSelect.value);
      var year = normalize(yearSelect.value);
      var results = window.SEARCH_DATA.filter(function (item) {
        var body = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.tags,
          item.oneLine,
          item.category
        ].join(" ").toLowerCase();

        if (query && body.indexOf(query) === -1) {
          return false;
        }
        if (type && normalize(item.type) !== type) {
          return false;
        }
        if (year && normalize(item.year) !== year) {
          return false;
        }
        return true;
      }).slice(0, 96);

      list.innerHTML = results.map(function (item) {
        return [
          '<article class="video-card movie-card">',
          '<a class="poster-wrap" href="' + item.href + '">',
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">',
          '<span class="poster-gradient"></span>',
          '<span class="poster-badge">' + item.category + '</span>',
          '<span class="poster-year">' + item.year + '</span>',
          '<span class="poster-play">▶</span>',
          '</a>',
          '<div class="video-card-body">',
          '<h3><a href="' + item.href + '">' + item.title + '</a></h3>',
          '<p>' + item.oneLine + '</p>',
          '<div class="card-meta"><span>' + item.region + '</span><span>' + item.type + '</span></div>',
          '</div>',
          '</article>'
        ].join("");
      }).join("");

      info.textContent = results.length ? "已显示匹配结果" : "未找到匹配内容";
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        render();
      });
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", render);
        control.addEventListener("change", render);
      }
    });

    render();
  }

  function setupPlayers() {
    $all('video[data-hls]').forEach(function (video) {
      var src = video.getAttribute("data-hls");
      var box = video.closest(".player-box");
      var overlay = box ? $(".play-overlay", box) : null;
      var button = box ? $(".play-overlay-button", box) : null;
      var hlsInstance = null;

      function attach() {
        if (video.dataset.ready === "1") {
          return;
        }
        video.dataset.ready = "1";
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else {
          video.src = src;
        }
      }

      function requestPlay() {
        attach();
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {});
        }
      }

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function () {
        if (overlay && !video.ended) {
          overlay.classList.remove("is-hidden");
        }
      });

      video.addEventListener("click", function () {
        if (video.paused) {
          requestPlay();
        } else {
          video.pause();
        }
      });

      video.addEventListener("loadedmetadata", function () {
        if (video.autoplay) {
          requestPlay();
        }
      });

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          requestPlay();
        });
      }

      attach();

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupSearchPage();
    setupPlayers();
    $all('[data-filter-grid]').forEach(filterGrid);
  });
})();
