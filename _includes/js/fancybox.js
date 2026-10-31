function setLightboxDefaults() {
    $.fancybox.defaults.loop = true;
    $.fancybox.defaults.clickOutside = "close";
    $.fancybox.defaults.buttons = [
        "fullScreen",
        "share",
        "facebook",
        "download",
        "thumbs",
        "close",
    ];
    $.fancybox.defaults.animationEffect = "zoom-in-out";
    $.fancybox.defaults.btnTpl.fullScreen =
        '<button data-fancybox-fullscreen class="fancybox-button icon-resize-full" title="Expand to Full Screen"></button>';
    $.fancybox.defaults.btnTpl.download =
        '<a class="fancybox-button icon-download d-none" title="Download" target="_blank" download></a>';
    $.fancybox.defaults.btnTpl.share =
        '<button class="fancybox-button icon-forward" title="Share Link"></button>';
    $.fancybox.defaults.btnTpl.facebook =
        '<button class="fancybox-button icon-facebook-squared" title="Share on Facebook"></button>';

    // Show the toolbar download link only for images that have one in the gallery markup.
    $.fancybox.defaults.beforeShow = function (instance, slide) {
        var btnDownload = $(".fancybox-button.icon-download");
        var source = $("#image-" + slide.index + "-actions > a.icon-download");

        if (source.length) {
            btnDownload.attr("href", source.attr("href")).removeClass("d-none");
        } else {
            btnDownload.removeAttr("href").addClass("d-none");
        }
    };

    $.fancybox.defaults.afterShow = function (instance, slide) {
        $(".fancybox-slide--current .fancybox-image").contextmenu(function (e) {
            e.preventDefault();

            if ($("#context-menu").length) {
                var src = $("#image-" + slide.index).data("src");

                $("#context-menu > ul > li > a").attr("href", src);

                $("#context-menu").css({
                    left: e.pageX,
                    top: e.pageY,
                });

                $("#context-menu").fadeIn(250, function () {
                    $("html").click(function () {
                        $("#context-menu").hide();
                    });
                });
            }

            return false;
        });
    };
}

jQuery(document).ready(function () {
    $("body").on(
        "click",
        ".fancybox-button.icon-facebook-squared",
        function () {
            window.open(
                "https://www.facebook.com/sharer/sharer.php?u=" +
                    encodeURIComponent(window.location.href) +
                    "&t=" +
                    encodeURIComponent(document.title)
            );
        }
    );
});
