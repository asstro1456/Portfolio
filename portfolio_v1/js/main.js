const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];
const backToTopButton = document.querySelector('.back-to-top');
const spySections = [...document.querySelectorAll('[data-spy-section]')];

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const updateActiveSection = () => {
  const scrollY = window.scrollY + 120;
  let currentId = '';

  spySections.forEach((section) => {
    if (scrollY >= section.offsetTop) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const targetId = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('active', targetId === currentId);
  });
};

window.addEventListener('scroll', () => {
  updateActiveSection();

  if (!backToTopButton) return;
  backToTopButton.classList.toggle('is-visible', window.scrollY > 560);
});

window.addEventListener('load', updateActiveSection);

if (backToTopButton) {
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
