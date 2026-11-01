// Right-click on a photo never shows the browser menu. On pages with
// allow_download, a small "Download / Save" menu appears instead.
function showContextMenu(src, pageX, pageY) {
  if (!$('#context-menu').length) {
    return;
  }

  $('#context-menu > ul > li > a').attr('href', src);

  $('#context-menu').css({
    left: pageX,
    top: pageY
  });

  $('#context-menu').fadeIn(250, function() {
    $('html').one('click', function() {
      $('#context-menu').hide();
    });
  });
}

function setContextMenu() {
  $('.img-gallery').contextmenu(function(e) {
    showContextMenu($(e.target).closest('figure').data('src'), e.pageX, e.pageY);
    return false;
  });
}
