(function () {
    var video = document.querySelector('[data-player]');
    var cover = document.querySelector('[data-player-cover]');
    var button = document.querySelector('[data-play-button]');

    if (!video) {
        return;
    }

    var source = video.querySelector('source');
    var streamUrl = source ? source.getAttribute('src') : '';
    var ready = false;

    function prepare() {
        if (ready || !streamUrl) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
            video.src = streamUrl;
            ready = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                maxBufferLength: 30,
                enableWorker: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            ready = true;
            return;
        }

        video.src = streamUrl;
        ready = true;
    }

    function start() {
        prepare();
        video.controls = true;

        if (cover) {
            cover.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }

    if (cover) {
        cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
})();
