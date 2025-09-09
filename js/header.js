document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const navToggle = document.querySelector('.nav__toggle');
  const navLogo = document.querySelector('.nav__logo');
  const mobileMenu = document.querySelector('.nav__mobile-menu');
  const navLinks = document.querySelectorAll('.nav__mobile-menu .nav__link');

  let lastScroll = 0;
  const scrollThreshold = 50;

  // Handle mobile menu toggle
  navToggle.addEventListener('click', () => {
    const isActive = navToggle.classList.contains('active');
    
    if (!isActive) {
      // Opening menu
      navToggle.classList.add('active');
      navLogo.classList.add('hidden');
      mobileMenu.classList.add('active');
    } else {
      // Closing menu
      navToggle.classList.remove('active');
      navLogo.classList.remove('hidden');
      mobileMenu.classList.remove('active');
    }
  });

  // Close mobile menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLogo.classList.remove('hidden');
      mobileMenu.classList.remove('active');
    });
  });

  // Handle header show/hide on scroll
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
      header.classList.remove('hidden');
      return;
    }

    if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
      // Scrolling down
      header.classList.add('hidden');
    } else {
      // Scrolling up
      header.classList.remove('hidden');
    }

    lastScroll = currentScroll;
  });
});
