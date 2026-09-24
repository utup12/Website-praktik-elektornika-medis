(() => {
  const menuButton = document.querySelector('.nav-menu-toggle');
  const navigation = document.querySelector('.main-nav');

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

})();
