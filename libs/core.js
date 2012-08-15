var core = {};

(function() {

core.noop = function() {};

// -- regex ------------------------------------------------------------------------------------------------------------

core.regex = {
};

// -- console enhancements ---------------------------------------------------------------------------------------------

["debug", "error", "info", "warn"].forEach(function(k) {
	core[k] = function(msg, args) {
		if ( console ) {
			if ( typeof(msg) === "object" && msg.join ) {
				msg = msg.join(" ");
			}
			console[k]("BetterCupid: "+msg.toString().format(args).replace(/\s+/g, " "));
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
	
	x.baseurl = x.protocol + "://" + x.domain + ( x.port.length > 0 ? ":"+x.port : "" ) + x.path;
	x.url     = x.baseurl + ( x.query.length > 0 ? "?"+x.query : "" ) + ( x.hash.length > 0 ? "#"+x.hash : "" );
	
	core.location = x;
	
	core.onPage = function(search) {
		return typeof search === "string" ? x.url.indexOf(search) > -1 : search.test(x.url);
	};
	
	core.onContentScript = ( x.protocol !== "chrome-extension" );
	core.onBackgroundPage = ( x.protocol === "chrome-extension" && x.path.indexOf("background/background.html") > 0 );
	
	core.rootPath = function(path) {
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
	chrome.extension.sendRequest(request, typeof callback === "function" ? callback : core.noop);
};
core.sendRequest = core.SendRequest;

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
		if ( !core.onBackgroundPage ) {
			core.SendRequest({ type: "db.clear", key: k });
		}
		core.dispatchEvent({ type: "dbchange", key: k });
		return db;
	}
	
	db.get = function(k) {
		return JSON.parse(localStorage.getItem(k));
	}
	
	db.set = function(k, v) {
		localStorage.setItem(k, JSON.stringify(v));
		if ( !core.onBackgroundPage ) {
			core.SendRequest({ type: "db.set", key: k, value: v });
		}
		core.dispatchEvent({ type: "dbchange", key: k });
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
		var getManifest, reported;
		
		if ( manifest ) {
			callback(manifest);
		} else {
			callbacks.push(callback);
			if ( callbacks.length === 1 ) {
				getManifest = function() {
					$.ajax(core.rootPath("/manifest.json"), {
						dataType: "json",
						success: function(data) {
							if ( reported ) {
								core.info("Successfully retrieved manifest.json.");
							}
							manifest = data;
							callbacks.forEach(function(callback) {
								callback(manifest);
							});
							delete callbacks;
						},
						error: function(xhr, status, error) {
							if ( !reported ) {
								core.error("Failed to retrieve manifest.json. Will keep retrying...");
								reported = true;
							}
							setTimeout(getManifest, 5000);
						}
					});
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

if ( core.onContentScript ) {
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		console.log(request.type,request);
	});
	chrome.extension.sendRequest({type:"script"});
}

})();