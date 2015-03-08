
(function(module) {
  console.log('you-might-like2');
  module.db.get(function(db) {
    console.log(db);
    if ( db.hide ) {
      $("#section_matches").hide();
    }
  });
})(Module.get("you-might-like"));
