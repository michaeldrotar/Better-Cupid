var db = core.db;

core.HookEvent("VARIABLES_LOADED", function() {
	var settings = db.get("settings") || {};
	
	core.RegisterLoadingProcess("misc", function() {
		
		if ( settings.hideYouMightLike ) {
			$(".section.matches").each(function() {
				this.getElementsByTagName("h5").forEach(function(el) {
					if ( el.innerHTML && el.innerHTML.toLowerCase().indexOf("you might like") >= 0 ) {
						el.parentNode.style.display = 'none';
					}
				});
			});
		}
		
	});
}, true);
