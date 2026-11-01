// Right-click on a photo never shows the browser menu. On pages with
// allow_download, a small "Download / Save" menu appears instead.
function showContextMenu(src, pageX, pageY) {
  var menu = document.getElementById('context-menu');

  if (!menu) {
    return;
  }

  if (src) {
    menu.querySelector('a').setAttribute('href', src);
  }
  menu.style.left = pageX + 'px';
  menu.style.top = pageY + 'px';
  menu.style.display = 'block';
  menu.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 }).finished.then(function() {
    document.documentElement.addEventListener('click', function() {
      menu.style.display = 'none';
    }, { once: true });
  });
}

function setContextMenu() {
  document.querySelectorAll('.img-gallery').forEach(function(gallery) {
    gallery.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      e.stopPropagation();

      var figure = e.target.closest('figure');
      showContextMenu(figure && figure.dataset.src, e.pageX, e.pageY);
    });
  });
}
