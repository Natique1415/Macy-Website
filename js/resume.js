document.addEventListener('DOMContentLoaded', function () {
  if (window.innerWidth <= 768) return;
  const minWidth = 400;
  const minHeight = 300;
  let topWindowZIndex = 901;

  function updateDockVisibility() {
    const dock = document.querySelector('.bottom-icons');

    if (!dock) return;

    const hasVisibleWindow = !!document.querySelector('.resume-window.open, .resume-window.close');

    dock.classList.toggle('dock-hidden', hasVisibleWindow);
  }

  function getWindowElement(windowOrId) {
    return typeof windowOrId === 'string'
      ? document.getElementById(windowOrId)
      : windowOrId;
  }

  function getOverlayForWindow(windowEl) {
    if (!windowEl) return null;

    if (windowEl.dataset.overlayId) {
      return document.getElementById(windowEl.dataset.overlayId);
    }

    const previousEl = windowEl.previousElementSibling;

    return previousEl && previousEl.classList.contains('resume-overlay')
      ? previousEl
      : null;
  }

  function setEmbeddedPointerEvents(windowEl, value) {
    windowEl.querySelectorAll('iframe, object, embed').forEach(function (el) {
      el.style.pointerEvents = value;
    });
  }

  function bringWindowToFront(windowEl, overlayEl) {
    topWindowZIndex += 2;

    if (overlayEl) {
      overlayEl.style.zIndex = topWindowZIndex;
    }

    windowEl.style.zIndex = topWindowZIndex + 1;
  }

  function setupWindow(windowEl) {
    windowEl = getWindowElement(windowEl);

    if (!windowEl) return null;

    if (windowEl.__macWindow) {
      return windowEl.__macWindow;
    }

    const overlayEl = getOverlayForWindow(windowEl);
    const closeBtn = windowEl.querySelector('.tl-red');
    const titlebar = windowEl.querySelector('.resume-titlebar');
    const resizeHandles = windowEl.querySelectorAll('[data-resize-handle]');
    let activeResize = null;
    let activeWindowDrag = null;

    function openWindow() {
      bringWindowToFront(windowEl, overlayEl);

      if (overlayEl) {
        overlayEl.classList.add('visible');
        overlayEl.setAttribute('aria-hidden', 'false');
      }

      windowEl.style.display = '';
      windowEl.classList.remove('close');
      windowEl.classList.add('open');
      updateDockVisibility();
    }

    function closeWindow() {
      windowEl.classList.remove('open');
      windowEl.classList.add('close');
      updateDockVisibility();

      windowEl.addEventListener('animationend', function handler() {
        windowEl.classList.remove('close');

        if (overlayEl) {
          overlayEl.classList.remove('visible');
          overlayEl.setAttribute('aria-hidden', 'true');
        }

        windowEl.removeEventListener('animationend', handler);
        updateDockVisibility();
      });
    }

    function setWindowRect(left, top, width, height) {
      windowEl.classList.add('positioned');
      windowEl.style.left = `${left}px`;
      windowEl.style.top = `${top}px`;
      windowEl.style.width = `${width}px`;
      windowEl.style.height = `${height}px`;
      windowEl.style.transform = 'none';
    }

    function startWindowDrag(e) {
      if (e.button !== 0 || e.target.closest('.tl') || activeResize) return;

      e.preventDefault();
      bringWindowToFront(windowEl, overlayEl);

      const rect = windowEl.getBoundingClientRect();

      activeWindowDrag = {
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        width: rect.width,
        height: rect.height
      };

      setWindowRect(rect.left, rect.top, rect.width, rect.height);
      windowEl.classList.add('dragging');
      setEmbeddedPointerEvents(windowEl, 'none');

      document.addEventListener('mousemove', dragWindow);
      document.addEventListener('mouseup', stopWindowDrag);
    }

    function dragWindow(e) {
      if (!activeWindowDrag) return;

      const nextLeft = e.clientX - activeWindowDrag.offsetX;
      const nextTop = e.clientY - activeWindowDrag.offsetY;

      setWindowRect(nextLeft, nextTop, activeWindowDrag.width, activeWindowDrag.height);
    }

    function stopWindowDrag() {
      if (!activeWindowDrag) return;

      activeWindowDrag = null;
      windowEl.classList.remove('dragging');
      setEmbeddedPointerEvents(windowEl, '');

      document.removeEventListener('mousemove', dragWindow);
      document.removeEventListener('mouseup', stopWindowDrag);
    }

    function startResize(e) {
      if (e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();
      bringWindowToFront(windowEl, overlayEl);

      const rect = windowEl.getBoundingClientRect();
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
      windowEl.classList.add('resizing');
      setEmbeddedPointerEvents(windowEl, 'none');

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
      windowEl.classList.remove('resizing');
      setEmbeddedPointerEvents(windowEl, '');

      document.removeEventListener('mousemove', resizeWindow);
      document.removeEventListener('mouseup', stopResize);
    }

    if (closeBtn) {
      closeBtn.addEventListener('mousedown', function (e) {
        e.stopPropagation();
      });

      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeWindow();
      });
    }

    if (overlayEl) {
      overlayEl.addEventListener('click', closeWindow);
    }

    if (titlebar) {
      titlebar.addEventListener('mousedown', startWindowDrag);
    }

    resizeHandles.forEach(function (handle) {
      handle.addEventListener('mousedown', startResize);
    });

    windowEl.__macWindow = {
      open: openWindow,
      close: closeWindow,
      bringToFront: function () {
        bringWindowToFront(windowEl, overlayEl);
      }
    };

    return windowEl.__macWindow;
  }

  function setupDesktopIcon(iconEl, options) {
    options = options || {};

    if (!iconEl) return null;

    if (iconEl.__desktopIcon) {
      return iconEl.__desktopIcon;
    }

    let activeIconDrag = null;
    let dragged = false;

    if (!iconEl.hasAttribute('tabindex')) {
      iconEl.setAttribute('tabindex', '0');
    }

    if (!iconEl.hasAttribute('role')) {
      iconEl.setAttribute('role', 'button');
    }

    function selectIcon() {
      document.querySelectorAll('.desktop-icon.selected').forEach(function (selectedIcon) {
        if (selectedIcon !== iconEl) {
          selectedIcon.classList.remove('selected');
        }
      });

      iconEl.classList.add('selected');
    }

    function getTargetWindow() {
      const targetId = options.windowId || iconEl.dataset.windowTarget;

      return targetId ? document.getElementById(targetId) : null;
    }

    function setIconPosition(left, top) {
      iconEl.classList.add('positioned');
      iconEl.style.left = `${left}px`;
      iconEl.style.top = `${top}px`;
      iconEl.style.transform = 'none';
    }

    function openIconTarget() {
      const targetWindow = getTargetWindow();
      const macWindow = targetWindow ? setupWindow(targetWindow) : null;
      let opened = false;

      function openOnce() {
        if (opened) return;
        opened = true;
        iconEl.classList.remove('bounce');

        if (options.onOpen) {
          options.onOpen();
          return;
        }

        if (macWindow) {
          macWindow.open();
        }
      }

      iconEl.classList.remove('bounce');
      void iconEl.offsetWidth;
      iconEl.classList.add('bounce');

      iconEl.addEventListener('animationend', function handler() {
        iconEl.removeEventListener('animationend', handler);
        openOnce();
      });

      setTimeout(openOnce, 600);
    }

    function startIconDrag(e) {
      if (e.button !== 0) return;

      e.preventDefault();
      selectIcon();

      const rect = iconEl.getBoundingClientRect();

      activeIconDrag = {
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        width: rect.width,
        height: rect.height
      };
      dragged = false;

      document.addEventListener('mousemove', dragIcon);
      document.addEventListener('mouseup', stopIconDrag);
    }

    function dragIcon(e) {
      if (!activeIconDrag) return;

      const dx = e.clientX - activeIconDrag.startX;
      const dy = e.clientY - activeIconDrag.startY;

      if (!dragged && Math.hypot(dx, dy) < 4) return;

      dragged = true;
      iconEl.classList.add('dragging');

      const maxLeft = Math.max(0, window.innerWidth - activeIconDrag.width);
      const maxTop = Math.max(32, window.innerHeight - activeIconDrag.height);
      const nextLeft = Math.min(maxLeft, Math.max(0, e.clientX - activeIconDrag.offsetX));
      const nextTop = Math.min(maxTop, Math.max(32, e.clientY - activeIconDrag.offsetY));

      setIconPosition(nextLeft, nextTop);
    }

    function stopIconDrag() {
      if (!activeIconDrag) return;

      const shouldOpen = !dragged;

      activeIconDrag = null;
      dragged = false;
      iconEl.classList.remove('dragging');

      document.removeEventListener('mousemove', dragIcon);
      document.removeEventListener('mouseup', stopIconDrag);

      if (shouldOpen) {
        openIconTarget();
      }
    }

    iconEl.addEventListener('mousedown', startIconDrag);
    iconEl.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;

      e.preventDefault();
      selectIcon();
      openIconTarget();
    });

    iconEl.__desktopIcon = {
      open: openIconTarget,
      setPosition: setIconPosition,
      select: selectIcon
    };

    return iconEl.__desktopIcon;
  }

  window.macDesktop = {
    setupWindow,
    setupDesktopIcon,
    openWindow: function (windowOrId) {
      const macWindow = setupWindow(windowOrId);

      if (macWindow) {
        macWindow.open();
      }
    }
  };

  document.querySelectorAll('.resume-window').forEach(setupWindow);

  const resumeIcon = document.getElementById('resumeIcon');

  if (resumeIcon) {
    resumeIcon.dataset.windowTarget = 'resumeWindow';
    setupDesktopIcon(resumeIcon);
  }
});
