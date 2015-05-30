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
    var self = this;
    $('body').append(self.magnifier, self.overlay);

    $(document).on('mouseenter', '.link_cover', function(e) {
      var image = $(this).parent().find('.user_image img');
      if ( image.length ) {
        self.onHover(image[0]);
      }
    });

    $(document).on('mouseenter', self.imageSelector, function(e) {
      self.onHover(this);
    });

    self.overlay.on('click', function() {
      self.overlay.removeClass('is-visible');
    });

  },
  bindTo: function(img) {
    img = $(img);
    var pos = img.position(),
        width = img.outerWidth(),
        height = img.outerHeight();
    img.offsetParent().append(this.magnifier);
    this.magnifier.css({
      width: width,
      height: height,
      left: pos.left,
      top: pos.top,
      fontSize: height * 0.6,
      paddingTop: height * 0.2
    }).addClass('is-visible');
    this.target = img[0];
  },
  checkImage: function(img) {
    var properUrl = this.imageTest.test(img.src),
        inNav     = $(img).closest('#navigation').length > 0;
    return properUrl && !inNav;
  },
  hideIndicator: function() {
    this.magnifier.removeClass('is-visible');
  },
  onHover: function(img) {
    var self = this;
    if ( self.enabled() && self.checkImage(img) ) {
      self.bindTo(img);
      if ( !$._data(self.magnifier[0], 'events') ) {
        // Events get destroyed if parent node disappears so
        // must check to re-create them
        self.magnifier.on('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          self.show(self.target);
        }).on('mouseout', function(e) {
          self.magnifier.removeClass('is-visible');
        });

        self.enabled.subscribe(function(enabled) {
          if ( !enabled ) {
            self.overlay.removeClass('is-visible');
            self.magnifier.removeClass('is-visible');
          }
        });
      }
    }
  },
  show: function(img) {
    var match = this.imageTest.exec(img.src),
        domain, id, src;
    if ( match ) {
      domain = match[1];
      id = match[2];
      src = '//'+domain+'/php/load_okc_image.php/images/'+id+'.webp?v=2'
      this.overlay.css('background-image', 'url("'+src+'")')
        .addClass('is-visible');
    }
  }
};
