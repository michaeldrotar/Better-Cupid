include(['/lib/jquery/*.js', '/lib/**/*.js']);

(function() {

bc = window.bc = {};

var util = bc.util = requirejs('util/util.js');
bc.error    = requirejs('error.js');
bc.lang     = requirejs('lang.js');
bc.location = requirejs('location.js');
bc.http     = requirejs('http.js');
bc.db       = requirejs('db.js');
bc.manifest = requirejs('manifest.js');
bc.template = requirejs('template.js');
bc.Module   = requirejs('module/module.js');

})();
