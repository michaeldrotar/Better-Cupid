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
		
		_private.getdb = function() {
			return core.db.get(_private.dbkey) || {};
		};
		
		_private.setdb = function(v) {
			core.db.set(_private.dbkey, v);
		};
		
		mod.db = {
			
			clear: function(k) {
				var item;
				if ( typeof k === "string" ) {
					item = _private.getdb();
					delete item[k];
					_private.setdb(item);
				} else {
					core.db.clear(_private.dbkey);
				}
			},
		
			get: function(k) {
				var item = _private.getdb(),
					dkey;
				if ( typeof k === "string" ) {
					return item.hasOwnProperty(k) ? item[k] : _private.defaults[k];
				} else {
					for ( dkey in _private.defaults ) {
						if ( _private.defaults.hasOwnProperty(dkey) ) {
							if ( !item.hasOwnProperty(dkey) ) {
								item[dkey] = _private.defaults[dkey];
							}
						}
					}
					return item;
				}
			},
		
			set: function(k, v) {
				var item;
				if ( typeof k === "string" ) {
					item = _private.getdb();
					item[k] = v;
					_private.setdb(item);
				} else {
					// Assume it's the entire database object
					_private.setdb(k);
				}
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
			var waitForDB;
			
			core.assert(valid_keys[key], "Key passed to Modules.inject is not valid");
			if ( typeof callback !== "function" ) {
				callback = function(){};
			}
			
			if ( core.db.state === "ready" ) {
				doInjection(key, callback);
			} else {
				waitForDB = function() {
					if ( core.db.state === "ready" ) {
						core.removeEventListener("dbstatechange", waitForDB, false);
						doInjection(key, callback);
					}
				};
				core.addEventListener("dbstatechange", waitForDB, false);
			}
		};
	})();
	
	return self;
})();
