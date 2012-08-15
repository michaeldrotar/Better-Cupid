var DB = (function() {
	
	var _shared = {},
		self;
	
	_shared.remove = function(item, key) {
		if ( typeof key === "string" ) {
			delete item[key];
		} else if ( typeof key === "object" ) {
			$.each(key, function(k,v) {
				if ( typeof k === "string" ) {
					delete item[k];
				} else {
					delete item[v];
				}
			});
		}
		return item;
	};
	
	_shared.add = function(item, key, value) {
		item[key] = value;
		return item;
	};
	
	_shared.find = function() {
		var args = Array.prototype.slice.call(arguments),
			key = args.shift(),
			i;
		for ( i = 0; i < args.length; i++ ) {
			if ( args[i].hasOwnProperty(key) ) {
				return args[i][key];
			}
		}
		return undefined;
	};
	
	self = function(data) {
		var _private = {
				key: data.key || "",
				storage: data.storage && typeof data.storage === "object" ? data.storage : localStorage,
				defaults: data.defaults || {}
			},
			db = this;
		
		_private.getdb = function() {
			if ( _private.storage.hasOwnProperty(_private.key) ) {
				return JSON.parse(_private.storage[_private.key]);
			} else {
				return {};
			}
		};
		
		_private.setdb = function(v) {
			_private.storage[_private.key] = JSON.stringify(v);
		};
		
		db.defaults = function(defaults) {
			var key;
			if ( typeof defaults === "object" ) {
				for ( key in defaults ) {
					_private.defaults[key] = defaults[key];
				}
				return db;
			} else {
				return $.copy(defaults);
			}
		};
		
		db.clear = function(key) {
			if ( typeof key === "string" ) {
				_private.setdb(_shared.remove(_private.getdb(), key));
			} else {
				delete _private.storage[_private.key];
			}
			//core.sendRequest({ type: "db.clear", key: key, db: _private.key });
			//core.dispatchEvent({ type: "dbchange", key: key, db: _private.key });
			return db;
		};
		
		db.get = function(key) {
			if ( typeof key === "string" ) {
				return _shared.find(key, _private.getdb(), _private.defaults);
			}
			return undefined;
		};
		
		db.set = function(key, value) {
			if ( typeof key === "string" ) {
				_private.setdb(_shared.add(_private.getdb(), key, value));
				//core.sendRequest({ type: "db.set", key: key, value: value, db: _private.key });
				//core.dispatchEvent({ type: "dbchange", key: key, db: _private.key });
			}
			return db;
		};
		
		db.reset = function() {
			_private.setdb(_shared.remove(_private.getdb(), _private.defaults));
			return db;
		};
		
		db.expand = function(data) {
			return new DB({
				key: data.key || _private.key,
				storage: data.storage || _private.storage,
				defaults: data.defaults || _private.defaults
			});
		};
	};
	
	return self;

})();