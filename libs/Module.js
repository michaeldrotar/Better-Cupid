var Module = (function() {
  var _shared = {
      cache: {}
    },
    self;
  
  self = function(data) {
    var _private = $.extend(true,
        {
          "id": "",
          "name": "",
          "description": "",
          "depends": [],
          "required": false,
          "defaults": {
            "enabled": true
          },
          "scripts": [],
          "options": [],
          "background": []
        },
        data,
        {
          "dbkey": "module-db--"+data.id,
          "state": null
        }
      ),
      mod = this;
    
    if ( data.id && !_shared.cache[data.id] ) {
      _shared.cache[data.id] = mod;
    }
    
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
        return _private.required || mod.db.get("enabled");
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
    
    _private.getdb = function(callback) {
      core.db.get(_private.dbkey, function(db) {
        if ( callback ) {
          callback(db || {})
        }
      });
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
    
    mod.db = {
      
      clear: function(callback) {
        core.db.remove(_private.dbkey, callback);
        return mod.db;
      },
      
      remove: function(k, callback) {
        _private.getdb(function(db) {
          delete db[k];
          _private.setdb(db, callback);
        });
        return mod.db;
      },
    
      get: function(k, callback) {
        var defaults = _private.defaults,
            dkey;
        if ( typeof k === 'function' ) {
          callback = k;
          k = undefined;
        }
        _private.getdb(function(db) {
          if ( typeof k === 'string' ) {
            callback(db.hasOwnProperty(k) ? db[k] : defaults[k]);
          } else {
            for ( dkey in defaults ) {
              if ( defaults.hasOwnProperty(dkey) ) {
                if ( !db.hasOwnProperty(dkey) ) {
                  db[dkey] = defaults[dkey];
                }
              }
            }
            callback(db);
          }
        });
        return mod.db;
      },
    
      set: function(k, v, callback) {
        if ( typeof k === 'object' ) {
          callback = v;
          v = undefined;
        }
        _private.getdb(function(db) {
          if ( typeof k === 'string' ) {
            db[k] = v;
          } else {
            $.extend(db, k);
          }
          _private.setdb(db, callback);
        });
        return mod.db;
      }
      
    };
    
    return mod;
  };
  
  self.get = function(id) {
    return _shared.cache[id];
  };
  
  self.inject = (function() {
  
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
  
  return self;
})();
