;(function() {

function getDrawer(opener, attr) {
  var element = $(opener),
      drawerName = attr && element.attr(attr),
      drawer = drawerName ? $('[data-drawer="'+drawerName+'"]') : element.closest('[data-drawer]');
  return drawer;
}

function getDrawerTriggers(drawer) {
  var drawerName = drawer.attr('data-drawer'),
      triggers = [];
  if ( drawerName ) {
    triggers = triggers.concat($(
      '[data-drawer-open="'+drawerName+'"]'+
      ',[data-drawer-close="'+drawerName+'"]'+
      ',[data-drawer-toggle="'+drawerName+'"]'
    ).toArray());
  }
  triggers = triggers.concat(
    drawer.find('[data-drawer=""]')
    .filter(function(trigger) {
      return getDrawer(trigger)[0] === drawer[0];
    })
    .toArray()
  );
  return $(triggers);
}

function openDrawer(drawer) {
  drawer.addClass('is-open');
  getDrawerTriggers(drawer).addClass('is-open');

  var drawerKey = drawer.attr('data-drawer-key');
  if ( drawerKey ) {
    $('[data-drawer][data-drawer-key="'+drawerKey+'"].is-open')
      .not(drawer)
      .each(function(i, drawer) {
        closeDrawer($(drawer));
      });
  }
}

function closeDrawer(drawer) {
  drawer.removeClass('is-open');
  getDrawerTriggers(drawer).removeClass('is-open');
}

function toggleDrawer(drawer) {
  if ( drawer.hasClass('is-open') ) {
    closeDrawer(drawer);
  } else {
    openDrawer(drawer);
  }
}

$(document)
  .on('click', '[data-drawer-open]', function(e) {
    openDrawer(getDrawer(this, 'data-drawer-open'));
  })
  .on('click', '[data-drawer-close]', function(e) {
    closeDrawer(getDrawer(this, 'data-drawer-close'));
  })
  .on('click', '[data-drawer-toggle]', function(e) {
    toggleDrawer(getDrawer(this, 'data-drawer-toggle'));
  })
  .on('click focusin', function(e) {
    $('[data-drawer][data-drawer--auto-close].is-open')
      .filter(function() {
        if ( $(e.target).parent(this).length ) {
          return false;
        }
        return true;
      })
      .each(function() {
        closeDrawer($(this));
      });
  });

(function() {
  var seen = {};
  $('[data-drawer-key]').each(function() {
    var drawer = $(this),
        key = drawer.attr('data-drawer-key');
    if ( key ) {
      if ( !seen[key] ) {
        seen[key] = true;
        openDrawer(drawer);
      }
    }
  });
})();

})();
