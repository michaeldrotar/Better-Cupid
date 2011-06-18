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
		
		if ( true ) {
			var recentlyVisited = document.getElementById("side_recently_viewed");
			if ( recentlyVisited ) {
				var numRows = settings.numRecentlyVisitedRows,
					visits = core.db.get("visits");
				if ( numRows === 0 || visits === null ) {
					recentlyVisited.style.display = "none";
				} else {
					core.ProcessElement(recentlyVisited, function() {
						var list = recentlyVisited.getElementByTagName("ul");
						$(recentlyVisited).find("li,p").detach();
						for ( var i = 0, l = Math.min(visits.length, numRows*3); i < l; i++ ) {
							var v = visits[i];
							var li = document.createElement("li");
							li.appendTo(list);
							var a = document.createElement("a");
							a.href = v.url;
							a.appendTo(li);
							var img = document.createElement("img");
							img.src = v.image;
							img.border = 0;
							img.width = 40;
							img.height = 40;
							img.appendTo(a);
						}
						var holder = document.createElement("div");
						holder.appendTo(list.parentNode);
						list.appendTo(holder);
						
						if ( list.getHeight() > 135 ) {
							holder.style.height = "135px";
							holder.style.overflow = "hidden";
							holder.style.position = "relative";
							list.style.position = "absolute";
							
							holder.addEventListener("mousewheel", function(e) {
								var dir = e.wheelDelta > 0 ? 1 : -1,
									change = dir * Math.ceil(holder.getHeight()/2),
									height = list.getHeight(),
									area = height - holder.getHeight(),
									top = list.getTop(holder);
									newTop = top + change;
								
								if ( dir > 0 && top === 0 ) return;
								if ( dir < 0 && top === -area ) return;
								
								if ( newTop > 0 ) newTop = 0;
								else if ( newTop < -area ) newTop = -area;
								
								list.style.marginTop = newTop + "px";
								e.stopPropagation();
								e.preventDefault();
							});
						}
					});
				}
			}
		}
		
	});
}, true);
