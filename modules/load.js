(function(window, document, $) {
	
	function loadModules() {
		Module.inject("scripts", function() {
			document.body.style.visibility = "visible";
		});
	/*
		core.manifest(function(manifest) {
			var modules = manifest.modules,
				count = 0;
			
			if ( !modules || modules.length === 0 ) {
				document.body.style.visibility = "visible";
				return;
			}
			
			function moduleAdded() {
				if ( ++count === modules.length ) {
					document.body.style.visibility = "visible";
				}
			}
			
			modules.forEach(function(module) {
				var mod = new Module(module);
				
				$.ajax(mod.path("defaults.json"), {
					dataType: "json",
					timeout: 2000,
					success: function(defaults, status, xhr) {
						mod.db.defaults(defaults);
						
						$.ajax(mod.path(module.id+".html"), {
							dataType: "html",
							timeout: 5000,
							success: function(markup, status, xhr) {
								var container = document.createElement("div");
								container.id = module.id+"-module";
								container.innerHTML = markup;
								
								try {
									window.module = mod;
									$(document.body).append(container);
									delete window.module;
								} catch ( error ) {
									console.error("An error occured injecting the "+mod.name()+" module", error);
								}
							},
							error: function(xhr, status, error) {
								core.error("Failed to load " + module.id + " module.");
							},
							complete: function(xhr, status) {
								moduleAdded();
							}
						});
					},
					error: function(xhr, status, error) {
						core.error("Failed to load defaults for " + module.id + " module.");
						moduleAdded();
					}
				});
			});
		});
	*/
	}
	
	function waitForDB() {
		if ( core.db.state === "ready" ) {
			core.removeEventListener("dbstatechange", waitForDB, false);
			loadModules();
		}
	}
	
	function checkDB() {
		if ( core.db.state === "ready" ) {
			loadModules();
		} else {
			core.addEventListener("dbstatechange", waitForDB, false);
		}
	}
	
	function waitForLoaded() {
		if ( document.readyState !== "loading" ) {
			document.removeEventListener("readystatechange", waitForLoaded, false);
			checkDB();
		}
	}
	
	function checkReadyState() {
		document.body.style.visibility = "hidden";
		
		if ( document.readyState !== "loading" ) {
			checkDB();
		} else {
			document.addEventListener("readystatechange", waitForLoaded, false);
		}
	}
	
	function waitForBody() {
		if ( document.body ) {
			document.removeEventListener("DOMSubtreeModified", waitForBody, false);
			checkReadyState();
		}
	}
	
	if ( document.body ) {
		checkReadyState();
	} else {
		document.addEventListener("DOMSubtreeModified", waitForBody, false);
	}
	
})(window, document, jQuery);
