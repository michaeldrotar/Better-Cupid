;(function() {

  var db       = bc.namespace('db'),
      loc      = bc.namespace('location'),
      util     = bc.namespace('util'),
      Module,
      modules;

  Module = bc.namespace('Module', function Module(data) {
    if ( this instanceof Module === false ) {
      return new Module(data);
    }
    $.extend(true, this,
      {
        id: '',
        name: '',
        description: '',
        needs: [],
        wants: [],
        required: false,
        defaults: {
          enabled: true
        }
      },
      data,
      {
        data: {},
        state: null
      }
    );
    return this;
  });

  Module.prototype.clear = function() {
    this.data = {};
    db.remove(this.id);
  };

  Module.prototype.deps = function() {
    var needs = this.needs,
        wants = this.wants,
        deps  = {};
    util.forEach(util.concat(needs, wants), function(id) {
      var module = Module.get(id);
      if ( module.enabled() ) {
        deps[id] = module;
      }
    });
    return deps;
  };

  Module.prototype.get = function(key) {
    var data = this.data,
        defaults = this.defaults;
    if ( typeof key === 'string' ) {
      return data.hasOwnProperty(key) ? data[key] : defaults[key];
    } else {
      return $.extend(true, {}, defaults, data);
    }
  };

  Module.prototype.enabled = function(value) {
    if ( arguments.length === 0 ) {
      var needsEnabled = true;
      util.forEach(this.needs, function(id) {
        var module = Module.get(id);
        if ( !module.enabled() ) {
          needsEnabled = false;
        }
      });
      return this.required || (this.get('enabled') && needsEnabled);
    } else {
      this.set('enabled', value);
    }
  };

  Module.prototype.path = function(path) {
    path = path || '';
    if ( path.substring(0,1) === '/' ) {
      return loc.getResourcePath(path);
    }
    return loc.getResourcePath('/modules/'+this.id) + '/' + path;
  };

  Module.prototype.remove = function(key) {
    var self = this;
    delete self.data[key];
    db.get(self.id, function(data) {
      if ( data[self.id] ) {
        delete data[self.id][key];
        db.set(data);
      }
    });
  };

  Module.prototype.set = function(key, value) {
    var self = this,
        data = self.data;
    if ( typeof key === 'object' ) {
      $.extend(true, data, key);
      db.get(self.id, function(data) {
        $.extend(true, data[self.id] || {}, key);
        db.set(data);
      });
    } else {
      data[key] = value;
      db.get(self.id, function(data) {
        if ( !data[self.id] ) {
          data[self.id] = {};
        }
        data[self.id][key] = value;
        db.set(data);
      });
    }
  };

  Module.get = function(id) {
    return util.forEach(modules, function(module) {
      if ( module.id === id ) {
        return module;
      }
    });
  };

  Module.all = function() {
    return util.clone(modules);
  };

  (function() {
    var scripts = { all: [] },
        onContentScript = loc.onContentScript,
        domReady = onContentScript ? false : true, // no need to wait
        modulesReady = false,
        init = false;

    function checkReady() {
      if ( !modulesReady || !domReady ) {
        return false;
      }
      if ( !init && onContentScript ) {
        util.forEach(modules, function(module) {
          if ( module.enabled() ) {
            $('body').addClass('bc-'+module.id);
          }
        });
      }
      util.forEach(scripts.all, function(fn) {
        try {
          fn();
        } catch ( err ) {
          console.error(err);
        }
      });
      modules = modules.sort(function(a,b) {
        return (a.order || 0) - (b.order || 0);
      });
      util.forEach(modules, function(module) {
        if ( module.enabled() ) {
          util.forEach(scripts[module.id], function(fn) {
            try {
              fn(module, module.get());
            } catch ( err ) {
              console.error(err);
            }
          });
        }
      });
      if ( !init && onContentScript ) {
        $('body').css('visibility', 'visible');
      }
      init = true;
    }

    Module.ready = function(callback) {
      scripts.all.push(callback);
      checkReady();
    };

    Module.run = function(id, callback) {
      scripts[id] = scripts[id] || [];
      scripts[id].push(callback);
      checkReady();
    };

    bc.manifest(function(manifest) {
      modules = manifest.modules.map(function(data) {
        return new Module(data);
      });

      var count = modules.length;
      util.forEach(modules, function(module) {
        db.get(module.id, function(data) {
          $.extend(true, module.data, data[module.id] || {});
          count--;
          if ( count === 0 ) {
            modulesReady = true;
            checkReady();
          }
        });
      });
    });

    if ( onContentScript ) {
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
          $('body').css('visibility', 'hidden');
          setTimeout(hideBody, 1);
        }
        hideBody();
      })();
    }
  })();

})();
