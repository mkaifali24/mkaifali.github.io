(() => {
  const root = document.documentElement;
  const body = document.body;
  const themeButton = document.querySelector('.theme-toggle');
  const themeLabel = themeButton?.querySelector('.theme-toggle__label');
  const colorSchemeQuery = matchMedia('(prefers-color-scheme: light)');
  let savedTheme = null;

  try {
    savedTheme = localStorage.getItem('alpha-theme');
  } catch {
    savedTheme = null;
  }

  const preferredTheme = colorSchemeQuery.matches ? 'light' : 'dark';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function setTheme(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (themeButton) {
      themeButton.title = `Theme: ${theme}`;
      themeButton.setAttribute('aria-label', `Theme: ${theme}. Switch to ${nextTheme}.`);
      themeButton.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
    if (themeLabel) themeLabel.textContent = theme;
  }

  setTheme(savedTheme || preferredTheme);
  themeButton?.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    savedTheme = theme;
    try {
      localStorage.setItem('alpha-theme', theme);
    } catch {
      // Theme switching still works when browser storage is unavailable.
    }
    setTheme(theme);
  });

  colorSchemeQuery.addEventListener?.('change', (event) => {
    if (!savedTheme) setTheme(event.matches ? 'light' : 'dark');
  });

  document.querySelector('.footer__back-top')?.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

  const dotgrid = document.querySelector('.dotgrid');
  const dotTorch = dotgrid?.querySelector('.dotgrid__torch');
  const dotTorchFill = dotTorch?.querySelector('.dotgrid__torch-fill');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

  if (dotgrid && dotTorch && dotTorchFill && finePointer.matches) {
    const torchRadius = dotTorch.offsetWidth / 2;
    const illuminateDots = (event) => {
      const left = event.clientX - torchRadius;
      const top = event.clientY - torchRadius;
      dotTorch.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      dotTorchFill.style.width = `${innerWidth}px`;
      dotTorchFill.style.height = `${innerHeight}px`;
      dotTorchFill.style.transform = `translate3d(${-left}px, ${-top}px, 0)`;
    };

    addEventListener('pointermove', illuminateDots, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => {
      dotTorch.style.transform = 'translate3d(-9999px, -9999px, 0)';
    });
  }

  const banner = document.querySelector('.home-banner');

  if (banner) {
    const bannerItems = [
      banner.querySelector('.home-banner__eyebrow'),
      banner.querySelector('h1'),
      banner.querySelector('h2'),
      banner.querySelector('.home-banner__intro'),
      banner.querySelector('.home-banner__actions'),
      banner.querySelector('.home-banner__tags'),
      banner.querySelector('.home-banner__art'),
      ...banner.querySelectorAll('.banner-service'),
    ].filter(Boolean);

    if (!reduceMotion.matches) {
      requestAnimationFrame(() => {
        bannerItems.forEach((item, index) => {
          item.animate?.(
            [
              { opacity: 0, transform: 'translateY(22px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            {
              duration: 720,
              delay: 50 + index * 65,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
              fill: 'backwards',
            },
          );
        });
      });
    }

    const bannerArt = banner.querySelector('.home-banner__art');
    if (bannerArt && finePointer.matches && !reduceMotion.matches) {
      let artFrame = 0;
      let pointerX = 0;
      let pointerY = 0;

      const updateArtworkTilt = () => {
        artFrame = 0;
        const rect = bannerArt.getBoundingClientRect();
        const x = (pointerX - rect.left) / rect.width - 0.5;
        const y = (pointerY - rect.top) / rect.height - 0.5;
        bannerArt.style.setProperty('--banner-tilt-x', `${-y * 4}deg`);
        bannerArt.style.setProperty('--banner-tilt-y', `${x * 5}deg`);
        bannerArt.style.setProperty('--banner-art-scale', '1.012');
      };

      bannerArt.addEventListener('pointermove', (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!artFrame) artFrame = requestAnimationFrame(updateArtworkTilt);
      });

      bannerArt.addEventListener('pointerleave', () => {
        if (artFrame) cancelAnimationFrame(artFrame);
        artFrame = 0;
        bannerArt.style.removeProperty('--banner-tilt-x');
        bannerArt.style.removeProperty('--banner-tilt-y');
        bannerArt.style.removeProperty('--banner-art-scale');
      });
    }

    banner.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        const top = target.getBoundingClientRect().top + scrollY - 24;
        scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      });
    });
  }

  const statementLines = [...document.querySelectorAll('.stx-line')];
  const aboutSection = document.querySelector('.about');
  const aboutWords = [...document.querySelectorAll('.sf-word.is-fill')];
  let textFrame = 0;

  const updateScrollText = () => {
    textFrame = 0;
    if (reduceMotion.matches) {
      [...statementLines, ...aboutWords].forEach((item) => {
        item.style.opacity = '1';
        item.style.filter = 'none';
        item.style.transform = 'none';
      });
      return;
    }

    const viewportHeight = innerHeight;
    statementLines.forEach((line) => {
      const rect = line.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const proximity = Math.max(0, 1 - Math.abs(center - viewportHeight * 0.46) / (viewportHeight * 0.45));
      const isInFocus = proximity >= 0.6;
      line.style.opacity = isInFocus ? '1' : '0.14';
      line.style.filter = isInFocus ? 'none' : 'blur(1.4px)';
      line.style.transform = `translateY(${(1 - proximity) * 7}px)`;
    });

    if (aboutSection && aboutWords.length) {
      const rect = aboutSection.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (viewportHeight * 0.82 - rect.top) / (rect.height + viewportHeight * 0.28)));
      const frontier = progress * (aboutWords.length + 6);
      aboutWords.forEach((word, index) => {
        const isRevealed = frontier >= index + 0.5;
        word.style.opacity = isRevealed ? '1' : '0.16';
        word.style.filter = isRevealed ? 'none' : 'blur(1.25px)';
      });
    }
  };

  const queueScrollText = () => {
    if (!textFrame) textFrame = requestAnimationFrame(updateScrollText);
  };

  addEventListener('scroll', queueScrollText, { passive: true });
  addEventListener('resize', queueScrollText, { passive: true });
  reduceMotion.addEventListener?.('change', queueScrollText);
  queueScrollText();

  const toggle = document.querySelector('.menu__toggle');
  const header = document.querySelector('.menu');
  if (toggle && header) {
    const overlay = document.createElement('nav');
    overlay.className = 'menu-overlay';
    overlay.hidden = true;
    overlay.setAttribute('aria-label', 'Main navigation');
    overlay.innerHTML = `
      <div class="menu-overlay__inner container">
        <ol class="menu-overlay__list">
          <li class="menu-overlay__item"><a class="menu-overlay__link" href="/#services"><span class="menu-overlay__idx">01</span><span class="menu-overlay__word-wrap"><span class="menu-overlay__word">Skills</span></span></a></li>
          <li class="menu-overlay__item"><a class="menu-overlay__link" href="/work"><span class="menu-overlay__idx">02</span><span class="menu-overlay__word-wrap"><span class="menu-overlay__word">Work</span></span></a></li>
          <li class="menu-overlay__item"><a class="menu-overlay__link" href="/#about"><span class="menu-overlay__idx">03</span><span class="menu-overlay__word-wrap"><span class="menu-overlay__word">About</span></span></a></li>
          <li class="menu-overlay__item"><a class="menu-overlay__link" href="/#contact"><span class="menu-overlay__idx">04</span><span class="menu-overlay__word-wrap"><span class="menu-overlay__word">Contact</span></span></a></li>
        </ol>
      </div>`;
    header.insertAdjacentElement('afterend', overlay);

    const closeMenu = () => {
      overlay.hidden = true;
      toggle.classList.remove('is-open');
      header.classList.remove('menu--open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      toggle.querySelector('.menu__toggle-label').textContent = 'menu';
      body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      const opening = overlay.hidden;
      if (!opening) return closeMenu();
      overlay.hidden = false;
      toggle.classList.add('is-open');
      header.classList.add('menu--open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      toggle.querySelector('.menu__toggle-label').textContent = 'close';
      body.style.overflow = 'hidden';
    });
    overlay.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !overlay.hidden) closeMenu();
    });
  }

  const cursor = document.querySelector('.cursor-dot');
  if (cursor && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    body.dataset.cursor = 'on';
    addEventListener('pointermove', (event) => {
      cursor.style.opacity = '1';
      cursor.style.transform = `translate(-50%, -50%) translate(${event.clientX}px, ${event.clientY}px)`;
      const mode = event.target.closest('[data-cursor]')?.dataset.cursor;
      cursor.dataset.mode = ['view', 'drag'].includes(mode) ? mode : 'on';
      cursor.querySelector('.cursor-label').textContent = ['view', 'drag'].includes(mode) ? mode : '';
    });
    addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    document.documentElement.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  }
})();
