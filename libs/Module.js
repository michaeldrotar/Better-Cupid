var Module = (function() {
	var _shared = {},
		self;
	
	self = function(data) {
		var _private = {
				dbkey: "module-db--" + data.id
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
			var root = null;
			return function(path) {
				root = root || core.rootPath("/modules/" + data.id);
				return root + (path || "");
			};
		})();
		
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
	
	return self;
})();