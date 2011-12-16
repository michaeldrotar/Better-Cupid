(function(window, document, $) {
	
	function loadModules() {
		core.manifest(function(manifest) {
			var modules = [],
				moduleCount,
				count = 0;
			
			$.each(manifest.modules, function(_, data) {
				var module = new Module(data);
				if ( module.enabled() ) {
					modules.push(module);
				}
			});
			
			if ( modules.length === 0 ) {
				return;
			} else {
				moduleCount = modules.length;
			}
			
			function moduleAdded() {
				if ( ++count === moduleCount ) {
					// all are loaded and ready to go
				}
			}
			
			function loadModule(module) {
				$.ajax(module.path("/defaults.json"), {
					dataType: "json",
					timeout: 2000,
					success: function(defaults, status, xhr) {
						module.db.defaults(defaults);
					},
					complete: function() {
						$.ajax(module.path("/"+module.id()+"-background.html"), {
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
								module.state("failed");
							},
							complete: function(xhr, status) {
								moduleAdded();
							}
						});
					}
				});
			}
			
			$.each(modules, function(i, module) {
				loadModule(module);
			});
			
		});
	}
	
	function waitForDB() {
		if ( core.db.state === "ready" ) {
			core.removeEventListener("dbstatechange", waitForDB, false);
			loadModules();
		}
	}
	
	if ( core.db.state === "ready" ) {
		loadModules();
	} else {
		core.addEventListener("dbstatechange", waitForDB, false);
	}
	
})(window, document, jQuery);
