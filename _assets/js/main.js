jQuery(document).ready(function () {
    parseUriHash();
    setContextMenu();
    enableDownloadNotifications();

    if (typeof $.fancybox === 'object') {
        setLightboxDefaults();
    }
});

$(document).scroll(function () {
    $('.fixed-top').toggleClass('scrolled', $(this).scrollTop() > $('.fixed-top').height() * 2);
});

$('.fancybox-image, .zoom-in, .img-gallery figure img').longpress(function (e) {
    e.preventDefault();
});

function enableDownloadNotifications() {
    $('a.icon-download')
        .not('a.snipcart-add-item')
        .click(function (e) {
            $.ajax({
                type: 'GET',
                url: 'https://api.bluemarble.photography/v2/notify',
                data: {
                    filename: $(this).attr('href').substring(48),
                },
                crossDomain: true,
                dataType: 'json',
                headers: {
                    'x-api-key': 'TV8O0eE90q6pES62umsuW7Qxl2GNX1uA7J4Dcl3C',
                },
                success: function (data, status) {
                    console.log('Data: ' + data + '\nStatus: ' + status);
                },
            });
        });
}
