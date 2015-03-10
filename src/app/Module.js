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
  
  lib.inject = (function() {
  
    var valid_keys = {
      "scripts": true,
      "options": true,
      "background": true
    };
    
    function doInjection(key, callback) {
      var loadedModules = [];
      core.manifest(function(manifest) {
        var modules = [],
          moduleCount,
          count = 0;
        
        $.each(manifest.modules, function(_, data) {
          var module = new Module(data);
          if ( key !== "scripts" || module.enabled() ) {
            modules.push(data);
          }
        });
        
        if ( modules.length === 0 ) {
          callback(loadedModules);
          return;
        } else {
          moduleCount = modules.length;
        }
        
        function moduleAdded() {
          if ( ++count === moduleCount ) {
            callback(loadedModules);
          }
        }
        
        function loadModule(module) {
          var mod = Module.get(module.id),
            resources = module[key],
            resourceCount = 0,
            nodes = [];
          
          function resourcesLoaded() {
            var container = document.createElement("div");
            container.id = module.id+"-module";
            $("body").append(container);
            
            nodes.forEach(function(node) {
              if ( typeof node === "string" ) {
                $(container).append(node);
              } else {
                document.body.appendChild(node);
              }
            });
            
            mod.state("loaded");
            moduleAdded();
          }
          
          loadedModules.push(mod);
          
          if ( !resources || resources.length === 0 ) {
            resourcesLoaded();
            return;
          }
          
          (function() {
            
            function resourceAdded() {
              if ( ++resourceCount === resources.length ) {
                resourcesLoaded();
              }
            }
              
            resources.forEach(function(resource, index) {
              var path = mod.path(resource),
                ext = path.substring(path.lastIndexOf(".")+1),
                node;
              
              switch ( ext ) {
                
                case "css":
                  node = document.createElement("link");
                  node.type = "text/css";
                  node.rel = "stylesheet";
                  node.href = path;
                  nodes[index] = node;
                  
                  resourceAdded();
                  break;
                
                case "js":
                  node = document.createElement("script");
                  node.type = "text/javascript";
                  node.src = path;
                  nodes[index] = node;
                  resourceAdded();
                  break;
                
                case "html":
                  $.ajax({
                    "url": path,
                    "dataType": "text",
                    "timeout": 5000,
                    "success": function(response, status, xhr) {
                      nodes[index] = response;
                    },
                    "error": function(xhr, status, message) {
                      core.error("Failed to load "+resource+" for "+module.name);
                    },
                    "complete": function(xhr, status) {
                      resourceAdded();
                    }
                  });
                  break;
                
              }
            });
          })();
        }
        
        function iterateModules() {
          var i, data, module;
          for ( i = modules.length - 1; data = modules[i]; i-- ) {
            if ( key === "scripts" ) {
              module = Module.get(data.id);
              
              switch ( module.state() ) {
                
                case "ready":
                  loadModule(data);
                  modules.splice(i, 1);
                  break;
                  
                case "failed":
                  modules.splice(i, 1);
                  moduleAdded();
                  break;
              
              }
            } else {
              loadModule(data);
              modules.splice(i, 1);
            }
          }
          
          if ( modules.length > 0 ) {
            setTimeout(iterateModules, 50);
          }
        }
        
        iterateModules();
        
      });
    }
    
    return function(key, callback) {
      core.assert(valid_keys[key], "Key passed to Modules.inject is not valid");
      if ( typeof callback !== "function" ) {
        callback = function(){};
      }
      
      doInjection(key, callback);
    };
  })();
  
  window.Module = lib;
})();
