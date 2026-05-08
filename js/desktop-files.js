document.addEventListener('DOMContentLoaded', function () {
  const mainContent = document.getElementById('mainContent');

  if (!mainContent) return;

  function createResizeHandle(direction) {
    const handle = document.createElement('div');
    handle.className = `resize-handle resize-handle-${direction}`;
    handle.dataset.resizeHandle = direction;

    return handle;
  }

  function createFolderSvg() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <svg class="desktop-folder-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 58" fill="none" aria-hidden="true">
        <path d="M5 13.5C5 10.7 7.2 8.5 10 8.5H25.6L31.2 14.5H58C60.8 14.5 63 16.7 63 19.5V47.5C63 50.3 60.8 52.5 58 52.5H10C7.2 52.5 5 50.3 5 47.5V13.5Z" fill="rgba(80,166,255,0.9)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
        <path d="M5 22H63V47.5C63 50.3 60.8 52.5 58 52.5H10C7.2 52.5 5 50.3 5 47.5V22Z" fill="rgba(35,127,245,0.95)" stroke="rgba(255,255,255,0.28)" stroke-width="1.5"/>
        <path d="M10 19H58" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `;

    return wrapper.firstElementChild;
  }

  function getFileExtension(fileName) {
    const extension = String(fileName)
      .split('/')
      .pop()
      .split('.')
      .pop()
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 4)
      .toUpperCase();

    return extension || 'FILE';
  }

  function getFileTypeClass(fileName) {
    const extension = getFileExtension(fileName).toLowerCase();

    if (extension === 'pdf') {
      return 'file-type-pdf';
    }

    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'file-type-image';
    }

    return 'file-type-other';
  }

  function getFileTypeColor(fileName) {
    const typeClass = getFileTypeClass(fileName);

    if (typeClass === 'file-type-pdf') {
      return 'rgba(255,82,82,0.9)';
    }

    if (typeClass === 'file-type-image') {
      return 'rgba(77,214,123,0.9)';
    }

    return 'rgba(210,210,210,0.85)';
  }

  function createFileSvg(fileName) {
    const wrapper = document.createElement('div');
    const extension = getFileExtension(fileName);
    const labelColor = getFileTypeColor(fileName);

    wrapper.innerHTML = `
      <svg class="desktop-file-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 72" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="56" height="68" rx="6" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
        <path d="M38 2v16h16" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" fill="none"/>
        <path d="M38 2l16 16" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
        <rect x="11" y="32" width="28" height="2.5" rx="1.25" fill="rgba(255,255,255,0.7)"/>
        <rect x="11" y="40" width="22" height="2.5" rx="1.25" fill="rgba(255,255,255,0.5)"/>
        <rect x="11" y="48" width="25" height="2.5" rx="1.25" fill="rgba(255,255,255,0.5)"/>
        <text x="30" y="23" text-anchor="middle" fill="${labelColor}" font-size="8.5" font-family="SF Pro Display, Inter, sans-serif" font-weight="700">${extension}</text>
      </svg>
    `;

    return wrapper.firstElementChild;
  }

  function getSafeId(value, index) {
    const slug = String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${slug || 'folder'}-${index}`;
  }

  function getFileName(file) {
    if (file && file.name) {
      return String(file.name);
    }

    if (file && file.path) {
      return String(file.path).split('/').pop();
    }

    return '';
  }

  function getFileUrl(file, folderName) {
    if (file && file.path) {
      return String(file.path).split('/').map(encodeURIComponent).join('/');
    }

    const fileName = getFileName(file);

    if (folderName) {
      return `Desktop/${encodeURIComponent(folderName)}/${encodeURIComponent(fileName)}`;
    }

    return `Desktop/${encodeURIComponent(fileName)}`;
  }

  function openFileUrl(url) {
    window.open(url, '_blank', 'noopener');
  }

  function createFileRow(folderName, file) {
    const fileName = getFileName(file);
    const fileUrl = getFileUrl(file, folderName);
    const row = document.createElement('div');
    const fileIcon = document.createElement('span');
    const name = document.createElement('span');
    const openLink = document.createElement('a');

    row.className = 'folder-file-row';
    row.tabIndex = 0;
    row.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;

      openFileUrl(fileUrl);
    });
    row.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;

      e.preventDefault();
      openFileUrl(fileUrl);
    });

    fileIcon.className = `folder-file-icon ${getFileTypeClass(fileName)}`;
    fileIcon.textContent = getFileExtension(fileName);

    name.className = 'folder-file-name';
    name.textContent = fileName;

    openLink.className = 'folder-file-open';
    openLink.href = fileUrl;
    openLink.target = '_blank';
    openLink.rel = 'noopener';
    openLink.textContent = 'Open';
    openLink.setAttribute('aria-label', `Open ${fileName}`);

    row.append(fileIcon, name, openLink);

    return row;
  }

  function getDesktopPosition(index) {
    const rowHeight = 104;
    const colWidth = 96;
    const topStart = 64;
    const leftStart = 32;
    const rows = Math.max(1, Math.floor((window.innerHeight - 180) / rowHeight));
    const row = index % rows;
    const col = Math.floor(index / rows);

    return {
      left: leftStart + col * colWidth,
      top: topStart + row * rowHeight
    };
  }

  function createFolderIcon(folderName, windowId, index) {
    const icon = document.createElement('div');
    const iconImg = document.createElement('div');
    const label = document.createElement('div');
    const position = getDesktopPosition(index);

    icon.className = 'desktop-icon desktop-folder-icon positioned';
    icon.dataset.windowTarget = windowId;
    icon.setAttribute('aria-label', `Open ${folderName}`);
    icon.style.left = `${position.left}px`;
    icon.style.top = `${position.top}px`;
    icon.style.transform = 'none';

    iconImg.className = 'desktop-icon-img';
    iconImg.appendChild(createFolderSvg());

    label.className = 'desktop-icon-label';
    label.textContent = folderName;

    icon.append(iconImg, label);

    return icon;
  }

  function createDesktopFileIcon(file, index) {
    const fileName = getFileName(file);
    const icon = document.createElement('div');
    const iconImg = document.createElement('div');
    const label = document.createElement('div');
    const position = getDesktopPosition(index);

    icon.className = 'desktop-icon desktop-file-icon positioned';
    icon.setAttribute('aria-label', `Open ${fileName}`);
    icon.style.left = `${position.left}px`;
    icon.style.top = `${position.top}px`;
    icon.style.transform = 'none';

    iconImg.className = 'desktop-icon-img';
    iconImg.appendChild(createFileSvg(fileName));

    label.className = 'desktop-icon-label';
    label.textContent = fileName;

    icon.append(iconImg, label);

    return icon;
  }

  function getDisplayPath(pathValue, fallbackName) {
    const rawPath = pathValue || `Desktop/${fallbackName}`;

    return String(rawPath).split('/').filter(Boolean).join(' / ');
  }

  function createFolderWindow(folderName, files, idSuffix, folderPath) {
    const overlay = document.createElement('div');
    const windowEl = document.createElement('div');
    const titlebar = document.createElement('div');
    const trafficLights = document.createElement('div');
    const close = document.createElement('span');
    const minimize = document.createElement('span');
    const zoom = document.createElement('span');
    const title = document.createElement('span');
    const locationBar = document.createElement('div');
    const body = document.createElement('div');
    const list = document.createElement('div');

    overlay.className = 'resume-overlay folder-overlay';
    overlay.id = `folderOverlay-${idSuffix}`;
    overlay.setAttribute('aria-hidden', 'true');

    windowEl.className = 'resume-window folder-window';
    windowEl.id = `folderWindow-${idSuffix}`;
    windowEl.dataset.overlayId = overlay.id;

    ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'].forEach(function (direction) {
      windowEl.appendChild(createResizeHandle(direction));
    });

    titlebar.className = 'resume-titlebar';
    trafficLights.className = 'traffic-lights';
    close.className = 'tl tl-red';
    minimize.className = 'tl tl-yellow';
    zoom.className = 'tl tl-green';
    title.className = 'resume-title';
    title.textContent = folderName;

    trafficLights.append(close, minimize, zoom);
    titlebar.append(trafficLights, title);

    locationBar.className = 'folder-location-bar';
    locationBar.textContent = getDisplayPath(folderPath, folderName);

    body.className = 'resume-body folder-window-body';
    list.className = 'folder-file-list';

    if (files.length) {
      files.forEach(function (file) {
        list.appendChild(createFileRow(folderName, file));
      });
    } else {
      const empty = document.createElement('div');
      empty.className = 'folder-empty-state';
      empty.textContent = 'No files in this folder';
      list.appendChild(empty);
    }

    body.appendChild(list);
    windowEl.append(titlebar, locationBar, body);

    return { overlay, windowEl };
  }

  function addSpotlightItems(items) {
    if (window.spotlightControls) {
      window.spotlightControls.addItems(items);
      return;
    }

    document.dispatchEvent(new CustomEvent('desktopManifestItemsReady', {
      detail: { items }
    }));
  }

  function buildDesktopItems(manifest) {
    const spotlightItems = [];
    let desktopIndex = 0;

    manifest.forEach(function (item, index) {
      if (!item || !item.name) return;

      const isFolder = item.type === 'folder' || Array.isArray(item.files);

      if (!isFolder) {
        const fileName = getFileName(item);
        const fileUrl = getFileUrl(item);
        const fileIcon = createDesktopFileIcon(item, desktopIndex);

        desktopIndex += 1;
        mainContent.appendChild(fileIcon);

        if (window.macDesktop) {
          window.macDesktop.setupDesktopIcon(fileIcon, {
            onOpen: function () {
              openFileUrl(fileUrl);
            }
          });
        }

        spotlightItems.push({
          name: fileName,
          description: 'Open file',
          iconType: 'file',
          extension: getFileExtension(fileName),
          fileTypeClass: getFileTypeClass(fileName),
          action: function () {
            openFileUrl(fileUrl);
          }
        });

        return;
      }

      const folderName = String(item.name);
      const files = Array.isArray(item.files) ? item.files : [];
      const idSuffix = getSafeId(folderName, index);
      const folderWindow = createFolderWindow(folderName, files, idSuffix, item.path);
      const folderIcon = createFolderIcon(folderName, folderWindow.windowEl.id, desktopIndex);

      desktopIndex += 1;

      mainContent.append(folderIcon, folderWindow.overlay, folderWindow.windowEl);

      if (window.macDesktop) {
        window.macDesktop.setupWindow(folderWindow.windowEl);
        window.macDesktop.setupDesktopIcon(folderIcon);
      }

      spotlightItems.push({
        name: folderName,
        description: 'Open folder',
        iconType: 'folder',
        action: function () {
          if (window.macDesktop) {
            window.macDesktop.openWindow(folderWindow.windowEl);
          }
        }
      });

      files.forEach(function (file) {
        const fileName = getFileName(file);

        if (!fileName) return;

        const fileUrl = getFileUrl(file, folderName);

        spotlightItems.push({
          name: fileName,
          description: folderName,
          iconType: 'file',
          extension: getFileExtension(fileName),
          fileTypeClass: getFileTypeClass(fileName),
          action: function () {
            openFileUrl(fileUrl);
          }
        });
      });
    });

    addSpotlightItems(spotlightItems);
  }

  async function loadManifest() {
    try {
      const response = await fetch('manifest.json', { cache: 'no-store' });

      if (!response.ok) return;

      const manifest = await response.json();

      if (!Array.isArray(manifest)) return;

      buildDesktopItems(manifest);
    } catch (error) {
      return;
    }
  }

  loadManifest();
});
