import { H as Hls } from './hls-vendor.js';

document.querySelectorAll('.player-shell').forEach(function (shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('.play-cover');
  var message = shell.querySelector('.player-error');
  var stream = shell.getAttribute('data-stream') || '';
  var poster = shell.getAttribute('data-poster') || '';
  var hls = null;
  var ready = false;

  if (!video || !button || !stream) {
    return;
  }

  if (poster) {
    video.setAttribute('poster', poster);
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function prepare() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (eventName, data) {
        if (data && data.fatal) {
          setMessage('视频加载遇到问题，请刷新后重试');
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        }
      });
      return;
    }

    video.src = stream;
  }

  function start() {
    prepare();
    shell.classList.add('is-playing');
    setMessage('');
    var request = video.play();
    if (request && typeof request.catch === 'function') {
      request.catch(function () {
        shell.classList.remove('is-playing');
        setMessage('点击视频区域可继续播放');
      });
    }
  }

  button.addEventListener('click', start);

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (!video.ended) {
      shell.classList.remove('is-playing');
    }
  });
});
