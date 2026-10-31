$('#contactForm').submit(function(event) {
  if ($(this)[0].checkValidity() === false) {
    event.preventDefault();
    event.stopPropagation();
  }

  $(this).addClass('was-validated');
});

function parseUriHash() {
  if (window.location.hash) {
    var hash = window.location.hash.substring(1);

    if (hash == 'submitted') {
      $('.submitted').removeClass('d-none');
      $('form').addClass('d-none');
    }
  }
}
