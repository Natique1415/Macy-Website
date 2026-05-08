document.addEventListener('DOMContentLoaded', function () {
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
      name: 'Gmail',
      description: 'Compose email',
      url: 'mailto:ibrarnatique8@gmail.com',
      icon: 'icons/gmail.svg'
    },
    {
      name: 'Resume PDF',
      description: 'Open resume PDF',
      url: 'https://natique1415.github.io/Macy-Website/resume.pdf',
      icon: null
    }
  ];

  let filteredItems = items;
  let activeIndex = 0;

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, function (char) {
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
      return `<img src="${item.icon}" alt="" />`;
    }

    return '<span class="spotlight-pdf-icon">PDF</span>';
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

    activeIndex = filteredItems.length ? Math.min(activeIndex, filteredItems.length - 1) : -1;
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

    window.open(item.url, '_blank', 'noopener');
    closeSpotlight();
  }

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
