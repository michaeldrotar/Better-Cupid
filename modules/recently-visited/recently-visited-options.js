(function(module) {
  var visRow = $("#recently-visited_visibleRowCount"),
    maxRow = $("#recently-visited_maxRowCount"),
    rowSlider = $("#row-count-slider"),
    min = 0,
    max = 250,
    lastVisVal = module.db.get("visibleRowCount"),
    lastMaxVal = module.db.get("maxRowCount");
  
  rowSlider.slider({
    range: true,
    min: min,
    max: max,
    values: [ lastVisVal, lastMaxVal ],
    slide: function(event, ui) {
      visRow.val(ui.values[0]);
      maxRow.val(ui.values[1]);
    },
    change: function(event, ui) {
      if ( lastVisVal !== ui.values[0] ) {
        lastVisVal = ui.values[0];
        visRow.val(lastVisVal);
        if ( event.originalEvent ) {
          visRow.change();
        }
      }
      if ( lastMaxVal !== ui.values[1] ) {
        lastMaxVal = ui.values[1];
        maxRow.val(lastMaxVal);
        if ( event.originalEvent ) {
          maxRow.change();
        }
      }
    }
  });
  
  visRow.change(function(e) {
    var visVal = visRow.val(),
      maxVal = maxRow.val();
    visVal = parseInt(visVal);
    if ( visVal !== lastVisVal ) {
      if ( !isNaN(visVal) && visVal >= min && visVal <= maxVal ) {
        rowSlider.slider("values", 0, visVal);
      } else {
        visRow.val(lastVisVal);
        e.stopPropagation();
        e.preventDefault();
      }
    }
  });
  
  maxRow.change(function(e) {
    var visVal = visRow.val(),
      maxVal = maxRow.val();
    maxVal = parseInt(maxVal);
    if ( maxVal !== lastMaxVal ) {
      if ( !isNaN(maxVal) && maxVal >= visVal && maxVal <= max ) {
        rowSlider.slider("values", 1, maxVal);
      } else {
        maxRow.val(lastMaxVal);
        e.stopPropagation();
        e.preventDefault();
      }
    }
  });
  
})(Module.get("recently-visited"));