Module.get('you-might-like').then(function(module) {
  var db = module.db.get();
  if ( db.hide ) {
    $("#section_matches").hide();
  }
});