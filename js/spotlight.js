document.addEventListener('DOMContentLoaded', function () {
  if (window.innerWidth <= 768) return;
  const trigger = document.getElementById('spotlightTrigger');
  const overlay = document.getElementById('spotlightOverlay');
  const input = document.getElementById('spotlightInput');
  const resultsEl = document.getElementById('spotlightResults');

  const items = [
    {
      name: 'GitHub',
      description: 'Open GitHub profile',
      url: 'https://github.com/Natique1415',
      icon: 'icons/github.svg'
    },
    {
      name: 'LinkedIn',
      description: 'Open LinkedIn profile',
      url: 'https://www.linkedin.com/in/natique-ibrar-alam54a6681b6/',
      icon: 'icons/linkedin.svg'
    },
    {
      name: 'Twitter',
      description: 'Open Twitter profile',
      url: 'https://x.com/NatiqueIbrar',
      icon: 'icons/x.svg'
    },
    {
      name: 'Gmail',
      description: 'Compose email',
      url: 'mailto:ibrarnatique8@gmail.com',
      icon: 'icons/gmail.svg'
    },
    {
      name: 'Resume PDF',
      description: 'Open Resume PDF',
      url: 'desktop-files/Resume.pdf',
      iconType: 'pdf'
    }
  ];

  let filteredItems = items;
  let activeIndex = 0;

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  function getFileTypeClass(item) {
    if (item.fileTypeClass) {
      return item.fileTypeClass;
    }

    const extension = getFileExtension(item.extension || item.name).toLowerCase();

    if (extension === 'pdf') {
      return 'file-type-pdf';
    }

    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'file-type-image';
    }

    return 'file-type-other';
  }

  function highlightMatch(text, query) {
    const safeText = escapeHtml(text);

    if (!query.trim()) {
      return safeText;
    }

    const pattern = new RegExp(`(${escapeRegExp(query.trim())})`, 'ig');

    return safeText.replace(pattern, '<span class="spotlight-highlight">$1</span>');
  }

  function getIconMarkup(item) {
    if (item.icon) {
      return `<img src="${escapeHtml(item.icon)}" alt="" />`;
    }

    if (item.iconType === 'folder') {
      return `
        <span class="spotlight-folder-icon" aria-hidden="true">
          <svg viewBox="0 0 32 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 7.5C2 5.8 3.35 4.45 5.05 4.45H12.4L15.15 7.25H26.95C28.65 7.25 30 8.6 30 10.3V20.95C30 22.65 28.65 24 26.95 24H5.05C3.35 24 2 22.65 2 20.95V7.5Z" fill="#5CA8FF"/>
            <path d="M2 10.4H30V20.95C30 22.65 28.65 24 26.95 24H5.05C3.35 24 2 22.65 2 20.95V10.4Z" fill="#2F86F6"/>
            <path d="M4.4 9.15H27.6" stroke="rgba(255,255,255,0.45)" stroke-width="1"/>
          </svg>
        </span>
      `;
    }

    if (item.iconType === 'file') {
      const extension = item.extension || getFileExtension(item.name);

      return `<span class="spotlight-file-icon ${getFileTypeClass(item)}" aria-hidden="true">${escapeHtml(extension)}</span>`;
    }

    return '<span class="spotlight-pdf-icon" aria-hidden="true">PDF</span>';
  }

  function renderResults() {
    const query = input.value;

    resultsEl.innerHTML = filteredItems.map(function (item, index) {
      const activeClass = index === activeIndex ? ' active' : '';

      return `
        <button class="spotlight-result${activeClass}" type="button" data-index="${index}" role="option" aria-selected="${index === activeIndex}">
          <span class="spotlight-result-icon">${getIconMarkup(item)}</span>
          <span class="spotlight-result-text">
            <span class="spotlight-result-name">${highlightMatch(item.name, query)}</span>
            <span class="spotlight-result-description">${highlightMatch(item.description, query)}</span>
          </span>
        </button>
      `;
    }).join('');
  }

  function filterResults() {
    const query = input.value.trim().toLowerCase();

    filteredItems = items.filter(function (item) {
      return item.name.toLowerCase().includes(query)
        || item.description.toLowerCase().includes(query);
    });

    activeIndex = filteredItems.length
      ? Math.max(0, Math.min(activeIndex, filteredItems.length - 1))
      : -1;
    renderResults();
  }

  function openSpotlight() {
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
    input.value = '';
    filteredItems = items;
    activeIndex = 0;
    renderResults();

    requestAnimationFrame(function () {
      input.focus();
    });
  }

  function closeSpotlight() {
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function openResult(item) {
    if (!item) return;

    if (typeof item.action === 'function') {
      item.action();
    } else if (item.url) {
      window.open(item.url, '_blank', 'noopener');
    }

    closeSpotlight();
  }

  function addItems(nextItems) {
    if (!Array.isArray(nextItems)) return;

    nextItems.forEach(function (item) {
      if (item && item.name && item.description) {
        items.push(item);
      }
    });

    filterResults();
  }

  window.spotlightControls = {
    addItems,
    refresh: filterResults,
    getItems: function () {
      return items.slice();
    }
  };

  document.addEventListener('desktopManifestItemsReady', function (e) {
    addItems(e.detail && e.detail.items);
  });

  trigger.addEventListener('click', openSpotlight);
  input.addEventListener('input', filterResults);

  resultsEl.addEventListener('mousemove', function (e) {
    const result = e.target.closest('.spotlight-result');
    if (!result) return;

    activeIndex = Number(result.dataset.index);
    renderResults();
  });

  resultsEl.addEventListener('click', function (e) {
    const result = e.target.closest('.spotlight-result');
    if (!result) return;

    openResult(filteredItems[Number(result.dataset.index)]);
  });

  overlay.addEventListener('mousedown', function (e) {
    if (e.target === overlay) {
      closeSpotlight();
    }
  });

  document.addEventListener('keydown', function (e) {
    const isShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
    const isOpen = overlay.classList.contains('visible');

    if (isShortcut) {
      e.preventDefault();
      openSpotlight();
      return;
    }

    if (!isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeSpotlight();
      return;
    }

    if (e.key === 'ArrowDown' && filteredItems.length) {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % filteredItems.length;
      renderResults();
      return;
    }

    if (e.key === 'ArrowUp' && filteredItems.length) {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + filteredItems.length) % filteredItems.length;
      renderResults();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      openResult(filteredItems[activeIndex]);
    }
  });
});
