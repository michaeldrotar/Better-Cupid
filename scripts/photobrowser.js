core.RegisterLoadingProcess("photobrowser", function(){
	
	if ( !core.onPage("/home") ) return
	
	document.getElementsByClassName("photobrowser").forEach(function(photobrowser) {
	
		photobrowser.getElementsByClassName("scrollbar").forEach(function(scrollbar) {
			scrollbar.style.display = "none"
		})
		
		var thumbnail_holder = document.getElementByClassName("bc_thumbs")
		if ( !thumbnail_holder ) {
			thumbnail_holder = document.createElement("div")
			thumbnail_holder.addClass("bc_thumbs")
			thumbnail_holder.setStyle("position: absolute; left: 20px; right: 210px; top: 30px")
			thumbnail_holder.appendTo(photobrowser)
		}
		
		photobrowser.getElementsByClassName("thumbnails").forEach(function(thumbs) {
			thumbs.style.display = "none"
			thumbs.getElementsByTagName("li").forEach(function(item) {
				core.ProcessElement(item, function() {
					var image = this.getElementByTagName("img")
					
					var url = ""
					var src = image ? image.src : ""
					var user = (/^[^_]+_(.+)$/).match(item.id, 1) || ""
					
					var detail = document.getElementById("browser_"+user)
					if ( detail ) {
						detail.setAttribute("data-bc-user", user)
						var username = detail.getElementByClassName("username")
						if ( username ) {
							var anchor = username.getElementByTagName("a")
							if ( anchor ) {
								url = anchor.href
							}
						}
					}
					
					var a = document.createElement("a")
					a.href = url
					
					var img = document.createElement("img")
					img.src = src
					img.setAttribute("data-bc-user", user)
					img.setStyle("width: 79px; height: 79px; margin: 0 8px 8px 0")
					
					img.addEventListener("mouseover", function(e) {
						var $detail = $(document.getElementById("browser_"+this.getAttribute("data-bc-user")))
						$detail.siblings().clearQueue().stop().animate({
							opacity: 0,
						}, {
							duration: 'slow',
							complete: function() {
								this.style.display = 'none'
							}
						})
						$detail.clearQueue().stop().css('display', 'block').animate({
							opacity: 1
						}, 'fast')
					}, false)
					
					img.appendTo(a)
					a.appendTo(thumbnail_holder)
				})
			})
		})
		
		photobrowser.getElementsByClassName("items").forEach(function(items) {
			
			core.ProcessElement(items, function() {
				this.setStyle({
					position: "relative",
					margin: "0px",
					height: "216px",
					width: "100%"
				})
			})
			
			items.getElementsByClassName("item").forEach(function(item, i, arr) {
				
				item.style.right = i === arr.length - 1 ? "6px" : "0px";
				
				core.ProcessElement(item, function() {
					this.setStyle({
						display: i == 0 ? "block" : "none",
						height: "190px",
						position: "absolute"
					})
					
					var user = this.getAttribute("data-bc-user")
					var js_params = "'"+user+"', 'divname', 'match/reject_result.html', '"+i+"'"
					
					var hide_button = document.createElement("p")
					hide_button.id = "hide_btn_"+i
					hide_button.addClass("btn white button small active")
					hide_button.setStyle("margin: 0px auto")
					hide_button.innerHTML = "<a href='#Hide' onclick=\"reject_user("+js_params+"); return false\">hide</a>"
					
					var unhide_button = document.createElement("p")
					unhide_button.id = "unhide_btn_"+i
					unhide_button.addClass("btn white button small active unhider")
					unhide_button.setStyle("margin: 0px auto; display: none")
					unhide_button.innerHTML = "<a href='#Hide' onclick=\"unreject_user("+js_params+"); return false\">un-hide</a>"
					
					var info = this.getElementsByClassName("info")[0]
					info.appendChild(hide_button)
					info.appendChild(unhide_button)
				})
				
			})
			
		})
		
	})
	
	var matches_block = document.getElementById("matches_block")
	if ( matches_block ) {
		var links = matches_block.getElementByClassName("links")
		if ( links ) {
			
			var improve = links.querySelector("li.improve")
			core.ProcessElement(improve, function() {
				this.setStyle({
					bottom: "14px",
					left: "30px"
				})
			})
			
			var more = links.querySelector("li.more")
			core.ProcessElement(more, function() {
				this.setStyle({
					bottom: "14px",
					right: "235px"
				})
			})
			
		}
	}
	
})