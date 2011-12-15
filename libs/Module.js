var Module = (function() {
	var _shared = {
			modules: {}
		},
		self;
	
	self = function(data) {
		var _private = {
				dbkey: "module-db--" + data.id,
				
				id: data.id,
				name: data.name,
				description: data.description,
				depends: data.depends || [],
				
				state: null
			},
			mod = this;
		
		if ( data.id && !_shared.modules[data.id] ) {
			_shared.modules[data.id] = mod;
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
		
		mod.path = (function() {
			var root = null;
			return function(path) {
				root = root || core.rootPath("/modules/" + _private.id);
				return root + (path || "");
			};
		})();
		
		mod.enabled = function(val) {
			if ( typeof val !== "boolean" ) {
				return mod.db.get("enabled");
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
				ready
				waiting
				failed
				loaded
				*/
				var depsFailed = false,
					depsLoaded = true;
				$.each(_private.depends, function(_, depID) {
					var dep = Module.get(depID),
						depState = dep.state();
					if ( !dep.enabled() || depState === "failed" ) {
						depsFailed = true;
						return true;
					} else if ( depState !== "loaded" ) {
						depsLoaded = false;
					}
				});
				if ( depsFailed ) {
					return "failed";
				}
				if ( !depsLoaded ) {
					return "waiting";
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
		
		_private.defaults = { enabled: true };
		mod.db = {
		
			defaults: function(defaults) {
				var dkey;
				if ( typeof defaults === "object" ) {
					for ( dkey in defaults ) {
						if ( defaults.hasOwnProperty(dkey) ) {
							_private.defaults[dkey] = defaults[dkey];
						}
					}
				} else {
					defaults = {};
					for ( dkey in _private.defaults ) {
						if ( _private.defaults.hasOwnProperty(dkey) ) {
							defaults[dkey] = _private.defaults[dkey];
						}
					}
					return defaults;
				}
			},
		
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
	};
	
	self.get = function(id) {
		return _shared.modules[id];
	};
	
	return self;
})();