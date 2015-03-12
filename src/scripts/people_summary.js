core.RegisterLoadingProcess("people_summary", function() {

    if ( document.readyState === "loading" ) return;
    
    var people = ".stalkers,#favorites"
    var person = ".stalker,.favorite"
    var visiblePerson = ".stalker:visible,.favorite:visible"
    
    if ( $(people).length > 0 )
    {
        var filter = {
            "Age": [],
            "Gender": [],
            "Orientation": [],
            "Status": []
        }
        var data = {
            "Age": {
                "Under 20": 0,
                "20-24": 0,
                "25-29": 0,
                "30s": 0,
                "40s": 0,
                "50s": 0,
                "60s and Up": 0
            },
            "Gender": {},
            "Orientation": {},
            "Status": {}
        }
        
        var $people = $(people)
        var asoRegex = /^\s*(\d+)\s*\/\s*(\w+)\s*\/\s*(\w+)\s*\/\s*(\w[\w\s]+\w)\s*$/
        
        $people.find(person).each(function(){
            var $person = $(this)
            var $aso = $person.find(".aso")
            if ( $aso.length == 1 )
            {
                var aso = $aso.text()
                var matches = asoRegex.exec(aso)
                if ( matches && matches.length == 5 )
                {
                    var age = parseInt(matches[1])
                    if ( age < 20 )
                        data.Age["Under 20"]++
                    else if ( age < 25 )
                        data.Age["20-24"]++
                    else if ( age < 30 )
                        data.Age["25-29"]++
                    else if ( age < 40 )
                        data.Age["30s"]++
                    else if ( age < 50 )
                        data.Age["40s"]++
                    else if ( age < 60 )
                        data.Age["50s"]++
                    else
                        data.Age["60s and Up"]++
                    
                    data.Gender[matches[2]] = (data.Gender[matches[2]] || 0) + 1
                    data.Orientation[matches[3]] = (data.Orientation[matches[3]] || 0) + 1
                    data.Status[matches[4]] = (data.Status[matches[4]] || 0) + 1
                }
            }
        })
        
        var output = "<div id=\"bc_people_summary\" style=\"margin: 30px\">"
        
        for ( category in data )
        {
            output += "<div style=\"display: inline-block\"><table style=\"border-collapse: collapse; border: 1px solid #dddddd\"><tr>"
            
            var choiceCount = 0
            for ( choice in data[category] )
                if ( data[category][choice] > 0 )
                    choiceCount++
            
            output += "<th style=\"background-color: #183b62; border: 1px solid #061e38; color: white; padding: 0px 10px\" colspan=\""+choiceCount+"\">"+category+"</th>"
            output += "</tr><tr>"
            
            for ( choice in data[category] )
                if ( data[category][choice] > 0 )
                    output += "<td category=\""+category+"\" choice=\""+choice+"\" class=\"filterChoice\">"+choice+" ("+data[category][choice]+")</td>"
            
            output += "</tr></table></div>"
        }
        
        output += "</div>"
        
        output += "<div style=\"color: #2963a4; font-weight: bold; margin: 10px;\">"
            + "Showing: <span class=\"filterCurrentCount\">"+($(person).length)+"</span>"
            + "<span class=\"filterMaxCount\" style=\"display: none\"> of "+($(person).length)+"</span> People</div>"
        
        output += "<div id=\"bc_people_holder\"></div>"
        
        $(".tabbed_heading").after(output)
        
        var holder = document.getElementById("bc_people_holder");
        holder.appendChild(document.getElementById("main_column"));
        holder.appendChild(document.getElementById("right_bar"));
        var clearfix = document.createElement("div");
        clearfix.setStyle("clear: both");
        clearfix.appendTo(holder);
        
        $(".filterChoice").css({
            "border": "1px solid #183b62",
            "cursor": "pointer",
            "padding": "0px 5px",
            "text-align": "center"
        }).hover(function(){
            $(this).css({
                "background-color": "#cecece"
            })
        }, function(){
            $(this).css({
                "background-color": "#ffffff"
            })
        }).click(function(){
            var $this = $(this)
            $this.attr("selected", ( $this.attr("selected") == "1" ? "0" : "1" ))
            if ( $this.attr("selected") == 1 )
            {
                $this.css({
                    "color": "#f83265"
                })
                filter[$this.attr("category")][$this.attr("choice")] = true
            }
            else
            {
                $this.css({
                    "color": "#555555"
                })
                filter[$this.attr("category")][$this.attr("choice")] = false
            }
            
            $people.find(person).each(function(){
                var $person = $(this)
                var validPerson = true
                
                var $aso = $person.find(".aso")
                if ( $aso.length == 1 )
                {
                    var aso = $aso.text()
                    var matches = asoRegex.exec(aso)
                    
                    if ( matches && matches.length == 5 )
                    {
                        for ( category in filter )
                        {
                            var validCategory = false
                            var validSetting = false
                            for ( choice in filter[category] )
                            {
                                if ( filter[category][choice] == true )
                                {
                                    validCategory = true
                                    
                                    switch ( category )
                                    {
                                        case "Age":
                                            var age = parseInt(matches[1])
                                            
                                            if ( choice == "Under 20" )
                                            {
                                                if ( age < 20 )
                                                    validSetting = true
                                            }
                                            else if ( choice == "20-24" )
                                            {
                                                if ( age >= 20 && age < 25 )
                                                    validSetting = true
                                            }
                                            else if ( choice == "25-29" )
                                            {
                                                if ( age >= 25 && age < 30 )
                                                    validSetting = true
                                            }
                                            else if ( choice == "60s and Up" )
                                            {
                                                if ( age >= 60 )
                                                    validSetting = true
                                            }
                                            else
                                            {
                                                var ageRange = parseInt(choice)
                                                if ( age >= ageRange && age <= (ageRange + 9) )
                                                    validSetting = true
                                            }
                                            break
                                        
                                        case "Gender":
                                            if ( choice == matches[2] )
                                                validSetting = true
                                            break
                                        
                                        case "Orientation":
                                            if ( choice == matches[3] )
                                                validSetting = true
                                            break
                                        
                                        case "Status":
                                            if ( choice == matches[4] )
                                                validSetting = true
                                            break
                                        
                                        default:
                                            debug.error("Unsupported category found in the filter")
                                    }
                                }
                            }
                            if ( validCategory && !validSetting )
                                validPerson = false
                        }
                        
                        $person.css("display", validPerson ? "block" : "none")
                    }
                    else
                    {
                        debug.error("Failed to find a match on: " + aso)
                    }
                }
                else
                {
                    debug.error("Person found, but no data:\n"+$person.text())
                }
            })
            
            var filterSet = false
            for ( category in filter )
                for ( choice in filter[category] )
                    if ( filter[category][choice] == true )
                        filterSet = true
            
            var count = $people.find(visiblePerson).length
            $(".filterCurrentCount").text(count).css( filterSet ? { "color": "#f83265" } : { "color": "inherit" } )
            $(".filterMaxCount").css( filterSet ? { "display": "inline" } : { "display": "none" } )
        })
    }
})