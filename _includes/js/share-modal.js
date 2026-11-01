(function () {
  var modal = document.getElementById('shareModal');

  if (!modal) {
    return;
  }

  var input = document.getElementById('photo-url');

  modal.addEventListener('show.bs.modal', function(e) {
    var photo = e.relatedTarget;

    if (photo && photo.dataset.title !== undefined) {
      setModalValues(photo.dataset.title, photo.dataset.url);
    }
  });

  modal.addEventListener('shown.bs.modal', function() {
    input.select();
  });

  modal.addEventListener('hide.bs.modal', function() {
    var popover = bootstrap.Popover.getInstance(input);

    if (popover) {
      popover.hide();
    }
  });

  document.getElementById('copy-photo-url').addEventListener('click', function() {
    input.select();
    navigator.clipboard.writeText(input.value).catch(function() {
      document.execCommand('copy');
    });

    bootstrap.Popover.getOrCreateInstance(input, { content: 'Copied', placement: 'top', trigger: 'manual' }).show();
  });
})();

function setModalValues(title, url) {
  document.getElementById('photo-title').textContent = 'Share: ' + title;
  document.getElementById('photo-url').value = url;
}
