(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-nav');
  const themeButton = document.querySelector('.theme-toggle');

  if (menuButton && navigation) {
    const closeMenu = () => {
      navigation.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    };

    menuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !navigation.classList.contains('open');
      navigation.classList.toggle('open', willOpen);
      menuButton.setAttribute('aria-expanded', String(willOpen));
    });

    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('click', (event) => {
      if (!navigation.contains(event.target) && !menuButton.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  if (themeButton) {
    const savedTheme = localStorage.getItem('pem-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');

    const applyTheme = (theme) => {
      document.documentElement.dataset.theme = theme;
      const dark = theme === 'dark';
      themeButton.setAttribute('aria-label', dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
      themeButton.querySelector('span').textContent = dark ? '☀' : '◐';
    };

    applyTheme(initialTheme);

    themeButton.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('pem-theme', nextTheme);
      applyTheme(nextTheme);
    });
  }
})();
