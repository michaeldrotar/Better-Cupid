if ( core.onPage("/questions") ) {
core.RegisterLoadingProcess("questions", function() {
    
    core.ProcessElement(document.getElementByClassName("questions"), function() {
        this.setStyle("display", "none");
        
        var div = document.createElement("div");
        div.id = "bc_question_progress";
        div.innerHTML = "Loading page 1...";
        div.insertAbove(this);
    }, true);
    
    // -- pages --------------------------------------------------------------------------------------------------------
    (function() {
        
    })();
    
});
}

if ( core.onPage("/questions") ) {
} else if ( false ) {
core.RegisterLoadingProcess("questions", function() {
    
    if ( document.readyState === "loading" ) return;
    
    // -- base ---------------------------------------------------------------------------------------------------------
    
    var questions = {}
    var question_ids = []
    var all_questions_loaded = false
    
    var question_id_regex = /question_(\d+)/
    var whitespace_regex = /\s+/
    
    var updates = [
        "#percentages",
        ".percentages",
        ".match.lined",
        ".stats.lined"
    ]
    
    function update_compatability() {
        $.ajax({
            url: core.location.baseurl,
            success: function(data, textStatus, jqXHR) {
                for ( var i = 0, l = updates.length; i < l; i++ ) {
                    var selector = updates[i]
                    var ele = $(data).find(selector)
                    for ( var x = 0; x < ele.length; x++ ) {
                        var remote = $(ele[x])
                        var local = $($(selector)[x])
                        local.html(remote.html())
                    }
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Ajax error in update_compatability() ["+textStatus+"] - "+errorThrown)
            }
        })
    }
    
    function queue_update_compatability() {
        setTimeout(update_compatability, 1000)
    }
    
    function add_question() {
        var id = parseInt(question_id_regex.exec(this.id)[1])
        if ( !(id in questions) ) {
            question_ids.push(id)
            questions[id] = this.outerHTML
        } else {
            console.log("Question "+id+" repeated.")
        }
    }
    
    function update_questions_perform() {
        question_ids.sort(core.sorter.numeric)
        $(".questions").html("")
        
        for ( var i = 0, l = question_ids.length; i < l; i++ ) {
            var id = question_ids[i]
            $(".questions").append(questions[id])
            
            $("#submit_btn_"+id+",#skip_btn_"+id).click(queue_update_compatability)
        }
        
        $(".questions").append("<div class='pages clearfix'></div>")
        
        console.log("Printed "+question_ids.length+" questions.")
        
        all_questions_loaded = true
        if ( searchInput.val().length > 0 )
            perform_search()
    }
    
    function update_questions() {
        var msg = "Sorting questions..."
        if ( question_ids.length > 500 ) msg += "<br />(This may take awhile. If Chrome says this page has become unresponsive, please wait. Other pages that were linked off of this one may also appear unresponsive.)"
        $(".questions").html(msg)
        setTimeout(update_questions_perform, 100)
    }
    
    // -- pages --------------------------------------------------------------------------------------------------------
    
    var pages = $(".pages li")
    if ( pages.length > 0 ) {
        
        var last_page = pages[pages.length-2]
        var last_low = (/low=(\d+)/).exec($(last_page).html())[1]
        var num_per_page = $(".question").length
        
        var tracker = []
        
        function update_progress() {
            var c = 1
            for ( var i = 0, l = tracker.length; i < l; i++ ) {
                if ( tracker[i] != null )
                    c++
            }
            var t = tracker.length+1
            
            $(".questions").html("Loading Page "+c+"/"+t+"...")
            if ( c >= t ) {
                setTimeout(update_questions, 100)
            }
        }
        
        // Queue up all the pages
        for ( var low = num_per_page+1; low <= last_low; low += num_per_page ) {
            var index = tracker.length
            tracker.push(null)
            $.ajax({
                index: index,
                url: core.location.baseurl,
                data: { low: low },
                success: function(data, textStatus, jqXHR) {
                    tracker[this.index || 0] = true
                    $(data).find(".question").each(add_question)
                    update_progress()
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error("Ajax error ["+textStatus+"] - "+errorThrown)
                    tracker[this.index || 0] = false
                    update_progress()
                }
            })
        }
        
        // Add the questions on the current page
        $(".question").each(add_question)
        update_progress()
    } else {
        $(".question").each(add_question)
        update_questions()
    }
    
    // -- search -------------------------------------------------------------------------------------------------------
    
    if ( $(".search").length > 0 ) {
        var search_interval = false
        var search_i = 0
        var query
        var question
        
        function clear_search() {
            if ( search_interval ) {
                search_i = 0
                clearInterval(search_interval)
                search_interval = false
                searchProgress.hide()
                question.css("opacity", 1)
            }
        }
        
        function process_search() {
            if ( search_i >= question.length ) {
                clear_search()
                return
            }
            searchProgress.show()
            searchBar.css("width", Math.ceil((search_i/question.length)*searchProgress.width()))
            var initial_search_i = search_i
            while ( search_i < question.length ) {
                var q = $(question[search_i++])
                var func = 'show'
                var text = q.find(".qtext,.answer_area>label").text().toLowerCase()
                for ( var i = 0, l = query.length; i < l; i++ ) {
                    var match = query[i]
                    if ( text.indexOf(match) == -1 ) {
                        func = 'hide'
                        break
                    }
                }
                if ( func == 'hide' && q.css('display') == 'none' ) {
                } else {
                    q[func]('fast')
                    if ( func == 'show' ) q.animate({opacity: 1}, 'fast')
                    break
                }
                if ( search_i >= initial_search_i+3 ) {
                    break
                }
            }
        }
        
        function show_all() {
            if ( search_i >= question.length ) {
                clear_search()
                return
            }
            var q = $(question[search_i++])
            q.show('fast')
        }
        
        function perform_search() {
            if ( !all_questions_loaded ) return
            
            query = $(".search input").val().trim().toLowerCase().split(whitespace_regex)
            question = $(".question")
            
            clear_search()
            question.css("opacity", 0.5)
            search_interval = setInterval(query.length == 1 && query[0].length == 0 ? show_all : process_search, 10)
        }
        
        var searchBox = $(".search").css("position", "relative")
        var searchInput = searchBox.find("input")
        searchInput.attr("onkeypress", null)
        var old_search_value = searchInput.val()
        searchInput.bind("keyup", function(e) {
            var search_value = searchInput.val()
            if ( search_value != old_search_value ) {
                old_search_value = search_value
                perform_search()
            }
        })
        
        var searchButton = searchBox.find("p.btn a")
        searchButton.parent().hide()
        searchButton.attr("onclick", null)
        searchButton.click(function(e){
            e.preventDefault()
            perform_search()
        })
        
        searchInput.after("<div class='bc__search_progress'><div class='bc__search_progress_bar'></div></div>")
        var searchProgress = searchBox.find(".bc__search_progress")
        var searchBar = searchProgress.find(".bc__search_progress_bar")
        
        searchProgress.css({
            backgroundColor: "white",
            border: "1px solid #DDD",
            bottom: 0,
            display: "none",
            left: 0,
            margin: "0px 12px 5px 12px",
            height: 3,
            position: "absolute",
            right: 0
        })
        
        searchBar.css({
            backgroundColor: "blue",
            height: "100%"
        })
    }
    
    
})
}