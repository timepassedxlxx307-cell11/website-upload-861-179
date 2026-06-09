(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navPanel = document.querySelector('[data-nav-panel]');

    if (navToggle && navPanel) {
        navToggle.addEventListener('click', function () {
            navPanel.classList.toggle('is-open');
            navToggle.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage && typeof SearchItems !== 'undefined') {
        var input = searchPage.querySelector('[data-search-input]');
        var typeFilter = searchPage.querySelector('[data-type-filter]');
        var yearFilter = searchPage.querySelector('[data-year-filter]');
        var form = searchPage.querySelector('[data-search-tools]');
        var results = searchPage.querySelector('[data-search-results]');
        var params = new URLSearchParams(window.location.search);

        function uniqueValues(key) {
            return Array.from(new Set(SearchItems.map(function (item) {
                return item[key];
            }).filter(Boolean))).sort(function (a, b) {
                return String(b).localeCompare(String(a), 'zh-CN');
            });
        }

        uniqueValues('type').forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            typeFilter.appendChild(option);
        });

        uniqueValues('year').forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            yearFilter.appendChild(option);
        });

        input.value = params.get('q') || '';
        typeFilter.value = params.get('type') || '';
        yearFilter.value = params.get('year') || '';

        function matches(item, query) {
            if (!query) {
                return true;
            }
            var haystack = [
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.category,
                item.line,
                item.tags.join(' ')
            ].join(' ').toLowerCase();
            return haystack.indexOf(query.toLowerCase()) !== -1;
        }

        function render() {
            var query = input.value.trim();
            var type = typeFilter.value;
            var year = yearFilter.value;
            var items = SearchItems.filter(function (item) {
                return matches(item, query) && (!type || item.type === type) && (!year || item.year === year);
            }).slice(0, 120);

            if (!items.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
                return;
            }

            results.innerHTML = items.map(function (item) {
                var tags = item.tags.slice(0, 3).map(function (tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');

                return '<article class="movie-card">' +
                    '<a class="poster-link" href="' + item.url + '">' +
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="play-badge">播放</span>' +
                    '<span class="year-badge">' + escapeHtml(item.year) + '</span>' +
                    '</a>' +
                    '<div class="movie-card-body">' +
                    '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</p>' +
                    '<p class="movie-line">' + escapeHtml(item.line) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                    '</div>' +
                    '</article>';
            }).join('');
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>'"]/g, function (character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[character];
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });

        input.addEventListener('input', render);
        typeFilter.addEventListener('change', render);
        yearFilter.addEventListener('change', render);
        render();
    }
})();
