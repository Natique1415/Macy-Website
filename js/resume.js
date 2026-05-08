document.addEventListener('DOMContentLoaded', function () {
  const icon    = document.getElementById('resumeIcon');
  const overlay = document.getElementById('resumeOverlay');
  const window_ = document.getElementById('resumeWindow');
  const closeBtn = document.getElementById('resumeClose');
  const titlebar = window_.querySelector('.resume-titlebar');
  const iframe = window_.querySelector('iframe');
  const resizeHandles = window_.querySelectorAll('[data-resize-handle]');
  const minWidth = 400;
  const minHeight = 300;
  let activeResize = null;
  let activeDrag = null;

  function openWindow() {
    overlay.classList.add('visible');
    window_.style.display = '';
    window_.classList.remove('close');
    window_.classList.add('open');
  }

  function closeWindow() {
    window_.classList.remove('open');
    window_.classList.add('close');
    window_.addEventListener('animationend', function handler() {
      window_.classList.remove('close');
      overlay.classList.remove('visible');
      window_.removeEventListener('animationend', handler);
    });
  }

  function setWindowRect(left, top, width, height) {
    window_.classList.add('positioned');
    window_.style.left = `${left}px`;
    window_.style.top = `${top}px`;
    window_.style.width = `${width}px`;
    window_.style.height = `${height}px`;
    window_.style.transform = 'none';
  }

  function setIframePointerEvents(value) {
    if (iframe) {
      iframe.style.pointerEvents = value;
    }
  }

  function startDrag(e) {
    if (e.target.closest('.tl') || activeResize) return;

    e.preventDefault();

    const rect = window_.getBoundingClientRect();

    activeDrag = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height
    };

    setWindowRect(rect.left, rect.top, rect.width, rect.height);
    window_.classList.add('dragging');
    setIframePointerEvents('none');

    document.addEventListener('mousemove', dragWindow);
    document.addEventListener('mouseup', stopDrag);
  }

  function dragWindow(e) {
    if (!activeDrag) return;

    const nextLeft = e.clientX - activeDrag.offsetX;
    const nextTop = e.clientY - activeDrag.offsetY;

    setWindowRect(nextLeft, nextTop, activeDrag.width, activeDrag.height);
  }

  function stopDrag() {
    if (!activeDrag) return;

    activeDrag = null;
    window_.classList.remove('dragging');
    setIframePointerEvents('');

    document.removeEventListener('mousemove', dragWindow);
    document.removeEventListener('mouseup', stopDrag);
  }

  function startResize(e) {
    e.preventDefault();
    e.stopPropagation();

    const rect = window_.getBoundingClientRect();
    const direction = e.currentTarget.dataset.resizeHandle;

    activeResize = {
      direction,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      startWidth: rect.width,
      startHeight: rect.height
    };

    setWindowRect(rect.left, rect.top, rect.width, rect.height);
    window_.classList.add('resizing');

    setIframePointerEvents('none');

    document.addEventListener('mousemove', resizeWindow);
    document.addEventListener('mouseup', stopResize);
  }

  function resizeWindow(e) {
    if (!activeResize) return;

    const dx = e.clientX - activeResize.startX;
    const dy = e.clientY - activeResize.startY;
    const direction = activeResize.direction;

    let nextLeft = activeResize.startLeft;
    let nextTop = activeResize.startTop;
    let nextWidth = activeResize.startWidth;
    let nextHeight = activeResize.startHeight;

    if (direction.includes('e')) {
      nextWidth = Math.max(minWidth, activeResize.startWidth + dx);
    }

    if (direction.includes('s')) {
      nextHeight = Math.max(minHeight, activeResize.startHeight + dy);
    }

    if (direction.includes('w')) {
      nextWidth = Math.max(minWidth, activeResize.startWidth - dx);
      nextLeft = activeResize.startLeft + activeResize.startWidth - nextWidth;
    }

    if (direction.includes('n')) {
      nextHeight = Math.max(minHeight, activeResize.startHeight - dy);
      nextTop = activeResize.startTop + activeResize.startHeight - nextHeight;
    }

    setWindowRect(nextLeft, nextTop, nextWidth, nextHeight);
  }

  function stopResize() {
    if (!activeResize) return;

    activeResize = null;
    window_.classList.remove('resizing');

    setIframePointerEvents('');

    document.removeEventListener('mousemove', resizeWindow);
    document.removeEventListener('mouseup', stopResize);
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
  titlebar.addEventListener('mousedown', startDrag);

  resizeHandles.forEach(handle => {
    handle.addEventListener('mousedown', startResize);
  });
});
