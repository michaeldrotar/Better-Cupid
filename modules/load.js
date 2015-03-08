(function(window, document, $) {
	
	function loadModules() {
		Module.inject("scripts", function() {
			document.body.style.visibility = "visible";
		});
	/*
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
						$.ajax(module.path(module.id()+".html"), {
							dataType: "html",
							timeout: 5000,
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
								} catch 
								}
							},
			} catch ( error ) {
									console.error("An error occured injecting the "+mod.name()+" module", error);
								}
							},
							 status, error) {
							core.error("Failed to load defaults fFailed to load " + module.id + " module.");
			on(xhr, });
					},
					error: function(xhr, status, error) {
						core.error("Failed to load defaults for " + module.id + " module.");
						moduleAdded();
					}
				});
							moduleAdded();
						}
					});
				} else {
					moduleAdded();
				}
			}
			
			iterateModules = function() {
				$.each(modules, function(i, module) {
					switch ( module.state() ) {
						case "ready":
							loadModse "failed":
							modules.splice(i, 1);
							moduleAdded();
							return false;
					}
				});
				
				if ( modules.length > 0 ) {
					setTimeout(iterateModules, 1);
				}
							moduleAdded();
						}
				};);
				} else {
					moduleAdded();
				}
			};
			iterateModules();
			
		});
	*/
	}
	
	function waitForLoaded() {
		if ( document.readyState !== "loading" ) {
			document.removeEventListener("readystatechange", waitForLoaded, false);
			loadModules();
		}
	}
	
	function checkReadyState() {
		document.body.style.visibility = "hidden";
		
		if ( document.readyState !== "loading" ) {
			loadModules();
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
