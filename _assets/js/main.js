jQuery(document).ready(function() {
  parseUriHash();
  setContextMenu();
  createInstagramFeed();
  setLightboxDefaults();
});

$(document).scroll(function() {
  $('.fixed-top').toggleClass('scrolled', $(this).scrollTop() > $('.fixed-top').height() * 2);
});

$('.fancybox-image, .zoom-in, .img-gallery figure img').longpress(function(e) {
  e.preventDefault();
});
