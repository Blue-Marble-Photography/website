var contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function(event) {
    if (!contactForm.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }

    contactForm.classList.add('was-validated');
  });
}

function parseUriHash() {
  if (window.location.hash === '#submitted') {
    document.querySelectorAll('.submitted').forEach(function(el) {
      el.classList.remove('d-none');
    });
    document.querySelectorAll('form').forEach(function(el) {
      el.classList.add('d-none');
    });
  }
}
