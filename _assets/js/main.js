jQuery(document).ready(function() {
  parseUriHash();
  setContextMenu();
  createInstagramFeed();
  enableDownloadNotifications();

  if (typeof $.fancybox === 'object') {
    setLightboxDefaults();
  }
});

$(document).scroll(function() {
  $('.fixed-top').toggleClass('scrolled', $(this).scrollTop() > $('.fixed-top').height() * 2);
});

$('.fancybox-image, .zoom-in, .img-gallery figure img').longpress(function(e) {
  e.preventDefault();
});

function enableDownloadNotifications() {
  $('#context-menu a.icon-download').click(function(e) {
    $.ajax({
      type: 'GET',
      url: 'https://yuprby6yi1.execute-api.us-east-1.amazonaws.com/prod/notify',
      data: {
        filename: $(this)
          .attr('href')
          .substring(32)
      },
      crossDomain: true,
      dataType: 'json',
      headers: { 'x-api-key': 'TV8O0eE90q6pES62umsuW7Qxl2GNX1uA7J4Dcl3C' },
      success: function(data, status) {
        console.log('Data: ' + data + '\nStatus: ' + status);
      }
    });
  });
}
