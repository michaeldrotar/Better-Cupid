// @if DEV
include(['/lib/jquery/*.js', '/lib/**/*.js', '!/lib/**/*.min.js', '!/lib/livejs/**']);
// @endif
// @if !DEV
include('/lib/jquery/jquery*.min.js');
include('/lib/knockout/knockout*.min.js');
include('/lib/drawer/*.js');
// @endif

(function() {

bc = window.bc = {};

var util = bc.util = requirejs('util/util.js');
bc.lang     = requirejs('lang.js');
bc.location = requirejs('location.js');
bc.db       = requirejs('db.js');
bc.manifest = requirejs('manifest.js');
bc.template = requirejs('template.js');
bc.Module   = requirejs('module/module.js');

})();
