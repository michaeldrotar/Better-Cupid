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
      '[data-open-drawer="'+drawerName+'"]'+
      ',[data-close-drawer="'+drawerName+'"]'+
      ',[data-toggle-drawer="'+drawerName+'"]'
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
    $('[data-drawer][data-drawer-key="'+drawerKey+'"]')
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
  .on('click', '[data-open-drawer]', function(e) {
    openDrawer(getDrawer(e.target, 'data-open-drawer'));
  })
  .on('click', '[data-close-drawer]', function(e) {
    closeDrawer(getDrawer(e.target, 'data-close-drawer'));
  })
  .on('click', '[data-toggle-drawer]', function(e) {
    toggleDrawer(getDrawer(e.target, 'data-toggle-drawer'));
  })
  .on('click focusin', function(e) {
    $('[data-drawer][data-drawer--auto-close].is-open')
      .not(getDrawer(e.target))
      .each(function(i, drawer) {
        closeDrawer($(drawer));
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