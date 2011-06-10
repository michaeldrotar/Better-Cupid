core.RegisterLoadingProcess("match", function(){
    
    var results = document.getElementById("match_results")
    if ( results ) {
        core.ProcessElement(results, function() {
            var pages = this.getElementByClassName("pages")
            if ( pages ) {
                pages.cloneNode(true).prependTo(this)
            }
        })
        
        var mini_results = document.getElementById("bc_mini_results")
        if ( !mini_results ) {
            mini_results = document.createElement("div")
            mini_results.id= "bc_mini_results"
            mini_results.setStyle("border: 1px solid #ddd; height: 62px; margin: 10px 15px 0px 15px; padding: 20px 15px; position: relative")
            mini_results.insertAbove(results)
        }
        
        results.style.marginTop = "15px"
        var pro_results = document.getElementById("pro_match_results")
        if ( pro_results ) pro_results.style.marginTop = "15px"
        
        var inc = 72 // mini_results.getWidth('content') / results.getElementsByClassName("match_row").length
        results.getElementsByClassName("match_row").forEach(function(row, x) {
            core.ProcessElement(row, function() {
                var image = this.getElementByClassName("user_image")
                
                var img = image.getElementByTagName("img")
                if ( img ) {
                    img = img.cloneNode(true)
                    img.setStyle({
                        height: "62px",
                        width: "62px"
                    })
                    img.removeAttribute("border")
                    img.removeAttribute("alt")
                }
                
                var span = image.getElementByTagName("span")
                if ( span ) {
                    span = span.cloneNode(true)
                    span.setStyle({
                        fontSize: 7,
                        height: 17,
                        lineHeight: 17,
                        width: 62
                    })
                }
                
                var thumb = document.createElement("a")
                thumb.href = "#"+this.id
                thumb.setStyle("position: absolute; left: "+(19+x*inc)+"px")
                thumb.appendTo(mini_results)
                
                if ( img ) img.appendTo(thumb)
                if ( span ) span.appendTo(thumb)
            })
        })
        
    }
    
})