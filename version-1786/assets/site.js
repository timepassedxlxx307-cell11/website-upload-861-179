(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupHeader() {
        var searchToggle = qs('.search-toggle');
        var headerSearch = qs('#headerSearch');
        var mobileToggle = qs('.mobile-toggle');
        var mobilePanel = qs('.mobile-panel');

        if (searchToggle && headerSearch) {
            searchToggle.addEventListener('click', function () {
                headerSearch.classList.toggle('open');
                var input = qs('input[type="search"]', headerSearch);
                if (headerSearch.classList.contains('open') && input) {
                    input.focus();
                }
            });
        }

        if (mobileToggle && mobilePanel) {
            mobileToggle.addEventListener('click', function () {
                mobilePanel.classList.toggle('open');
            });
        }
    }

    function renderResults(container, items) {
        if (!container) {
            return;
        }

        if (!items.length) {
            container.classList.add('open');
            container.innerHTML = '<div class="search-result"><span><strong>暂无匹配影片</strong><span>换一个关键词试试</span></span></div>';
            return;
        }

        container.classList.add('open');
        container.innerHTML = items.slice(0, 36).map(function (item) {
            return '<a class="search-result" href="' + item.url + '">' +
                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
                '<span><strong>' + escapeHtml(item.title) + '</strong>' +
                '<span>' + escapeHtml([item.year, item.region, item.type, item.genre].filter(Boolean).join(' · ')) + '</span></span>' +
                '</a>';
        }).join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function setupGlobalSearch() {
        var forms = qsa('[data-global-search-form]');
        var movies = window.__MOVIES__ || [];

        forms.forEach(function (form) {
            var input = qs('input[name="q"]', form) || qs('input[type="search"]', form);
            var results = qs('[data-global-search-results]', form.parentElement) || qs('[data-global-search-results]');

            function run() {
                var query = normalize(input && input.value);
                if (!query) {
                    if (results) {
                        results.classList.remove('open');
                        results.innerHTML = '';
                    }
                    return;
                }

                var items = movies.filter(function (movie) {
                    var haystack = normalize([
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.year,
                        movie.genre,
                        (movie.tags || []).join(' '),
                        movie.summary
                    ].join(' '));
                    return haystack.indexOf(query) !== -1;
                });
                renderResults(results, items);
            }

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                run();
            });

            if (input) {
                input.addEventListener('input', run);
            }
        });
    }

    function setupHero() {
        var shell = qs('[data-hero-slider]');
        if (!shell) {
            return;
        }

        var slides = qsa('.hero-slide', shell);
        var dots = qsa('[data-hero-dot]', shell);
        var prev = qs('[data-hero-prev]', shell);
        var next = qs('[data-hero-next]', shell);
        var index = 0;
        var timer;

        function show(nextIndex) {
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
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6500);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupLocalFilter() {
        qsa('[data-local-filter]').forEach(function (form) {
            var section = form.closest('section') || document;
            var cards = qsa('.movie-card', section);
            var search = qs('[data-filter-search]', form);
            var type = qs('[data-filter-type]', form);
            var year = qs('[data-filter-year]', form);
            var empty = qs('[data-empty-state]', section);

            function run() {
                var query = normalize(search && search.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var passQuery = !query || haystack.indexOf(query) !== -1;
                    var passType = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
                    var passYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                    var showCard = passQuery && passType && passYear;
                    card.style.display = showCard ? '' : 'none';
                    if (showCard) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('open', visible === 0);
                }
            }

            [search, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', run);
                    control.addEventListener('change', run);
                }
            });
        });
    }

    window.initMoviePlayer = function (videoId, buttonId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var ready = false;
        var hls;

        if (!video || !button || !source) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attach();
            button.classList.add('is-hidden');
            video.controls = true;
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupHeader();
        setupGlobalSearch();
        setupHero();
        setupLocalFilter();
    });
})();
