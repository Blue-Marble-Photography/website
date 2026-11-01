// Scripts load with defer, so the DOM is ready here.
parseUriHash();
setContextMenu();
setLightbox();

(function () {
  var navbar = document.querySelector('.fixed-top');

  if (!navbar) {
    return;
  }

  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > navbar.offsetHeight * 2);
  }

  document.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
})();
