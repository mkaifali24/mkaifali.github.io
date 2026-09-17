(() => {
  const root = document.documentElement;
  const body = document.body;
  const themeButton = document.querySelector('.theme-toggle');
  const themeIcon = themeButton?.querySelector('.theme-toggle__icon');
  const themeLabel = themeButton?.querySelector('.theme-toggle__label');
  const savedTheme = localStorage.getItem('alpha-theme');
  const preferredTheme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

  function setTheme(theme) {
    root.dataset.theme = theme;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (themeButton) {
      themeButton.title = `Theme: ${theme}`;
      themeButton.setAttribute('aria-label', `Theme: ${theme}. Switch to ${nextTheme}.`);
    }
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '●' : '○';
    if (themeLabel) themeLabel.textContent = theme;
  }

  setTheme(savedTheme || preferredTheme);
  themeButton?.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('alpha-theme', theme);
    setTheme(theme);
  });

  document.querySelector('.footer__back-top')?.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });

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
          <li class="menu-overlay__item"><a class="menu-overlay__link" href="#services"><span class="menu-overlay__idx">01</span><span class="menu-overlay__word-wrap"><span class="menu-overlay__word">Services</span></span></a></li>
          <li class="menu-overlay__item"><a class="menu-overlay__link" href="#work"><span class="menu-overlay__idx">02</span><span class="menu-overlay__word-wrap"><span class="menu-overlay__word">Work</span></span></a></li>
          <li class="menu-overlay__item"><a class="menu-overlay__link" href="#about"><span class="menu-overlay__idx">03</span><span class="menu-overlay__word-wrap"><span class="menu-overlay__word">About</span></span></a></li>
          <li class="menu-overlay__item"><a class="menu-overlay__link" href="#contact"><span class="menu-overlay__idx">04</span><span class="menu-overlay__word-wrap"><span class="menu-overlay__word">Contact</span></span></a></li>
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

  const blob = document.querySelector('.floating-blob');
  const blobAnchor = document.querySelector('#blob-header-anchor');
  const blobCanvas = blob?.querySelector('canvas');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  if (blob && blobAnchor && blobCanvas) {
    const context = blobCanvas.getContext('2d');
    if (!context) return;
    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const locateBlob = () => {
      const anchor = blobAnchor.getBoundingClientRect();
      targetX = anchor.left + anchor.width / 2 - 60;
      targetY = anchor.top + anchor.height / 2 - 60;
      if (!frame) {
        currentX = targetX;
        currentY = targetY;
      }
    };

    const drawBlob = (time = 0) => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const size = 120;
      if (blobCanvas.width !== size * dpr || blobCanvas.height !== size * dpr) {
        blobCanvas.width = size * dpr;
        blobCanvas.height = size * dpr;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, size, size);

      const phase = reduceMotion.matches ? 0 : time * 0.00065;
      const points = 10;
      const center = size / 2;
      const radius = 31;
      context.beginPath();
      for (let i = 0; i <= points; i += 1) {
        const angle = (i / points) * Math.PI * 2;
        const wobble = Math.sin(angle * 3 + phase * 2.1) * 4 + Math.cos(angle * 5 - phase) * 2.5;
        const x = center + Math.cos(angle) * (radius + wobble);
        const y = center + Math.sin(angle) * (radius + wobble);
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();

      const isLight = root.dataset.theme === 'light';
      const gradient = context.createRadialGradient(47, 43, 4, center, center, 39);
      if (isLight) {
        gradient.addColorStop(0, '#6e665b');
        gradient.addColorStop(0.55, '#332f2a');
        gradient.addColorStop(1, '#171614');
      } else {
        gradient.addColorStop(0, '#fffdf6');
        gradient.addColorStop(0.5, '#c8c0b3');
        gradient.addColorStop(1, '#6c6257');
      }
      context.fillStyle = gradient;
      context.shadowColor = isLight ? 'rgba(0, 0, 0, .24)' : 'rgba(255, 246, 226, .2)';
      context.shadowBlur = 18;
      context.fill();

      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      blob.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frame = requestAnimationFrame(drawBlob);
    };

    locateBlob();
    addEventListener('resize', locateBlob, { passive: true });
    frame = requestAnimationFrame(drawBlob);
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
