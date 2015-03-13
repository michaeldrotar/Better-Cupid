Module.run('recently-visited', function(module, db) {
  var recentlyVisited = document.getElementById("section_recent"),
      maxItemCount = db.maxRowCount * 4,
      visRowCount = db.visibleRowCount,
      visitLog = db.recentlyVisited || [],
      items = recentlyVisited && recentlyVisited.getElementsByTagName("li"),
      itemHeight = items && items.length && items[0].getHeight("outer"),
      visHeight = itemHeight && Math.floor((visRowCount * itemHeight) + (itemHeight / 3)),
      list, min;
  
  if ( !recentlyVisited ) return;
  
  items.reverseForEach(function(item) {
    var visit = {
      url: item.getElementByTagName("a").href,
      image: item.getElementByTagName("img").src
    };
    visitLog.reverseForEach(function(logItem, index, log) {
      if ( logItem.url === visit.url ) {
        log.splice(index, 1);
      }
    });
    visitLog.splice(0, 0, visit);
  });
  
  while ( visitLog.length > 1000 ) {
    visitLog.pop();
  }
  
  module.db.set("recentlyVisited", visitLog);
  
  if ( visRowCount === 0 || visitLog.length === 0 ) {
    recentlyVisited.style.display = "none";
    return;
  }
  
  list = recentlyVisited.getElementByTagName("ul");
  min = Math.min(visitLog.length, maxItemCount);
  
  list.innerHTML = "";
  
  visitLog.forEach(function(visit, index, log) {
    if ( index < min ) {
      var li = document.createElement("li"),
        a = document.createElement("a"),
        img = document.createElement("img");
        
      li.appendTo(list);
      
      a.href = visit.url;
      a.appendTo(li);
      
      img.src = visit.image;
      img.border = 0;
      img.width = 40;
      img.height = 40;
      img.appendTo(a);
    }
  });
  
  if ( list.getHeight() > visHeight ) {
    var holder = document.createElement("div");
    holder.insertAbove(list);
    list.appendTo(holder);
    
    holder.setStyle({
      height: visHeight+"px",
      overflow: "hidden",
      position: "relative"
    });
    list.setStyle("position", "absolute");
    
    holder.addEventListener("mousewheel", function(e) {
      var dir = e.wheelDelta > 0 ? 1 : -1,
        change = dir * Math.ceil(holder.getHeight() * 2/3),
        height = list.getHeight("outer"),
        area = height - holder.getHeight(),
        top = list.getTop(holder),
        newTop = top + change,
        marginTop = parseInt(list.getCssStyle("margin-top")),
        marginBottom = parseInt(list.getCssStyle("margin-bottom"));
      
      if ( dir > 0 && top === marginTop ) return;
      if ( dir < 0 && top - marginTop - marginBottom === -area ) return;
      if ( newTop > 0 ) {
        newTop = 0;
      } else if ( newTop < -area ) {
        newTop = -area;
      }
      
      list.setStyle("top", newTop+"px");
      e.stopPropagation();
      e.preventDefault();
    });
  }
});