;(function() {

function getDrawer(opener, attr) {
  var element = $(opener),
      drawerName = attr && element.attr(attr),
      drawer = drawerName ? $('[data-drawer="'+drawerName+'"]') : element.closest('[data-drawer]');
  return drawer;
}

$(document)
  .on('click', '[data-open-drawer]', function(e) {
    getDrawer(e.target, 'data-open-drawer').addClass('is-open');
  })
  .on('click', '[data-close-drawer]', function(e) {
    getDrawer(e.target, 'data-close-drawer').removeClass('is-open');
  })
  .on('click', '[data-toggle-drawer]', function(e) {
    getDrawer(e.target, 'data-toggle-drawer').toggleClass('is-open');
  })
  .on('click focusin', function(e) {
    $('[data-drawer][data-drawer--auto-close].is-open')
      .not(getDrawer(e.target))
      .removeClass('is-open');
  });
  
})();