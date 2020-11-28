function setLightboxDefaults() {
  $.fancybox.defaults.loop = true;
  $.fancybox.defaults.clickOutside = 'close';
  $.fancybox.defaults.buttons = [
    'fullScreen',
    'share',
    'facebook',
    'twitter',
    'download',
    'purchase',
    'thumbs',
    'close'
  ];
  $.fancybox.defaults.animationEffect = 'zoom-in-out';
  $.fancybox.defaults.btnTpl.fullScreen =
    '<button data-fancybox-fullscreen class="fancybox-button icon-resize-full" title="Expand to Full Screen"></button>';
  $.fancybox.defaults.btnTpl.purchase =
    '<button class="fancybox-button icon-cart-plus d-none" title="Purchase Print"></button>';
  $.fancybox.defaults.btnTpl.download =
    '<button class="fancybox-button icon-download d-none" title="Download"></button>';
  $.fancybox.defaults.btnTpl.share =
    '<button class="fancybox-button icon-forward" title="Share Link"></button>';
  $.fancybox.defaults.btnTpl.facebook =
    '<button class="fancybox-button icon-facebook-squared" title="Share on Facebook"></button>';
  $.fancybox.defaults.btnTpl.twitter =
    '<button class="fancybox-button icon-twitter-squared" title="Share on Twitter"></button>';
  $.fancybox.defaults.beforeShow = function(instance, slide) {
    var btnPrint = $('button.fancybox-button.icon-cart-plus');
    var btnDownload = $('button.fancybox-button.icon-download');

    if ($('#image-' + slide.index + '-actions > a.icon-cart-plus').length) {
      var printDetails = $('#image-' + slide.index + '-actions > a.icon-cart-plus');

      if (printDetails.attr('data-item-id')) {
        btnPrint.data('item-id', printDetails.data('item-id'));
      }
      if (printDetails.attr('data-item-name')) {
        btnPrint.data('item-name', printDetails.data('item-name'));
      }
      if (printDetails.attr('data-item-price')) {
        btnPrint.data('item-price', printDetails.data('item-price'));
      }
      if (printDetails.attr('data-item-shippable')) {
        btnPrint.data('item-shippable', printDetails.data('item-shippable'));
      }
      if (printDetails.attr('data-item-taxable')) {
        btnPrint.data('item-taxable', printDetails.data('item-taxable'));
      }
      if (printDetails.attr('data-item-url')) {
        btnPrint.data('item-url', printDetails.data('item-url'));
      }
      if (printDetails.attr('data-item-image')) {
        btnPrint.data('item-image', printDetails.data('item-image'));
      }
      if (printDetails.attr('data-item-custom1-name')) {
        btnPrint.data('item-custom1-name', printDetails.data('item-custom1-name'));
      }
      if (printDetails.attr('data-item-custom1-options')) {
        btnPrint.data('item-custom1-options', printDetails.data('item-custom1-options'));
      }
      if (printDetails.attr('data-item-custom1-value')) {
        btnPrint.data('item-custom1-value', printDetails.data('item-custom1-value'));
      }

      btnPrint.addClass('snipcart-add-item');
      btnPrint.removeClass('d-none');
    } else {
      btnPrint.addClass('d-none');
    }

    if ($('#image-' + slide.index + '-actions > a.icon-download').length) {
      var downloadDetails = $('#image-' + slide.index + '-actions > a.icon-download');

      if (downloadDetails.attr('data-item-id')) {
        btnDownload.data('item-id', downloadDetails.data('item-id'));
      }
      if (downloadDetails.attr('data-item-file-guid')) {
        btnDownload.data('item-file-guid', downloadDetails.data('item-file-guid'));
      }
      if (downloadDetails.attr('data-item-max-quantity')) {
        btnDownload.data('item-max-quantity', downloadDetails.data('item-max-quantity'));
      }
      if (downloadDetails.attr('data-item-name')) {
        btnDownload.data('item-name', downloadDetails.data('item-name'));
      }
      if (downloadDetails.attr('data-item-price')) {
        btnDownload.data('item-price', downloadDetails.data('item-price'));
      }
      if (downloadDetails.attr('data-item-shippable')) {
        btnDownload.data('item-shippable', downloadDetails.data('item-shippable'));
      }
      if (downloadDetails.attr('data-item-taxable')) {
        btnDownload.data('item-taxable', downloadDetails.data('item-taxable'));
      }
      if (downloadDetails.attr('data-item-url')) {
        btnDownload.data('item-url', downloadDetails.data('item-url'));
      }
      if (downloadDetails.attr('data-item-image')) {
        btnDownload.data('item-image', downloadDetails.data('item-image'));
      }
      if (downloadDetails.attr('data-item-custom1-name')) {
        btnDownload.data('item-custom1-name', downloadDetails.data('item-custom1-name'));
      }
      if (downloadDetails.attr('data-item-custom1-options')) {
        btnDownload.data('item-custom1-options', downloadDetails.data('item-custom1-options'));
      }
      if (downloadDetails.attr('data-item-custom1-value')) {
        btnDownload.data('item-custom1-value', downloadDetails.data('item-custom1-value'));
      }

      btnDownload.addClass('snipcart-add-item');
      btnDownload.removeClass('d-none');
    } else {
      btnDownload.addClass('d-none');
    }
  };
  $.fancybox.defaults.afterShow = function() {
    $('.fancybox-slide--current .fancybox-image').contextmenu(function(e) {
      e.preventDefault();

      if ($('#context-menu').length) {
        var index = parseInt($('[data-fancybox-index]').html()) - 1;
        var src = $('#image-' + index).data('src');

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
  };
}

jQuery(document).ready(function() {
  $('body').on('click', '.fancybox-button.icon-facebook-squared', function() {
    window.open(
      'https://www.facebook.com/sharer/sharer.php?u=' +
        encodeURIComponent(window.location.href) +
        '&t=' +
        encodeURIComponent(document.title)
    );
  });

  $('body').on('click', '.fancybox-button.icon-twitter-squared', function() {
    window.open(
      'https://twitter.com/intent/tweet?text=' +
        encodeURIComponent(document.title) +
        '&via=BlueMarblePhoto&url=' +
        encodeURIComponent(window.location.href)
    );
  });
});
