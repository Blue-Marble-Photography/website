function createInstagramFeed() {
  var feed = new Instafeed({
    get: 'user',
    userId: '225864342',
    limit: 6,
    sortBy: 'most-recent',
    resolution: 'standard_resolution',
    links: true,
    accessToken: '225864342.c6ce041.57b3a28d58294f899134818121774d43',
    template: '<div class="col-12 col-lg-4 p-1 m-0">' +
                '<a href="{{link}}" target="_blank" rel="noopener">' +
                  '<div style="width: 100%; padding-bottom: 100%; background: url(\'{{image}}\') center / cover no-repeat;" role="img" aria-label="{{caption}}"></div>' +
                '</a>' +
              '</div>'
  });

  feed.run();
}
