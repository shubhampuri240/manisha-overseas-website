/* Stage 2: progressive navigation and unobtrusive page polish. */
(() => {
  'use strict';
  const nav = document.querySelector('.home-page .edition-nav');
  if (!nav) return;
  let scheduled = false;
  const paint = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 70);
    scheduled = false;
  };
  const onScroll = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(paint); }
  };
  paint();
  addEventListener('scroll', onScroll, { passive: true });
  const menu = nav.querySelector('.mobile-menu');
  const navigation = nav.querySelector('nav');
  if (menu && navigation) {
    menu.setAttribute('aria-haspopup', 'true');
    navigation.setAttribute('aria-label', 'Main navigation');
  }
})();
