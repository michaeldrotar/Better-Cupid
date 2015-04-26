bc.Module.run('photo-browser', function(module) {

  function getThumbnailHolder(photobrowser) {
    var holder = photobrowser.find('.bc-photo-browser-thumbnail-holder');
    if ( !holder.length ) {
      holder = $('<div class="bc-photo-browser-thumbnail-holder"></div>');
      photobrowser.append(holder);
    }
    return holder;
  }

  function modifyThumbnails(photobrowser) {
    var thumbnailHolder = getThumbnailHolder(photobrowser);
    photobrowser.find('.thumbnails').each(function() {
      var thumbnails = $(this);
      thumbnails.children('li').each(function() {
        var item = $(this),
            image = item.find('img'),
            url = '',
            src = image ? image.attr('src') : '',
            // User id is everything after the first underscore
            user = (/^[^_]+_(.+)$/).match(item.attr('id'), 1) || '',
            detail = $('#browser_'+user),
            username,
            anchor;
        if ( detail.length ) {
          detail.attr('data-bc-user', user);
          username = detail.find('.username');
          if ( username.length ) {
            anchor = username.find('a');
            if ( anchor.length ) {
              url = anchor.href;
            }
          }
        }

        var a = $('<a class="photo-browser-thumbnail-anchor"></a>').attr('href', url).attr('id', 'bc_thumb_'+user),
            img = $('<img class="bc-photo-browser-thumbnail" />').attr('src', src).attr('data-bc-user', user);
        a.append(img);
        thumbnailHolder.append(a);
      });
    });
  }

  function modifyItems(photobrowser) {
    photobrowser.find('.items').each(function() {
      var items = $(this);
      items.addClass('bc-photo-browser-items');

      items.find('.item').each(function(i) {
        var item = $(this);
        if ( item.hasClass('refresh') ) {
          (function() {
            var anchor = item.find('a').attr('onclick', 'Home.cycle()'),
                container = $('<div class="item refresh"></div>');
            container.append(anchor);
            photobrowser.append(container);
          })();
        } else {
          (function() {
            var user = item.attr('data-bc-user'),
                js_params = "'"+user+"', 'home', null",
                hide_button = $('<a href="#Hide" onclick="HiddenUsers.hide('+js_params+'); return false">hide</a>')
                  .addClass('bc-photo-browser-hide')
                  .attr('data-bc-user', user),
                unhide_button = $('<a href="#Hide" onclick="HiddenUsers.show('+js_params+'); return false">un-hide</a>')
                  .addClass('bc-photo-browser-unhide')
                  .attr('data-bc-user', user),
                info = item.find('.info:eq(0)');

            item.addClass('bc-photo-browser-item');
            item.css('display', i === 0 ? 'block' : 'none');

            info.append(hide_button);
            info.append(unhide_button);
          })();
        }
      });
    });
  }

  function hookPhotoBrowsers() {
    $('.photobrowser:not(.bc-photo-browser)').each(function() {
      var photobrowser = $(this);
      photobrowser.addClass('bc-photo-browser');
      modifyThumbnails(photobrowser);
      modifyItems(photobrowser);
    });
  }

  hookPhotoBrowsers();

  var matches_block = $('#matches_block');
  if ( matches_block.length ) {
    var links = matches_block.find('.links');
    if ( links.length ) {
      links.find('li.improve').addClass('bc-photo-browser-improve');
      links.find('li.more').addClass('bc-photo-browser-more');
    }
  }

  $(document)
    .on('click', '.photobrowser .item.refresh a', function(e) {
      var photobrowser = $(this).closest('.photobrowser'),
          checkForUpdate;
      checkForUpdate = function() {
        console.log('checking...');
        if ( photobrowser.parent().length ) {
          setTimeout(checkForUpdate, 100);
        } else {
          console.log('update!');
          hookPhotoBrowsers();
        }
      };
      checkForUpdate();
    })
    .on('click', '.bc-photo-browser-hide', function(e) {
      var btn = $(this),
          user = btn.attr('data-bc-user'),
          thumb = $('#bc_thumb_'+user);
      if ( thumb.length ) {
        thumb.clearQueue().stop().animate({ opacity: 0.3 }, 'slow');
      }
      btn.css('display', 'none');
      btn.closest('.info').find('.bc-photo-browser-unhide').css('display', 'block');
    })
    .on('click', '.bc-photo-browser-unhide', function(e) {
      var btn = $(this),
          user = btn.attr('data-bc-user'),
          thumb = $('#bc_thumb_'+user);
      if ( thumb.length ) {
        thumb.clearQueue().stop().animate({ opacity: 1 }, 'slow');
      }
      btn.css('display', 'none');
      btn.closest('.info').find('.bc-photo-browser-hide').css('display', 'block');
    })
    .on('mouseover', '.bc-photo-browser-thumbnail', function(e) {
      var thumbnail = $(this),
          user = thumbnail.attr('data-bc-user'),
          detail = $('#browser_'+user);
      detail.siblings().clearQueue().stop().animate({
        opacity: 0,
      }, {
        duration: 'slow',
        complete: function() {
          this.style.display = 'none';
        }
      });
      detail.clearQueue().stop().css('display', 'block').animate({
        opacity: 1
      }, 'fast');
    });

});
