;(function() {
  var _shared = {
        allPromise: null,
        cache: {}
      },
      lib = {};
  
  function Module(data, callback) {
    var _private = $.extend(true,
          {
            id: '',
            name: '',
            description: '',
            depends: [],
            required: false,
            defaults: {
              enabled: true
            }
          },
          data,
          {
            db: {},
            dbkey: 'module-db--'+data.id,
            state: null
          }
        ),
        mod = this,
        db = mod.db = {},
        defaults = _private.defaults;
    
    data = _private.db;
    
    mod.id = function() {
      return _private.id;
    };
    
    mod.name = function() {
      return _private.name;
    };
    
    mod.depends = function() {
      return _private.depends;
    };
    
    mod.description = function() {
      return _private.description;
    };
    
    mod.required = function() {
      return !!_private.required;
    };
    
    mod.path = (function() {
      var root = core.rootPath("/modules/"+_private.id);
      return function(path) {
        path = path || "";
        if ( path.substring(0, 1) === "/" ) {
          return core.rootPath(path);
        }
        return root+"/"+path;
      };
    })();
    
    mod.enabled = function(val) {
      if ( typeof val !== "boolean" ) {
        return _private.required || mod.db.get('enabled');
      } else {
        mod.db.set("enabled", val);
        return mod;
      }
    };
    
    mod.state = function(state) {
      if ( typeof state === "string" ) {
        _private.state = state;
        return mod;
      } else if ( _private.state ) {
        return _private.state;
      } else {
        /*
        waiting - waiting for a dependency to load
        ready   - ready to be loaded, all dependencies are loaded
        failed  - failed to load, a dependency failed to load or doesn't exist
        loaded  - loaded successfully
        */
        var i, dep, depID, depState;
        for ( i = _private.depends.length - 1; depID = _private.depends[i]; i-- ) {
          dep = Module.get(depID);
          if ( !dep || !dep.enabled() ) {
            return "failed";
          } else {
            depState = dep.state();
            if ( depState === "failed" ) {
              return "failed";
            } else if ( depState !== "loaded" ) {
              return "waiting";
            }
          }
        }
        return "ready";
      }
    };
    
    _private.setdb = function(v, callback) {
      var db = {};
      db[_private.dbkey] = v;
      core.db.set(db, function() {
        if ( callback ) {
          callback();
        }
      });
    };
    
    db.clear = function(callback) {
      var k;
      for ( k in data ) {
        delete data[k];
      }
      core.db.remove(_private.dbkey, callback);
      return db;
    };
      
    db.remove = function(k, callback) {
      delete data[k];
      _private.setdb(data, callback);
      return db;
    };
  
    db.get = function(k) {
      if ( typeof k === 'string' ) {
        return data.hasOwnProperty(k) ? data[k] : defaults[k];
      } else {
        return $.extend(true, {}, defaults, data);
      }
    };
  
    db.set = function(k, v, callback) {
      if ( typeof k === 'object' ) {
        callback = v;
        v = undefined;
      }
      if ( typeof k === 'string' ) {
        data[k] = v;
      } else {
        $.extend(true, data, k);
      }
      _private.setdb(data, callback);
      return db;
    };
    
    core.db.get(_private.dbkey, function(db) {
      $.extend(true, data, db[_private.dbkey] || {});
      callback();
    });
    
    return mod;
  };
  
  lib.all = function() {
    if ( !_shared.allPromise ) {
      _shared.allPromise = new Promise(function(resolve, reject) {
        core.manifest(function(manifest) {
          var modules = manifest.modules,
              modulesCount = modules.length;
          modules = modules.map(function(module) {
            return _shared.cache[module.id] = new Module(module, function() {
              modulesCount--;
              if ( modulesCount === 0 ) {
                resolve(modules);
              }
            });
          });
        });
      });
    }
    return _shared.allPromise;
  };
  
  lib.get = function(id) {
    return new Promise(function(resolve, reject) {
      lib.all().then(function(modules) {
        var i = modules.length - 1;
        for ( ; i >= 0; i-- ) {
          if ( modules[i].id() === id ) {
            resolve(modules[i]);
            return;
          }
        }
        reject('Module '+id+' does not exist');
      });
    });
  };
  
  if ( core.onContentScript ) {
    (function() {
      var runScripts = {},
          modulesHash,
          ready = false;
      
      function runModule(module, callback) {
        if ( module.enabled() ) {
          callback(module, module.db.get());
        }
      }
      
      function checkAllReady() {
        var k, module;
        if ( modulesHash && ready ) {
          for ( k in runScripts ) {
            module = modulesHash[k];
            runModule(module, runScripts[k]);
          }
          runScripts = {};
          document.body.style.visibility = 'visible';
        }
      }
      
      lib.all().then(function(modules) {
        modulesHash = {};
        modules.forEach(function(module) {
          modulesHash[module.id()] = module;
        });
        checkAllReady();
      });
      
      lib.run = function(id, callback) {
        runScripts[id] = callback;
        checkAllReady();
      };
      
      function domReady() {
        ready = true;
        checkAllReady();
      }
      
      function waitForLoaded() {
        if ( document.readyState !== 'loading' ) {
          document.removeEventListener('readystatechange', waitForLoaded, false);
          domReady();
        }
      }
      
      if ( document.readyState !== 'loading' ) {
        domReady();
      } else {
        document.addEventListener('readystatechange', waitForLoaded, false);
      }
      
      
      // For some reason, body stays visible unless we get really aggressive
      // like this and continually keep it hidden
      var hideBody;
      hideBody = function() {
        if ( !ready ) {
          if ( window.document && window.document.body ) {
            document.body.style.visibility = 'hidden';
          }
          setTimeout(hideBody, 1);
        }
      }
      
      hideBody();
    })();
  }
  
  window.Module = lib;
})();
