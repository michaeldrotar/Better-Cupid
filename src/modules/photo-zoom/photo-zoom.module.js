var self;
exports = {
  id: 'photoZoom',
  name: 'Photo Zoom',
  description: 'Enlarges small photos when clicked',
  required: false,
  imageSelector: 'img[src*=load_okc_image]:not([id*=thumb])',
  imageTest: /\/\/([^\/]+)\/php\/load_okc_image.php\/images(?:\/\d+x\d+){4}\/\d+\/(\d+)\.webp\?v=\d+/,
  magnifier: $('<div class="bc-photo-zoom-magnifier icon-search"></div>'),
  overlay: $('<div class="bc-photo-zoom-overlay"></div>'),
  target: null,
  init: function() {
    self = this;
  },
  runScript: function() {
    $('body').append(self.magnifier, self.overlay);

    $(document).on('mouseenter', self.imageSelector, function(e) {
      console.log('check it');
      if ( self.imageTest.test(this.src) ) {
        self.bindTo(this);
      }
    });

    self.overlay.on('click', function() {
      self.overlay.removeClass('is-visible');
    });

    self.magnifier.on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      self.show(self.target);
    }).on('mouseout', function(e) {
      self.magnifier.removeClass('is-visible');
    });
  },
  bindTo: function(img) {
    img = $(img);
    var pos = img.position(),
        width = img.outerWidth(),
        height = img.outerHeight();
    img.offsetParent().append(self.magnifier);
    self.magnifier.css({
      width: width,
      height: height,
      left: pos.left,
      top: pos.top,
      fontSize: height * 0.6,
      paddingTop: height * 0.2
    }).addClass('is-visible');
    self.target = img[0];
  },
  hideIndicator: function() {
    self.magnifier.removeClass('is-visible');
  },
  show: function(img) {
    var match = self.imageTest.exec(img.src),
        domain, id, src;
    if ( match ) {
      domain = match[1];
      id = match[2];
      src = '//'+domain+'/php/load_okc_image.php/images/'+id+'.webp?v=2'
      self.overlay.css('background-image', 'url("'+src+'")')
        .addClass('is-visible');
    }
  }
};
