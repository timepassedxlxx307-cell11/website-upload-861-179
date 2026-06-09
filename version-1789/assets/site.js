(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", open);
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                nav.classList.remove("is-open");
                document.body.classList.remove("menu-open");
                button.setAttribute("aria-expanded", "false");
            });
        });
    }

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            window.clearInterval(timer);
            play();
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        slider.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        slider.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = document.querySelector(panel.getAttribute("data-filter-panel"));
            if (!scope) {
                return;
            }
            var input = panel.querySelector("[data-filter-search]");
            var year = panel.querySelector("[data-filter-year]");
            var region = panel.querySelector("[data-filter-region]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var empty = document.querySelector(panel.getAttribute("data-empty-target"));
            function valueOf(el) {
                return el ? el.value.trim().toLowerCase() : "";
            }
            function apply() {
                var query = valueOf(input);
                var yearValue = valueOf(year);
                var regionValue = valueOf(region);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                    var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchYear = !yearValue || cardYear === yearValue;
                    var matchRegion = !regionValue || cardRegion === regionValue;
                    var match = matchQuery && matchYear && matchRegion;
                    card.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            [input, year, region].forEach(function (el) {
                if (el) {
                    el.addEventListener("input", apply);
                    el.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initMoviePlayer(source) {
        var video = document.querySelector("[data-player-video]");
        var cover = document.querySelector("[data-play-cover]");
        if (!video || !source) {
            return;
        }
        var attached = false;
        var hlsInstance = null;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }
        function start() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var play = video.play();
            if (play && typeof play.catch === "function") {
                play.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (!attached) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
