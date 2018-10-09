function setContextMenu() {
  $('.img-gallery').contextmenu(function(e) {
    if ($('#context-menu').length) {
      var src = $(e.target)
        .closest('figure')
        .data('src');

      $('#context-menu > ul > li > a').attr('href', src);

      $('#context-menu').css({
        left: e.pageX,
        top: e.pageY
      });

      $('#context-menu').fadeIn(250, function() {
        $('html').click(function() {
          $('#context-menu').hide();
        });
      });
    }

    return false;
  });
}
