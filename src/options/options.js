;(function() {

  // @ifdef DEV
  include('/lib/livejs/**/*.js');
  // @endif

  var Module = bc.Module,
      util   = bc.util,
      moduleList    = {},
      controlConfig = {};

  controlConfig.checkbox = {
    init: function(control, setting, module) {
      control.prop('checked', module.get(setting));
    },
    change: function(control, setting, module) {
      module.set(setting, control.prop('checked'));
    }
  };

  controlConfig.text = {
    init: function(control, setting, module) {
      control.val(module.get(setting));
    },
    change: function(control, setting, module) {
      module.set(setting, control.val());
    }
  };

  controlConfig.number = {
    init: controlConfig.text.init,
    change: function(control, setting, module) {
      var number = parseInt(control.val());
      if ( isNaN(number) ) {
        control.val(module.get(setting));
      } else {
        module.set(setting, number);
      }
    }
  };

  $("#reset-all-button").click(function(e) {
    $("[data-module]").each(function() {
      var modName = this.getAttribute("data-module"),
        setting = this.getAttribute("data-setting"),
        module = module_hash[modName],
        f = init[this.type];
      module.db.remove(setting);
      if ( f ) {
        f.call(this, setting, module);
      }
    });
    $("#reset-confirmation-dialog").dialog("close");
  });
  $("#reset-page-button").click(function(e) {
    $("#settings_tab_content .switcher li").each(function() {
      var tab = this,
        module,
        modName;
      if ( tab.hasClass("active") ) {
        modName = tab.id.replace(/\-tab$/, "");
        module = module_hash[modName];
        $("[data-module="+modName+"]").each(function() {
          var setting = this.getAttribute("data-setting"),
            f = init[this.type];
          module.db.remove(setting);
          if ( f ) {
            f.call(this, setting, module);
          }
        });
      }
    });
    $("#reset-confirmation-dialog").dialog("close");
  });

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

  function updateToggles() {
    $('[data-toggle]').each(function() {
      var toggle = $(this),
          id     = toggle.attr('data-toggle'),
          module = bc.Module.get(id),
          input  = toggle.find('input'),
          on     = module.get('enabled'),
          deps   = module.deps(),
          depsOn = true;
      bc.util.each(module.needs, function(id) {
        if ( !deps[id] ) {
          depsOn = false;
        }
      });
      input.prop('checked', on);
      if ( depsOn ) {
        toggle.find('.toggle-switch').removeClass('is-warning');
      } else {
        toggle.find('.toggle-switch').addClass('is-warning');
      }
    });
  }

  $('[data-toggle]').on('click', function() {
    var toggle = $(this),
        id     = toggle.attr('data-toggle'),
        module = bc.Module.get(id);
    module.set('enabled', toggle.find('input').prop('checked'));
    updateToggles();
  });

/*
  var modules = Module.all();
  console.log(modules);
  bc.util.each(modules, function(module) {
    moduleList[module.id] = module;
    $('[data-module="'+module.id+'"] [data-setting]').each(function() {
      var control = $(this),
          setting = control.attr('data-setting'),
          type    = control.attr('type') || 'text',
          config  = controlConfig[type];
      if ( config ) {
        bc.util.each(config, function(fn, key) {
          if ( key === 'init' ) {
            fn(control, setting, module);
          } else {
            control.on(key, function(e) {
              fn(control, setting, module);
            });
          }
        });
      } else {
        console.warn('no configuration for type '+type);
      }
    });
    updateToggles();
  });
*/

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
      console.log('init', arguments);
      element.value = ko.unwrap(valueAccessor());
      $(element).on('change', function() {
        var type = element.type,
            value = valueAccessor(),
            newValue;
        if ( typeof value === 'function' ) {
          switch ( type ) {
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
      console.log('update', arguments);
      element.value = ko.unwrap(valueAccessor());
    }
  };

})();
