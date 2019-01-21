jQuery(document).ready(function() {
  $('body').on('click', '.fancybox-button.icon-forward', function() {
    var title = $('.fancybox-caption').text();
    var url = window.location.href;

    $('#shareModal').modal('show');
    setModalValues(title, url);

    $.fancybox.close();
  });

  $('#shareModal').on('show.bs.modal', function(e) {
    var photo = $(e.relatedTarget);
    var title = photo.data('title');
    var url = photo.data('url');

    if (typeof title !== 'undefined') {
      setModalValues(title, url);
    }
  });

  $('#shareModal').on('shown.bs.modal', function() {
    $('#photo-url').select();
  });

  $('#copy-photo-url').click(function() {
    $('#photo-url').select();
    document.execCommand('copy');

    $('#photo-url').popover({ content: 'Copied', placement: 'top' });
    $('#photo-url').popover('show');
  });
});

function setModalValues(title, url) {
  $('#photo-title').text('Share: ' + title);
  $('#photo-url').val(url);
}
