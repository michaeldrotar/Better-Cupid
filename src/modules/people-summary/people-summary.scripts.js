bc.Module.run('people-summary', function(module) {
  var people = $(".user_row_item");

  if ( people.length ) {
    (function() {
      var filter = {
          Age: {},
          Gender: {},
          Orientation: {},
          Status: {}
        },
        data = {
          Age: {
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
        },
        regex = {
          aso: /^\s*(\d+)\s*\/\s*(\w+)\s*\/\s*(\w+)\s*\/\s*(\w.+[^\s])\s*$/
        },
        summary = $("<div id='people-summary'></div>");

      people.each(function() {
        var aso = regex.aso.exec($(this).find(".aso").text()),
          age, gender, orientation, status;

        if ( aso && aso.length === 5 ) {
          age = parseInt(aso[1]);
          gender = aso[2];
          orientation = aso[3];
          status = aso[4];

          if ( age < 20 ) {
            data.Age["Under 20"]++;
          } else if ( age < 25 ) {
            data.Age["20-24"]++;
          } else if ( age < 30 ) {
            data.Age["25-29"]++;
          } else if ( age < 40 ) {
            data.Age["30s"]++;
          } else if ( age < 50 ) {
            data.Age["40s"]++;
          } else if ( age < 60 ) {
            data.Age["50s"]++;
          } else {
            data.Age["60s and Up"]++;
          }

          data.Gender[gender] = (data.Gender[gender] || 0) + 1;
          data.Orientation[orientation] = (data.Orientation[orientation] || 0) + 1;
          data.Status[status] = (data.Status[status] || 0) + 1;
        }
      });

      $.each(data, function(category, choices) {
        var choiceCount = 0,
          html ="";

        $.each(choices, function(choice, count) {
          if ( count > 0 ) {
            choiceCount++;
            html += "<td class='filter-choice' data-category='"+category+"' data-choice='"+choice+"'>" +
                  choice+" ("+count+")" +
                "</td>";
          }
        });

        summary.append(
          "<div class='category-summary'>" +
            "<table>" +
              "<tr><th colspan='"+choiceCount+"'>"+category+"</th></tr>" +
              "<tr>" +
                html +
              "</tr>" +
            "</table>" +
          "</div>"
        );

      });

      summary.append(
        "<div id='people-counts'>" +
          "Showing: " +
          "<span class='current'><span class='number'>" +
            people.length +
          "</span></span>" +
          " " +
          "<span class='max'>" +
            "of " +
            "<span class='number'>" +
              people.length +
            "</span>" +
          "</span>" +
          " People" +
        "</div>"
      );

      $(".tabbed_heading").after(summary);

      summary.find(".filter-choice").click(function() {
        var choice = $(this);
        choice.toggleClass("active");
        filter[choice.attr("data-category")][choice.attr("data-choice")] = choice.hasClass("active");
        applyFilters();
      });

      function applyFilters() {
        var filtered = false;

        people.each(function() {
          var person = $(this),
            aso = regex.aso.exec(person.find(".aso").text()),
            valid = true;

          if ( aso && aso.length === 5 ) {
            $.each(filter, function(category, choices) {
              var validCategory = false,
                validSetting = false,
                age = parseInt(aso[1]),
                setting = {
                  "Gender": aso[2],
                  "Orientation": aso[3],
                  "Status": aso[4]
                };

              $.each(choices, function(choice, enabled) {
                if ( enabled && !validSetting ) {
                  // If one choice is enabled then this category is valid and results are filtered
                  validCategory = true;
                  filtered = true;

                  switch ( category ) {
                    case "Age":
                      validSetting =
                        (choice === "Under 20" && age < 20 ) ||
                        (choice === "20-24" && age >= 20 && age < 25) ||
                        (choice === "25-29" && age >= 25 && age < 30) ||
                        (choice === "30s" && age >= 30 && age < 40) ||
                        (choice === "40s" && age >= 40 && age < 50) ||
                        (choice === "50s" && age >= 50 && age < 60) ||
                        (choice === "60s and Up" && age >= 60 );
                      break;

                    default:
                      validSetting = choice === setting[category];
                      break;

                  }
                }
              });

              if ( validCategory && !validSetting ) {
                valid = false;
              }
            });
          } else {
            valid = false;
          }

          person.css("display", valid ? "block" : "none");
        });

        if ( !filtered ) {
          people.show();
        }

        summary.find(".current .number").text(people.filter(":visible").length);
        summary.find(".current,.max")[(filtered ? "add" : "remove")+"Class"]("filtered");
      }

    })();
  }
});
