(function(window, document, $) {
	
	var moduleObjects = {};
	
	core.getModuleObject = function(id) {
		return moduleObjects[id];
	}
	
	function loadModules() {
		core.manifest(function(manifest) {
			var modules = manifest.modules;
			
			if ( !modules || modules.length === 0 ) {
				return;
			}
			
			modules.forEach(function(module) {
				var mod = new Module(module);
				moduleObjects[mod.id()] = mod;
				
				$.ajax(mod.path("/defaults.json"), {
					dataType: "json",
					timeout: 2000,
					success: function(defaults, status, xhr) {
						mod.db.defaults(defaults);
						
						$.ajax(mod.path("/"+module.id+"-options.html"), {
							dataType: "html",
							timeout: 5000,
							success: function(markup, status, xhr) {
								var container = document.createElement("div");
								container.id = module.id+"-module";
								container.innerHTML = "<h1>"+mod.name()+"</h1>"+markup;
								
								window.module = mod;
								$(document.body).append(container);
								delete window.module;
								
								options.ProcessOptionsPage("#"+module.id+"-module", mod);
							},
							error: function(xhr, status, error) {
								core.error("Failed to load " + module.id + " module.");
							}
						});
					},
					error: function(xhr, status, error) {
						core.error("Failed to load defaults for " + module.id + " module.");
					}
				});
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
