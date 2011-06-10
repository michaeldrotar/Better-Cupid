(function(){

var core = {}

// -- debugging --------------------------------------------------------------------------------------------------------

core.alert = function(obj) {
	var t = typeof(obj)
	if ( t == "object" ) {
		var keys = []
		for ( k in obj ) {
			keys.push(k)
		}
		keys.sort()
		var msg = ""
		for ( var i = 0, l = keys.length; i < l; i++ ) {
			var k = keys[i]
			var v = obj[k]
			if ( v !== null && v.toString ) {
				var ellipse = false
				v = v.toString()
				v = v.replace(/\r/g, "\n").replace(/^\s+/, "")
				if ( v.indexOf("\n") > -1 ) {
					v = v.substring(0, v.indexOf("\n"))
					ellipse = true
				}
				if ( v.length > 50 ) {
					v = v.substring(0, 45)
					ellipse = true
				}
				if ( ellipse ) v = v + " ..."
			} else {
				v = ""
			}
			msg += k + " ["+typeof(v)+"]\n"+v+"\n\n"
			if ( i % 10 == 9 ) {
				alert(msg)
				msg = ""
			}
		}
		if ( msg.length > 0 ) alert(msg)
	} else {
		alert("["+typeof(obj)+"]\n"+obj)
	}
};

// -- regex ------------------------------------------------------------------------------------------------------------

core.regex = {
	
};

// -- messaging --------------------------------------------------------------------------------------------------------

["debug", "error", "info", "warn"].forEach(function(k) {
	core[k] = function(msg, args) {
		if ( console ) {
			if ( typeof(msg) === "object" && msg.join ) {
				msg = msg.join(" ");
			}
			console[k]("BetterCupid: "+msg.toString().format(args).replace(/\s+/g, " "))
		}
	}
});

// -- location ---------------------------------------------------------------------------------------------------------

(function() {
	var l = document.location
	var protocol = l.protocol.replace(":", "")
	var domain = l.host
	var port = l.port
	var path = l.pathname.length == 0 ? null : l.pathname
	var query = l.search.replace(/^\?/, "")
	var hash = l.hash.replace(/^#/, "")

	var baseurl = protocol+"://"+domain+(port.length > 0 ? ":"+port : "")+path
	var url = baseurl+(query.length > 0 ? "?"+query : "")+(hash.length > 0 ? "#"+hash : "")

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
		var url = core.location.url
		return typeof(search) == "string" ? url.indexOf(search) > -1 : search.test(url)
	};
	
})();

// -- content script detection -----------------------------------------------------------------------------------------

core.content_script = (core.location.protocol != "chrome-extension");

// -- sorting ----------------------------------------------------------------------------------------------------------

core.sorter = {}

core.sorter.numeric = function(a,b) { return core.sorter.numeric.ascending(a,b) };
core.sorter.numeric.ascending = function(a,b) { return a-b };
core.sorter.numeric.descending = function(a,b) { return b-a };

// -- events -----------------------------------------------------------------------------------------------------------

(function(){
	
	var hooks = {}
	
	core.HookEvent = function(event, func) {
		event = event.toUpperCase()
		if ( !(event in hooks) ) {
			hooks[event] = []
		}
		hooks[event].push(func)
		core.debug("Hooked function '{0}' to {1}", [func.name, event])
	}
	
	core.UnhookEvent = function(event, func) {
		event = event.toUpperCase()
		if ( event in hooks ) {
			var funcs = hooks[event]
			for ( var i = funcs.length-1; i >= 0; i-- ) {
				if ( funcs[i] == func ) {
					funcs.splice(i,1)
					core.debug("Unhooked function '{0}' from {1}", [func.name, event])
				}
			}
		}
	}
	
	core.FireEvent = function(event, obj) {
		event = event.toUpperCase()
		core.debug("Firing event {0} ...", event)
		if ( event in hooks ) {
			var funcs = hooks[event]
			for ( var i = 0, l = funcs.length; i < l; i++ ) {
				core.debug(" - Calling function '{0}'", funcs[i].name)
				try {
					funcs[i](obj)
				} catch(e) {
					core.error("Function failed")
					console.log(e)
					console.trace()
				}
			}
		}
	}
	
})();

// -- generic event handlers -------------------------------------------------------------------------------------------

(function(){
	
	core.handlers = {}
	
})();

// -- loading process --------------------------------------------------------------------------------------------------

(function(){
	
	// readyState: [ "loading", "interactive", "complete" ]
	
	var running = false
	var loading = document.readyState == "loading"
	var funcs = []
	
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
		if ( ele && !ele.getAttribute("data-bc-processed") && ele.isMarkupLoaded() ) {
			func.call(ele)
			ele.setAttribute("data-bc-processed", true)
		}
	}
	
})();

// -- db ---------------------------------------------------------------------------------------------------------------

var db = {};
(function(){
	var defaults = {
		fancy_questions: true,
		show_hide_button: true,
		show_match_minibar: true,
		show_nav_above: true,
		show_nav_below: true,
		show_people_summaries: true
	}
	var types = {}
	for ( i in defaults ) { types[i] = typeof(defaults[i]) }
	
	var get = function(k) {
		var item = localStorage.getItem(k)
		if ( item == null ) {
			if ( k in defaults ) item = defaults[k]
			return item
		}
		switch ( types[i] ) {
			case "boolean":
				return item == "true"
				break
		}
		return null
	}
	
	db.get = function(k) {
		var val = get(k)
		core.FireEvent("GET_VARIABLE", {key:k,value:val})
		return val
	}
	db.set = function(k,v) {
		var val = get(k)
		localStorage.setItem(k,v)
		core.FireEvent("SET_VARIABLE", {key:k,lastValue:val,value:get(k)})
	}
	db.del = function(k) {
		var val = get(k)
		localStorage.removeItem(k)
		core.FireEvent("DELETE_VARIABLE", {key:k,lastValue:val})
	}
	db.clear = function() {
		localStorage.clear()
		core.FireEvent("CLEAR_VARIABLES")
	}
	
	if ( core.location.protocol == "chrome-extension" ) {
		core.FireEvent("VARIABLES_LOADED")
	} else {
		for ( k in defaults ) {
			localStorage.removeItem(k)
		}
		chrome.extension.sendRequest({type: "db.get.all"}, function(response) {
			for ( k in response.data ) {
				localStorage.setItem(k, response.data[k])
			}
			core.FireEvent("VARIABLES_LOADED")
		})
	}
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

var lastBuild = db.get('build')
switch ( lastBuild ) {

}
if ( lastBuild != core.build ) {
	db.set('lastBuild', lastBuild)
}
db.set('build', core.build)

// -- Main -------------------------------------------------------------------------------------------------------------

window.core = core

})()