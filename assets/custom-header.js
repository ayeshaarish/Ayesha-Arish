/**
 * --------------------------------------------------------
 * Custom Header
 * --------------------------------------------------------
 * Handles the mobile navigation drawer.
 * Vanilla JavaScript only.
 * --------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.custom-header__toggle');
  const menuClose = document.querySelector('.custom-mobile-menu__close');
  const mobileMenu = document.querySelector('.custom-mobile-menu');

  // Exit if the section isn't on the page
  if (!menuToggle || !menuClose || !mobileMenu) return;

  /**
   * Open mobile menu
   */
  const openMenu = () => {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('overflow-hidden');
  };

  /**
   * Close mobile menu
   */
  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('overflow-hidden');
  };

  // Open menu
  menuToggle.addEventListener('click', openMenu);

  // Close menu
  menuClose.addEventListener('click', closeMenu);

  // Close with Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  // Close when clicking outside the drawer
  document.addEventListener('click', (event) => {
    const clickedInsideMenu = mobileMenu.contains(event.target);
    const clickedToggle = menuToggle.contains(event.target);

    if (
      mobileMenu.classList.contains('is-open') &&
      !clickedInsideMenu &&
      !clickedToggle
    ) {
      closeMenu();
    }
  });
});