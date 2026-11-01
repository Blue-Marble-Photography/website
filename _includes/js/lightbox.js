// Gallery lightbox (lightGallery 3). One gallery per page: the element marked
// data-lg-gallery, with photos marked data-lg-item. Slide N is addressable as
// #gallery-N (1-based), the format the share links have always used.
function setLightbox() {
  var container = document.querySelector('[data-lg-gallery]');

  if (!container || typeof window.lightGallery !== 'function') {
    return;
  }

  var hashPattern = /^#gallery-(\d+)$/;

  container.addEventListener('lgInit', function(event) {
    var gallery = event.detail.instance;

    var button = document.createElement('button');

    button.type = 'button';
    button.className = 'lg-icon lg-share-link icon-forward';
    button.title = 'Share Link';
    button.setAttribute('aria-label', 'Share Link');
    gallery.outer.get().querySelector('.lg-toolbar').appendChild(button);

    // The thumbnail strip starts hidden and the grid button toggles only the strip
    // (lightGallery's own toggle would also hide the caption). Entering full screen
    // hides the strip; leaving restores it. Zooming hides strip and caption (lightGallery CSS).
    var outer = gallery.outer.get();
    var fullscreen = false;
    var stripWasHidden = true;

    outer.classList.add('lg-thumbs-hidden');

    outer.addEventListener('click', function(e) {
      if (e.target.closest('.lg-toggle-thumb')) {
        e.stopPropagation();
        outer.classList.toggle('lg-thumbs-hidden');
      }
    }, true);

    // Clicking or tapping the photo returns to the gallery, as the old lightbox did.
    // A drag or swipe (moved more than a few pixels) doesn't count. Pinch zoom still works.
    var pointer = null;

    outer.addEventListener('pointerdown', function(e) {
      pointer = { x: e.clientX, y: e.clientY };
    }, true);

    outer.addEventListener('click', function(e) {
      var moved = !pointer || Math.abs(e.clientX - pointer.x) + Math.abs(e.clientY - pointer.y) > 5;

      if (e.target.classList.contains('lg-image') && !moved && !outer.classList.contains('lg-zoomed')) {
        gallery.closeGallery();
      }
    });

    new MutationObserver(function() {
      var isFullscreen = outer.classList.contains('lg-fullscreen-on');

      if (isFullscreen === fullscreen) {
        return;
      }

      fullscreen = isFullscreen;

      if (fullscreen) {
        stripWasHidden = outer.classList.contains('lg-thumbs-hidden');
        outer.classList.add('lg-thumbs-hidden');
      } else {
        outer.classList.toggle('lg-thumbs-hidden', stripWasHidden);
      }
    }).observe(outer, { attributes: true, attributeFilter: ['class'] });

    button.addEventListener('click', function() {
      var title = gallery.galleryItems[gallery.index].subHtml || document.title;
      var url = window.location.href;

      gallery.closeGallery();
      setModalValues(title, url);
      $('#shareModal').modal('show');
    });
  });

  var gallery = lightGallery(container, {
    selector: '[data-lg-item]',
    plugins: [lgThumbnail, lgZoom, lgFullscreen, lgShare],
    licenseKey: '0000-0000-000-0000',
    loop: true,
    closeOnTap: true,
    counter: true,
    download: true,
    allowMediaOverlap: true,
    toggleThumb: true,
    actualSize: false,
    twitter: false,
    pinterest: false,
    mobileSettings: {
      controls: false,
      showCloseIcon: true,
      download: true
    }
  });

  // The srcset "w" values are viewport breakpoints, not image widths, so the zoom
  // plugin would treat a 2064px photo as 992px and refuse to zoom. Give it the real
  // width of the file that loaded.
  container.addEventListener('lgSlideItemLoad', function(event) {
    var index = event.detail.index;
    var image = gallery.outer.get().querySelectorAll('.lg-item')[index];

    image = image && image.querySelector('.lg-image');

    if (image && image.naturalWidth) {
      gallery.galleryItems[index].width = image.naturalWidth;
    }
  });

  container.addEventListener('lgAfterSlide', function(event) {
    var index = event.detail.index;
    var image = gallery.outer.get().querySelector('.lg-current .lg-image');

    history.replaceState(null, '', '#gallery-' + (index + 1));

    // Every download URL is served as an attachment (CloudFront for originals, the
    // resize Lambda for watermarked copies), so download in place instead of a new tab.
    var download = gallery.outer.get().querySelector('.lg-download');

    if (download) {
      download.removeAttribute('target');
    }

    if (image && !image.dataset.contextMenu) {
      image.dataset.contextMenu = 'true';
      image.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showContextMenu($('#image-' + gallery.index).data('src'), e.pageX, e.pageY);
      });
    }
  });

  // lightGallery's first Escape only hides the toolbar/thumbnails when they can be
  // toggled; close on the first press instead, as the old lightbox did.
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && gallery.lgOpened) {
      e.stopPropagation();
      gallery.closeGallery();
    }
  }, true);

  container.addEventListener('lgBeforeOpen', function() {
    gallery.outer.get().classList.add('lg-thumbs-hidden');
  });

  container.addEventListener('lgAfterClose', function() {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  });

  document.querySelectorAll('[data-lg-open]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      gallery.openGallery(parseInt(link.dataset.lgOpen, 10));
    });
  });

  var match = window.location.hash.match(hashPattern);

  if (match) {
    var index = parseInt(match[1], 10) - 1;

    if (index >= 0 && index < gallery.galleryItems.length) {
      gallery.openGallery(index);
    }
  }
}
