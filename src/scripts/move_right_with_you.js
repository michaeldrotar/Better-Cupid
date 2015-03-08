(function(){

var movers = [],
  movers_interval = false;

function move(sidebar, scroll_top, win_height, instant) {
  var min = parseInt(sidebar.getAttribute("data-bc-min")) || 0,
    last_y = parseInt(sidebar.getAttribute("data-bc-y")) || min,
    target_y = scroll_top;
  if ( target_y < min ) target_y = min;
  
  var size = sidebar.getSize(),
    boundaries = sidebar.getBoundaries();
  
  if ( size.height > win_height ) {
    if ( scroll_top >= boundaries.top && scroll_top <= boundaries.bottom - win_height ) return;
    
    if ( target_y > last_y ) {
      target_y -= (size.height - win_height);
    }
  }
  
  var container_top = sidebar.parentNode.getTop();
  var container_height = sidebar.parentNode.getHeight();
  if ( target_y + size.height > container_top + container_height ) {
    target_y = (container_height - size.height) + container_top;
  }
  
  if ( target_y < min ) {
    target_y = min;
  }
  
  if ( instant === true ) {
    $(sidebar).clearQueue().stop().css("top", target_y - sidebar.getParent().getTop());
  } else {
    $(sidebar).clearQueue().stop().animate({top: target_y - sidebar.getParent().getTop()}, 'slow', 'linear');
  }
  sidebar.setAttribute("data-bc-y", target_y);
  
}

function move_all(force, instant) {
  var last_scroll_top = parseInt(document.body.getAttribute("data-bc-scrollTop")) || 0,
    last_win_height = parseInt(document.body.getAttribute("data-bc-winHeight")) || 0,
    last_top_offset = parseInt(document.body.getAttribute("data-bc-topOffset")) || 0,
    scroll_top = document.body.scrollTop,
    win_height = window.innerHeight;
  
  var top_offset = 0,
    topper = document.getElementById("action_bar");
  if ( topper && (topper.hasClass("active") || topper.css("display") != "none") ) {
    top_offset = topper.getHeight();
  }
  
  if ( force !== true ) {
    if ( scroll_top === last_scroll_top && win_height === last_win_height && top_offset === last_top_offset ) {
      return;
    }
  }
  document.body.setAttribute("data-bc-scrollTop", scroll_top);
  document.body.setAttribute("data-bc-winHeight", win_height);
  document.body.setAttribute("data-bc-topOffset", top_offset);
  
  for ( var i = 0, l = movers.length; i < l; i++ ) {
    move(movers[i], scroll_top+top_offset, win_height-top_offset, instant);
  }
}

var running = false;
function check_min() {
  if ( running ) return;
  running = true;
  var change = false;
  for ( var i = 0, l = movers.length; i < l; i++ ) {
    var mover = movers[i];
    
    mover.setStyle("position", "initial");
    var new_min = mover.getTop();
    mover.setStyle("position", "absolute");
    
    var cur_min = parseInt(mover.getAttribute("data-bc-min"));
    if ( new_min > 0 && new_min !== cur_min ) {
      mover.setAttribute("data-bc-min", new_min);
      change = true;
    }
  }
  if ( change ) {
    move_all(true, true);
  }
  running = false;
}

core.RegisterLoadingProcess("move_right_with_you", function(){
  document.querySelectorAll("div.right,.tab_content_nav,#right_column,#right_bar").forEach(function(sidebar) {
    core.ProcessElement(sidebar, function() {
      this.setStyle({
        left: this.getLeft(this.getParent()),
        margin: 0,
        position: "absolute",
        top: this.getTop(this.getParent())
      });
      this.setAttribute("data-bc-min", this.getTop());
      sidebar.parentNode.setStyle("min-height", sidebar.getHeight()*3);
      movers.push(this);
      core.info("Mover {0} registered", this.id);
    })
  })
  if ( movers.length > 0 && !movers_interval ) {
    movers_interval = setInterval(move_all, 100);
    window.addEventListener("DOMSubtreeModified", check_min, false);
  }
})

})();
