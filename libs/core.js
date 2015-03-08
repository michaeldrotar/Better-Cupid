var core = {};

(function() {

core.noop = function() {};

// -- regex ------------------------------------------------------------------------------------------------------------

core.regex = {
};

// -- console enhancements ---------------------------------------------------------------------------------------------

["assert", "debug", "error", "info", "warn"].forEach(function(k) {
	core[k] = function(msg, args) {
		if ( window.console && window.console[k] ) {
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift('BetterCupid:');
			window.console[k].apply(window.console, args);
		}
	}
});

// -- location & pathing -----------------------------------------------------------------------------------------------

(function() {
	var l = document.location,
		x = {
			protocol: l.protocol.substring(0, l.protocol.length - 1),
			domain  : l.host,
			port    : l.port,
			path    : l.pathname,
			query   : l.search.substring(1),
			hash    : l.hash.substring(1)
		},
		root = "chrome-extension://"+chrome.i18n.getMessage("@@extension_id");
	
	if ( document.location.href.indexOf(root) === 0 ) {
		root = "";
	}
	
	x.baseurl = x.protocol + "://" + x.domain + ( x.port.length > 0 ? ":"+x.port : "" ) + x.path;
	x.url     = x.baseurl + ( x.query.length > 0 ? "?"+x.query : "" ) + ( x.hash.length > 0 ? "#"+x.hash : "" );
	
	core.location = x;
	
	core.onPage = function(search) {
		return typeof search === "string" ? x.url.indexOf(search) > -1 : search.test(x.url);
	};
	
	core.onContentScript = ( x.protocol !== "chrome-extension" );
	
	core.rootPath = function(path) {
		if ( path.substring(0, 1) !== "/" ) {
			path = "/"+path;
		}
		return root + (path || "");
	};
	
})();

// -- sorting ----------------------------------------------------------------------------------------------------------

core.sorter = {};

core.sorter.numeric = function(a,b) { return core.sorter.numeric.ascending(a,b) };
core.sorter.numeric.ascending = function(a,b) { return a-b };
core.sorter.numeric.descending = function(a,b) { return b-a };

// -- comms ------------------------------------------------------------------------------------------------------------

core.SendRequest = function(request, callback) {
	chrome.extension.sendMessage(request, typeof callback === "function" ? callback : core.noop);
};

// -- events -----------------------------------------------------------------------------------------------------------

(function() {
	
	var ele = document.createElement("div");
	
	["addEventListener", "removeEventListener"].forEach(function(method) {
		core[method] = function() {
			ele[method].apply(ele, arguments);
		};
	});
	
	core.dispatchEvent = function(details) {
		var event;
		if ( typeof details === "string" ) {
			details = { type: details };
		}
		
		event = document.createEvent("CustomEvent");
		event.initCustomEvent(details.type, details.canBubble || false, details.cancelable || false, details);
		ele.dispatchEvent(event);
	};
})();

// -- db ---------------------------------------------------------------------------------------------------------------

var db = {};
(function(){
	
	db.clear = function(k) {
		if ( typeof k === "string" ) {
			localStorage.removeItem(k);
		} else {
			localStorage.clear();
		}
		if ( core.onContentScript ) {
			core.SendRequest({ type: "db.clear", key: k });
		}
		return db;
	}
	
	db.get = function(k) {
		return JSON.parse(localStorage.getItem(k));
	}
	
	db.set = function(k, v) {
		localStorage.setItem(k, JSON.stringify(v));
		if ( core.onContentScript ) {
			core.SendRequest({ type: "db.set", key: k, value: v });
		}
		return db;
	}
	
	if ( core.onContentScript ) {
		db.state = "loading";
		core.dispatchEvent("dbstatechange");
		localStorage.clear();
		core.SendRequest({ type: "db.get.all" }, function(response) {
			for ( k in response.data ) {
				localStorage.setItem(k, response.data[k]);
			}
			db.state = "ready";
			core.dispatchEvent("dbstatechange");
		})
	} else {
		db.state = "ready";
		core.dispatchEvent("dbstatechange");
	}
	
	core.db = db;
	
})();

// -- manifest ---------------------------------------------------------------------------------------------------------

(function() {
	var manifest,
		callbacks = [];
	
	core.manifest = function(callback) {
		var request, getManifest, reported;
		
		if ( manifest ) {
			callback(manifest);
		} else {
			callbacks.push(callback);
			if ( callbacks.length === 1 ) {
				request = {
					"url": core.rootPath("/manifest.json"),
					"dataType": "json",
					"success": function(temp_manifest, status, xhr) {
						if ( reported ) {
							core.info("Successfully retreived manifest json.");
						}
						request.url = core.rootPath("/modules.json");
						request.success = function(response, status, xhr) {
							if ( reported ) {
								core.info("Successfully retrieved manifest json.");
							}
							temp_manifest.modules = response;
							manifest = temp_manifest;
							callbacks.forEach(function(callback) {
								callback(manifest);
							});
							delete callbacks;
						};
						getManifest();
					},
					"error": function(xhr, status, message) {
						if ( !reported ) {
							core.error("Failed to retrieve the manifest. Will keep retrying...");
							reported = true;
						}
						setTimeout(getManifest, 5000);
					}
				};
				getManifest = function() {
					$.ajax(request);
				};
				getManifest();
			}
		}
	};
	
})();

// -- L ----------------------------------------------------------------------------------------------------------------

var L;
(function(){
	var cache = {}
	var getMessage = chrome.i18n.getMessage
	L = function() {
		if ( arguments.length == 0 ) return null
		
		if ( arguments.length == 1 )
		{
			var key = arguments[0]
			if ( cache[key] ) return cache[key]
			var msg = getMessage(key)
			cache[key] = msg
			return msg
		}
		
		return getMessage(arguments[0], arguments[1])
	}
})();

})();