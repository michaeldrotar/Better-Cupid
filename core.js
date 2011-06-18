(function() {

var core = {};
core.noop = function(){};

// -- debugging --------------------------------------------------------------------------------------------------------

core.alert = function(obj) {
	var t = typeof obj;
	if ( t === "object" ) {
		var keys = [];
		for ( k in obj ) {
			keys.push(k);
		}
		if ( keys.length === 0 ) {
			alert(obj);
			return;
		}
		keys.sort();
		var msg = "";
		for ( var i = 0, l = keys.length; i < l; i++ ) {
			var k = keys[i],
				v = obj[k],
				t = typeof v;
			if ( v !== null && v.toString ) {
				var cutoff = 0;
				v = v.toString().replace(/\r/g, "\n").replace(/^\s+/, "");
				cutoff = v.length > 50 ? 45 : v.indexOf("\n");
				if ( cutoff > 0 ) {
					v = v.substring(0, cutoff) + " ...";
				}
			} else {
				v = "";
			}
			msg += k + " ["+t+"]\n"+v+"\n\n";
			if ( i % 10 === 9 ) {
				alert(msg);
				msg = "";
			}
		}
		if ( msg.length > 0 ) alert(msg);
	} else {
		alert("["+typeof(obj)+"]\n"+obj);
	}
};

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

// -- location ---------------------------------------------------------------------------------------------------------

(function() {
	var l = document.location,
		protocol = l.protocol.replace(":", ""),
		domain = l.host,
		port = l.port,
		path = l.pathname.length == 0 ? null : l.pathname,
		query = l.search.replace(/^\?/, ""),
		hash = l.hash.replace(/^#/, ""),
		baseurl = protocol+"://"+domain+(port.length > 0 ? ":"+port : "")+path,
		url = baseurl+(query.length > 0 ? "?"+query : "")+(hash.length > 0 ? "#"+hash : "");

	core.location = {
		protocol: protocol,
		domain: domain,
		port: port,
		path: path,
		query: query,
		hash: hash,
		baseurl: baseurl,
		url: url
	}
	
	core.onPage = function(search) {
		var url = core.location.url;
		return typeof(search) === "string" ? url.indexOf(search) > -1 : search.test(url);
	};
	
	core.onContentScript = core.location.protocol !== "chrome-extension";
	
})();

// -- sorting ----------------------------------------------------------------------------------------------------------

core.sorter = {};

core.sorter.numeric = function(a,b) { return core.sorter.numeric.ascending(a,b) };
core.sorter.numeric.ascending = function(a,b) { return a-b };
core.sorter.numeric.descending = function(a,b) { return b-a };

// -- comms ------------------------------------------------------------------------------------------------------------

core.SendRequest = function(request, callback) {
	chrome.extension.sendRequest(request, callback || core.noop);
};

// -- events -----------------------------------------------------------------------------------------------------------

(function() {
	
	var hooks = {};
	var firedEvents = {};
	
	core.HookEvent = function(event, func, nowIfFired) {
		event = event.toUpperCase();
		if ( !(event in hooks) ) {
			hooks[event] = [];
		}
		hooks[event].push(func);
		core.debug("Hooked function '{0}' to {1}", [func.name, event]);
		if ( nowIfFired && firedEvents[event] ) {
			func();
		}
		return core;
	}
	
	core.UnhookEvent = function(event, func) {
		event = event.toUpperCase();
		if ( event in hooks ) {;
			var funcs = hooks[event];
			for ( var i = funcs.length-1; i >= 0; i-- ) {
				if ( funcs[i] === func ) {
					funcs.splice(i,1);
					core.debug("Unhooked function '{0}' from {1}", [func.name, event]);
				}
			}
		}
		return core;
	}
	
	core.FireEvent = function(event, obj) {
		event = event.toUpperCase();console.debug("test");
		core.debug("Firing event {0} ...", event);
		firedEvents[event] = true;
		if ( event in hooks ) {
			var funcs = hooks[event];
			for ( var i = 0, l = funcs.length; i < l; i++ ) {
				core.debug(" - Calling function '{0}'", funcs[i].name);
				try {
					funcs[i](obj);
				} catch(e) {
					//core.error("Function failed: "+e.toString());
					//console.log(e);
					//console.trace();
					console.error("Uncaught "+e.toString());
				}
			}
		}
		return core;
	}
	
})();

// -- generic event handlers -------------------------------------------------------------------------------------------

(function(){
	
	core.handlers = {};
	
})();

// -- loading process --------------------------------------------------------------------------------------------------

(function(){
	
	// readyState: [ "loading", "interactive", "complete" ]
	
	var running = false;
	var loading = document.readyState === "loading";
	var funcs = [];
	
	var process
	process = function() {
		if ( running ) return
		running = true
		
		for ( var i = 0, l = funcs.length; i < l; i++ ) {
			funcs[i]()
		}
		
		if ( !loading ) {
			window.removeEventListener("DOMSubtreeModified", process, false)
		}
		
		running = false
	}
	
	var process_interval = false
	var queue_process = function() {
		if ( !process_interval ) {
			process_interval = setInterval(function() {
				
			}, 500)
		}
	}
	
	var onstatechange
	onstatechange = function(e) {
		if ( document.readyState != "loading" ) {
			loading = false
			document.removeEventListener("readystatechange", onstatechange, false)
		}
	}
	
	if ( loading ) {
		document.addEventListener("readystatechange", onstatechange, false)
		window.addEventListener("DOMSubtreeModified", process, false);
	}
	
	core.RegisterLoadingProcess = function(id, callback) {
		if ( loading ) {
			funcs.push(callback)
		} else {
			callback()
		}
		core.debug("Registered loading process for {0}", id)
	}
	
	core.ProcessElement = function(ele, func) {
		var vis;
		if ( !ele ) {
			return;
		}
		if ( !ele.getAttribute("data-bc-visibility") ) {
			ele.setAttribute("data-bc-visibility", ele.style.visibility || "null");
			ele.style.visibility = "hidden";
		}
		if ( !ele.getAttribute("data-bc-processed") && ele.isMarkupLoaded() ) {
			core.info("Processing element {0}",ele.id || ele.className || "");
			vis = ele.getAttribute("data-bc-visibility");
			ele.style.visibility = vis === "null" ? null : vis;
			func.call(ele)
			ele.setAttribute("data-bc-processed", true)
		}
	}
	
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
		localStorage.clear();
		core.debug("Getting local storage");
		core.SendRequest({ type: "db.get.all" }, function(response) {
			for ( k in response.data ) {
				localStorage.setItem(k, response.data[k]);
			}
			core.FireEvent("VARIABLES_LOADED");
		})
	} else {
		core.FireEvent("VARIABLES_LOADED");
	}
	
	core.db = db;
	
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

// -- Upgrading --------------------------------------------------------------------------------------------------------

/*
var lastBuild = db.get('build')
switch ( lastBuild ) {

}
if ( lastBuild !== core.build ) {
	db.set('lastBuild', lastBuild)
}
db.set('build', core.build)
*/

// -- Main -------------------------------------------------------------------------------------------------------------

window.core = core

})()