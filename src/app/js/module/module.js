var db       = bc.db,
    loc      = bc.location,
    util     = bc.util,
    Module,
    modules = util.concat(requirejs(['/modules/**/*.module.js'])),
    modulesReady = false,
    persist;

// Call persist to save data to the database
// The saves are delayed so that multiple calls don't slam the database
// with many requests and go over the limit
persist = (function() {
  var records = {},
      timeout;
  function exec() {
    db.get(function(data) {
      util.extend(data, records);
      records = {};
      timeout = null;

      db.set(data);
    });
  }

  return function(id, record) {
    records[id] = record;
    if ( !timeout ) {
      timeout = setTimeout(exec, 100);
    }
  };
})();

Module = function(data) {
  var self = util.extend(true, this,
    {
      id: '',
      name: '',
      description: '',
      order: 0,
      needs: [],
      wants: [],
      required: false,
      defaults: {
        enabled: true
      }
    },
    data,
    {
      data: {}
    }
  );
  self.deps = util.concat(self.needs, self.wants);
};

function defineProperties(module) {
  util.each(module.defaults, function(_, key) {
    var value,
        reset = false;
    if ( module[key] === undefined ) {
      value = module.get(key);
      if ( util.isArray(value) ) {
        module[key] = ko.observableArray(value);
      } else {
        module[key] = ko.observable(module.get(key));
      }
      module[key].subscribe(function(value) {
        if ( !reset ) {
          module.set(key, value);
        }
        if ( value === undefined ) {
          reset = true;
          module[key](module.get(key));
        }
        reset = false;
      });
    }
  });
}

Module.all = requirejs('statics/all.js');

Module.prototype = {
  /*
  $statics: {
    get: requirejs('statics/get.js'),
    all: requirejs('statics/all.js')
  },
  */
  clear: requirejs('clear.js'),
  get: requirejs('get.js'),
  enabled: requirejs('enabled.js'),
  path: requirejs('path.js'),
  remove: requirejs('remove.js'),
  set: requirejs('set.js')
};

// Convert module data to module objects
modules = modules.map(function(data) {
  return bc[data.id] = (new Module(data));
});

util.sortBy(modules, 'order');
console.log(util.map(modules, function(module) { return module.id; }));
modules.sort(function(a,b) {
  console.log(a,b);
  if ( util.contains(a.deps, b.id) ) {
    console.log(a.id, '>', b.id);
    return 1;
  } else if ( util.contains(b.deps, a.id) ) {
    console.log(a.id, '<', b.id);
    return -1;
  }
  return 0;
});

console.log(util.map(modules, function(module) { return module.id; }));

(function() {
  var onContentScript = loc.onContentScript,
      callbacks = [],
      domReady = false,
      init = false;

  function checkReady() {
    if ( !modulesReady || !domReady ) {
      return false;
    }
    if ( init ) {
      return;
    }

    var enabledModules;
    enabledModules = util.keep(modules, function(module) {
      return module.enabled();
    });

    if ( onContentScript ) {
      util.each(enabledModules, function(module) {
        document.body.className += ' bc-'+module.id;
      });
    }
    util.each(enabledModules, function(module) {
      if ( module.init ) {
        module.init();
      }
    });
    if ( onContentScript ) {
      util.each(enabledModules, function(module) {
        if ( module.runScript ) {
          module.runScript();
        }
      });
    }
    util.runFunctions(callbacks);
    document.body.style.visibility = 'visible';
    init = true;
  }

  Module.ready = function(callback) {
    if ( init ) {
      callback();
    } else {
      callbacks.push(callback);
    }
  };

  // Load the db data for each module
  db.get(function(data) {
    util.each(modules, function(module) {
      var d = data[module.id];
      if ( d ) {
        util.extend(true, module.data, d);
      }
      defineProperties(module);
    });
    modulesReady = true;
    checkReady();
  });

  $(function() {
    domReady = true;
    checkReady();
  });

  (function() {
    // For some reason, body stays visible unless we get really aggressive
    // like this and continually keep it hidden
    var hideBody;
    hideBody = function() {
      if ( init ) {
        return;
      }
      if ( document.body ) {
        document.body.style.visibility = 'hidden';
      } else {
        setTimeout(hideBody, 1);
      }
    }
    hideBody();
  })();
})();

exports = Module;
