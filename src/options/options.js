;(function() {

  // @if DEV
  include('/lib/livejs/**/*.js');
  // @endif

  var Module = bc.Module,
      util   = bc.util;

  var navigating = false;
  function openPath(path) {
    path = path || location.hash.substring(1);
    if ( path ) {
      navigating = true;
      bc.util.each(path.split(/\//g), function(item) {
        $('[data-drawer-open="'+item+'"]').click();
      });
      navigating = false;
    } else {
      drawerjs.init();
    }
  }

  function getOpenDrawer(parent) {
    var key = parent.find('[data-drawer-key]').attr('data-drawer-key');
    return parent.find('[data-drawer-key="'+key+'"].is-open:eq(0)');
  }

  function getCurrentPath(item) {
    var path = [],
        parent = $(document),
        drawer = getOpenDrawer(parent);
    while ( drawer.length ) {
      path.push(drawer.attr('data-drawer'));
      parent = drawer;
      drawer = getOpenDrawer(parent);
    }
    return path.join('/');
  }

  $(document).on('click', '[data-drawer-open]', function(e) {
    setTimeout(function() {
      if ( !navigating ) {
        var toggle = $(this);
        location.hash = getCurrentPath();
      }
    }, 100);
  });

  $(window).on('hashchange', function() {
    openPath();
  });

  options = {};
  options.modules = Module.all();
  util.each(options.modules, function(module) {
    // If it has settings other than the enabled setting
    // then it must also have an options template
    if ( util.keys(module.defaults).length > 1 ) {
      module.optionsTemplate = 'bc-'+util.dasherize(module.id)+'-options-template';
    }
  });
  options.changelog = {};
  options.changelog.entries = bc.manifest.changelog;
  util.each(options.changelog.entries, function(entry) {
    var res = /^\d+\.\d+/.exec(entry.version);
    if ( res && res.length ) {
      entry.majorVersion = res[0];
    } else {
      entry.majorVersion = entry.version;
    }
  });
  (function() {
    var lastVersion = 0,
        version;
    options.changelog.byVersion = util.reduce(
      options.changelog.entries,
      function(collection, entry) {
        var version = entry.majorVersion,
            arr;
        util.each(collection, function(item) {
          if ( item.version === version ) {
            arr = item.entries;
            return true;
          }
        });
        if ( !arr ) {
          collection.push({
            version: version,
            entries: [ entry ]
          });
        } else {
          arr.push(entry);
        }
        return collection;
      }, []
    );
  })();

  Module.ready(function() {
    var container = $('.js-container');
    ko.applyBindings(options, container[0]);
    container.show();
    drawerjs.init();
    openPath();
  });

  ko.bindingHandlers.setting = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      $(element).on('change', function() {
        var type = element.type,
            value = valueAccessor(),
            newValue;
        if ( typeof value === 'function' ) {
          switch ( type ) {
            case 'checkbox':
              newValue = $(element).prop('checked');
              break;
            case 'number':
              newValue = parseInt(element.value);
              if ( isNaN(newValue) ) {
                newValue = undefined;
              }
              break;
            default:
              newValue = element.value;
              if ( !newValue ) {
                newValue = undefined;
              }
          }
          value(newValue);
        }
      });
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var value = ko.unwrap(valueAccessor());
      switch ( element.type ) {
        case 'checkbox':
          $(element).prop('checked', value);
          break;
        default:
          element.value = value;
      }
    }
  };

})();
