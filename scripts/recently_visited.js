core.HookEvent("VARIABLES_LOADED", function() {
	var settings = core.settings;
	
	core.RegisterLoadingProcess("recently_visited", function() {
		
		core.ProcessElement(document.getElementById("side_recently_viewed"), function() {
			var recentlyVisited = this,
				numRows = settings.get("numRecentlyVisitedRows"),
				visitLog = core.db.get("recentlyVisited") || [],
				visitItems = recentlyVisited.getElementsByTagName("li"),
				clearButton = $(recentlyVisited).find("a.flat_button")[0];
			
			visitItems.reverseForEach(function(visitItem) {
				var visit = {
					url: visitItem.getElementByTagName("a").href,
					image: visitItem.getElementByTagName("img").src
				}
				visitLog.reverseForEach(function(logItem, index, log) {
					if ( logItem.url === visit.url ) {
						log.splice(index, 1);
					}
				});
				visitLog.splice(0, 0, visit);
			});
			
			while ( visitLog.length > 100 ) {
				visitLog.pop();
			}
			
			core.db.set("recentlyVisited", visitLog);
			
			if ( numRows === 0 || visitLog.length === 0 ) {
				recentlyVisited.style.display = "none";
			} else {
				var list = recentlyVisited.getElementByTagName("ul"),
					min = Math.min(visitLog.length, numRows*3);
				
				$(list).children().detach();
				
				visitLog.forEach(function(visit, index, log) {
					if ( index < min ) {
						
						var li = document.createElement("li");
						li.appendTo(list);
						
						var a = document.createElement("a");
						a.href = visit.url;
						a.appendTo(li);
						
						var img = document.createElement("img");
						img.src = visit.image;
						img.border = 0;
						img.width = 40;
						img.height = 40;
						img.appendTo(a);
						
					}
				});
				
				clearButton.addEventListener("click", function() {
					core.db.clear("recentlyVisited");
				});
				
				if ( list.getHeight() > 135 ) {
					var holder = document.createElement("div");
					holder.insertAbove(clearButton.parentNode);
					list.appendTo(holder);
					
					holder.setStyle({
						height: "135px",
						marginBottom: "9px",
						overflow: "hidden",
						position: "relative"
					});
					list.setStyle("position", "absolute");
					
					holder.addEventListener("mousewheel", function(e) {
						var dir = e.wheelDelta > 0 ? 1 : -1,
							change = dir * Math.ceil((holder.getHeight()*2)/3),
							height = list.getHeight() - 9,
							area = height - holder.getHeight(),
							top = list.getTop(holder);
							newTop = top + change;
						
						if ( dir > 0 && top === 0 ) return;
						if ( dir < 0 && top === -area ) return;
						
						if ( newTop > 0 ) newTop = 0;
						else if ( newTop < -area ) newTop = -area;
						
						list.setStyle("top", newTop + "px");
						e.stopPropagation();
						e.preventDefault();
					});
				}
			}
		});
	});
}, true);
