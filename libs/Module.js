var Module = (function() {
	var _shared = {
			cache: {}
		},
		self;
	
	self = function(data) {
		if ( _shared.cache[data.id] ) {
			return _shared.cache[data.id];
		}
		
		var _private = {
				"dbkey": "module-db--"+data.id,
				"defaults": $.extend(
					{
						"enabled": true
					},
					data.defaults
				)
			},
			mod = this;
		
		mod.id = function() {
			return data.id;
		};
		
		mod.name = function() {
			return data.name;
		};
		
		mod.description = function() {
			return data.description;
		};
		
		mod.path = (function() {
			var root = core.rootPath("/modules/"+data.id);
			return function(path) {
				path = path || "";
				if ( path.substring(0, 1) === "/" ) {
					return core.rootPath(path);
				}
				return root+"/"+path;
			};
		})();
		
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
		
		_shared.cache[data.id] = mod;
		return mod;
	};
	
	self.get = function(id) {
		core.assert(_shared.cache[id], "Unable to retrieve module. No module has been created with the ID '"+id+"'");
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
				var modules = manifest.modules,
					count = 0;
				
				if ( !modules || modules.length === 0 ) {
					callback(loadedModules);
					return;
				}
				
				function moduleAdded() {
					if ( ++count === modules.length ) {
						callback(loadedModules);
					}
				}
				
				modules.forEach(function(module) {
					var mod = new Module(module),
						resources = module[key];
					
					if ( key === "scripts" && !mod.db.get("enabled") ) {
						moduleAdded();
						return;
					}
					
					if ( !resources || resources.length === 0 ) {
						moduleAdded();
						return;
					}
					
					loadedModules.push(mod);
					
					/*
					if ( key === "options" ) {
					$.ajax(mod.path(module.id+"-options.html"), {
							dataType: "html",
							timeout: 5000,
							success: function(markup, status, xhr) {
								var container = document.createElement("div");
								container.id = module.id+"-module";
								container.innerHTML = "<h1>"+mod.name()+"</h1>"+markup;
								
								window.module = mod;
								$(document.body).append(container);
								delete window.module;
								
								options.ProcessOptionsPage("#"+module.id+"-module", mod);
							},
							error: function(xhr, status, error) {
								core.error("Failed to load " + module.id + " module.");
							}
						});
						return;
					}
					*/
					(function() {
						var resourceCount = 0,
							nodes = [];
						
						function resourceAdded() {
							if ( ++resourceCount === resources.length ) {
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
								
								moduleAdded();
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
				});
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