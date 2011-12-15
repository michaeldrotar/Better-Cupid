(function(window, document, $) {
	
	function loadModules() {
		core.manifest(function(manifest) {
			var modules = [],
				moduleCount,
				iterateModules,
				count = 0;
			
			$.each(manifest.modules, function(_, data) {
				var module = new Module(data);
				if ( module.enabled() ) {
					modules.push(module);
				}
			});
			
			if ( modules.length === 0 ) {
				document.body.style.visibility = "visible";
				return;
			} else {
				moduleCount = modules.length;
			}
			
			function moduleAdded() {
				if ( ++count === moduleCount ) {
					document.body.style.visibility = "visible";
				}
			}
			
			function loadModule(module) {
				$.ajax(module.path("/defaults.json"), {
					dataType: "json",
					timeout: 2000,
					success: function(defaults, status, xhr) {
						module.db.defaults(defaults);
					},
					error: function() {
						module.db.defaults({});
					},
					complete: function() {
						$.ajax(module.path("/"+module.id()+".html"), {
							dataType: "html",
							timeout: 5000,
							success: function(markup, status, xhr) {
								var container = $("<div>");
								container.attr("id", module.id()+"-module");
								container[0].innerHTML = markup;
								
								try {
									window.module = module;
									$("body").append(container);
									delete window.module;
									module.state("loaded");
								} catch ( error ) {
									console.error("An error occured injecting the "+module.name()+" module:", error);
									module.state("failed");
								}
							},
							error: function(xhr, status, error) {
								console.error("Failed to load the "+module.name()+" module:", error);
								module.state("failed");
							},
							complete: function(xhr, status) {
								moduleAdded();
							}
						});
					}
				});
			}
			
			iterateModules = function() {
				$.each(modules, function(i, module) {
					switch ( module.state() ) {
						case "ready":
							loadModule(module);
							modules.splice(i, 1);
							return false;
						
						case "failed":
							modules.splice(i, 1);
							moduleAdded();
							return false;
					}
				});
				
				if ( modules.length > 0 ) {
					setTimeout(iterateModules, 1);
				}
			};
			iterateModules();
			
		});
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
