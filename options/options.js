var options = {};

(function() {

// -- General ----------------------------------------------------------------------------------------------------------

$(".switcher").switcher();

// -- Changelog/About --------------------------------------------------------------------------------------------------

(function() {

	var cache = {};
	function GenerateLoadSectionFunction(selector, url, callback) {
		var widget = $(selector),
			func, onerror;
		onerror = function() {
			cache[selector] = false;
			var refresh = $(
				"<p class='error'>"+
					"There was an error retrieving the information. The server may be down."+
					" Click <a href=''>here</a> to try again."+
				"</p>"
			);
			refresh.click(function(e) {
				e.stopPropagation();
				e.preventDefault();
				func(true);
			});
			widget.html("").append(refresh);
		};
		func = function(force) {
			if ( force === true || !cache[selector] ) {
				widget.html("<p>Loading...</p>");
				core.SendRequest({
					type: "fetch",
					force: force === true,
					url: url
				}, function(response) {
					if ( response.error ) {
						onerror();
					} else {
						cache[selector] = true;
						if ( callback ) {
							try {
								callback(response);
							} catch(error) {
								onerror();
							}
						} else {
							widget.html($(response.data).find(".markdown-body").html());
						}
					}
				});
			}
		};
		return func;
	}
	
	$("#changelog_tab").click(GenerateLoadSectionFunction(
		"#changelog_tab_content",
		"https://github.com/michaeldrotar/Better-Cupid/wiki/Changelog",
		function(response) {
			var html = $(response.data).find(".markdown-body").html(),
				versions = [],
				count = 0;
			
			// Build an array of all major/minor versions and wrap each version section in a div tag
			// Also add each version to the menu
			html = html.replace(/<h1>\s*Version ((\d+\.\d+)[\.\d]*)\s*<\/h1>/g,
				function(text, fullVersion, shortVersion) {
					var key = shortVersion.replace(/[^\d]/g, "_"),
						keyExists = false;
					
					versions.forEach(function(version) {
						if ( version.key === key ) {
							keyExists = true;
						}
					});
					
					if ( !keyExists ) {
						versions.push({
							key: key,
							text: shortVersion+".x"
						});
						count += 1;
						return ( count > 1 ? "</div>" : "" ) +
							"<div id='changelog_"+key+"_content'>" + text;
					} else {
						return text;
					}
				}
			) + "</div>";
			
			// Reformat the date from a paragraph element to a div.date
			html = html.replace(/<p>(\s*\d+\/\d+\/\d+\s*)<\/p>/g, "<div class='date'>$1</div>");
			
			// Build the Menu
			html =
				"<div class='tab_content_nav'>" +
					"<div class='title'>Versions</div>" +
						"<ul class='switcher'></ul>" +
					"</div>" +
					"<div class='tab_content_left'>" +
						html +
					"</div>" +
				"</div>";
			
			// Add the changelog to the page
			var changelog = $("#changelog_tab_content");
			changelog.html(html);
			
			// Detach the "Changelog" header that comes from the wiki page
			changelog.find("h1").each(function() {
				var header = $(this);
				if ( header.text() === "Changelog" ) {
					header.detach();
				}
			});
			
			// Add each version to the menu and implement the page switching capability
			var switcher = changelog.find(".switcher");
			versions.forEach(function(version) {
				var tab_id = "changelog_"+version.key+"_tab",
					content_id = "changelog_"+version.key+"_content";
				
				switcher.append(
					"<li id='"+tab_id+"' data-content-selector='#"+content_id+"'>"+
						version.text+
					"</li>"
				);
			});
			switcher.switcher();
		}
	));
	
	$("#about_tab").click(GenerateLoadSectionFunction(
		"#about_tab_content",
		"https://github.com/michaeldrotar/Better-Cupid/wiki/About"
	));
	
})();

// -- Settings ---------------------------------------------------------------------------------------------------------

(function() {
	
	var module_hash = {};
	
	var init = {
		checkbox: function(setting, module) {
			this.checked = module.db.get(setting);
			$(this).change();
		},
		text: function(setting, module) {
			this.value = module.db.get(setting);
			$(this).change();
		}
	};
	
	var onchange = {
		checkbox: function(e, setting, module) {
			module.db.set(setting, this.checked);
		},
		text: function(e, setting, module) {
			var val = this.value;
			switch ( this.getAttribute("data-type") ) {
				case "integer":
					val = parseInt(val);
				case "float":
					val = parseFloat(val);
			}
			module.db.set(setting, val);
		}
	};
	
	function toggleEnabled(module) {
		module.db.set("enabled", !module.db.get("enabled"));
	}
	
	options.ProcessOptionsPage = function(selector, module) {
		var page = $(selector);
		
		module_hash[module.id()] = module;
		
		page.find("[data-setting]").attr("data-module", module.id()).each(function() {
			var f = init[this.type],
				f2 = onchange[this.type],
				setting = this.getAttribute("data-setting");
			if ( f ) {
				f.call(this, setting, module);
			}
			if ( f2 ) {
				$(this).change(function(e) {
					f2.call(this, e, setting, module);
				});
			}
		});
		
		$("#settings_tab_content .tab_content_left").append(page);
		var li = $("<li id='"+module.id()+"-tab' data-content-selector='#"+page.attr("id")+"'>"+module.name()+"</li>");
		$("#settings_tab_content .switcher").append(li).switcher();
		var en = $("<span class='switch'></span>");
		en.click(function(e) {
			toggleEnabled(module);
			if ( module.db.get("enabled") ) {
				this.addClass("enabled");
				this.innerHTML = "Enabled";
			} else {
				this.removeClass("enabled");
				this.innerHTML = "Disabled";
			}
			e.stopPropagation();
			e.preventDefault();
		});
		if ( module.db.get("enabled") ) {
			en.addClass("enabled");
			en.html("Enabled");
		} else {
			en.html("Disabled");
		}
		li.append(en);
	};
	
	$("#reset-confirmation-dialog").dialog({
		autoOpen: false,
		modal: true,
		open: function() {
			$(".ui-widget-overlay").css("height", "").css("width", "");
			if ( $("#settings_tab").hasClass("active") ) {
				$("#reset-confirmation-dialog .page-text").show();
				$("#reset-confirmation-dialog .all-text").hide();
				$("#reset-page-button").show();
			} else {
				$("#reset-confirmation-dialog .page-text").hide();
				$("#reset-confirmation-dialog .all-text").show();
				$("#reset-page-button").hide();
			}
		}
	});
	$("#reset_button").click(function(e) {
		$("#reset-confirmation-dialog").dialog("open");
	});
	$("#reset-all-button").click(function(e) {
		$("[data-module]").each(function() {
			var modName = this.getAttribute("data-module"),
				setting = this.getAttribute("data-setting"),
				module = module_hash[modName],
				f = init[this.type];
			module.db.clear(setting);
			if ( f ) {
				f.call(this, setting, module);
			}
		});
		$("#reset-confirmation-dialog").dialog("close");
	});
	$("#reset-page-button").click(function(e) {
		$("#settings_tab_content .switcher li").each(function() {
			var tab = this,
				module,
				modName;
			if ( tab.hasClass("active") ) {
				modName = tab.id.replace(/\-tab$/, "");
				module = module_hash[modName];
				$("[data-module="+modName+"]").each(function() {
					var setting = this.getAttribute("data-setting"),
						f = init[this.type];
					module.db.clear(setting);
					if ( f ) {
						f.call(this, setting, module);
					}
				});
			}
		});
		$("#reset-confirmation-dialog").dialog("close");
	});
	
	if ( 1 ) return;
	
	(function() {
		var settings = core.settings;
		$("input").each(function() {
			var key = this.getAttribute("data-setting");
			if ( key ) {
				switch ( this.type ) {
					case "checkbox":
						this.checked = settings.get(key);
						$(this).click(function() {
							settings.set(this.getAttribute("data-setting"), this.checked ? true : false);
						});
						break;
						
					case "range":
						this.value = settings.get(key);
						$("#"+key+"Display").html(this.value);
						$(this).change(function() {
							var key = this.getAttribute("data-setting");
							settings.set(key, this.value);
							$("#"+key+"Display").html(this.value);
						});
						break;
					
					case "text":
					default:
						break;
				}
			}
		});
	})();
	
})();

})();