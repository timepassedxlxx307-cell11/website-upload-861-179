(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-to]'));
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('.catalog-shell').forEach(function (shell) {
    var search = shell.querySelector('.site-search');
    var filters = Array.prototype.slice.call(shell.querySelectorAll('.site-filter'));
    var sorter = shell.querySelector('.site-sort');
    var list = shell.querySelector('[data-card-list]');
    var empty = shell.querySelector('[data-empty-result]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.children);

    function valueOf(card, name) {
      return (card.getAttribute('data-' + name) || '').toLowerCase();
    }

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var ok = true;
        var searchText = card.getAttribute('data-search') || '';

        if (keyword && searchText.indexOf(keyword) === -1) {
          ok = false;
        }

        filters.forEach(function (filter) {
          var filterValue = filter.value.toLowerCase();
          var filterName = filter.getAttribute('data-filter');
          if (filterValue && valueOf(card, filterName) !== filterValue) {
            ok = false;
          }
        });

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    function sortCards() {
      var mode = sorter ? sorter.value : 'default';
      var sorted = cards.slice();

      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return valueOf(b, 'year').localeCompare(valueOf(a, 'year'), 'zh-Hans-CN');
        });
      }

      if (mode === 'title-asc') {
        sorted.sort(function (a, b) {
          return valueOf(a, 'title').localeCompare(valueOf(b, 'title'), 'zh-Hans-CN');
        });
      }

      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      cards = sorted;
      apply();
    }

    if (search) {
      search.addEventListener('input', apply);
    }

    filters.forEach(function (filter) {
      filter.addEventListener('change', apply);
    });

    if (sorter) {
      sorter.addEventListener('change', sortCards);
    }
  });
})();
