document.addEventListener('DOMContentLoaded', function () {
  const icon    = document.getElementById('resumeIcon');
  const overlay = document.getElementById('resumeOverlay');
  const window_ = document.getElementById('resumeWindow');
  const closeBtn = document.getElementById('resumeClose');

  function openWindow() {
    overlay.classList.add('visible');
    window_.classList.remove('close');
    window_.classList.add('open');
  }

  function closeWindow() {
    window_.classList.remove('open');
    window_.classList.add('close');
    window_.addEventListener('animationend', function handler() {
      window_.classList.remove('close');
      window_.style.display = 'none';
      overlay.classList.remove('visible');
      window_.removeEventListener('animationend', handler);
    });
  }

  icon.addEventListener('click', function () {
    icon.classList.remove('bounce');
    void icon.offsetWidth;
    icon.classList.add('bounce');
    icon.addEventListener('animationend', function handler() {
      icon.classList.remove('bounce');
      icon.removeEventListener('animationend', handler);
      openWindow();
    });
  });

  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeWindow();
  });

  overlay.addEventListener('click', closeWindow);
});
