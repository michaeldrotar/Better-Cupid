(function() {
  /**
    Provides the manifest and module data.
  */
  var loc  = bc.namespace('location'),
      util = bc.namespace('util'),
      i18n = chrome.i18n,
      callbacks = [],
      manifest;

  bc.manifest = function(callback) {
    var request, getManifest;

    if ( manifest ) {
      callback(manifest);
    } else {
      callbacks.push(callback);
      if ( callbacks.length === 1 ) {
        request = {
          url: loc.getResourcePath('/manifest.json'),
          dataType: 'json',
          success: function(temp_manifest, status, xhr) {
            request.url = loc.getResourcePath('/modules.json');
            request.success = function(modules, status, xhr) {
              temp_manifest.modules = modules;
              manifest = temp_manifest;
              callbacks.forEach(function(callback) {
                try {
                  callback(manifest);
                } catch ( err ) {
                  console.error(err);
                }
              });
              callbacks = null;
            };
            getManifest();
          },
          error: function(xhr, status, message) {
            setTimeout(getManifest, 100);
          }
        };
        getManifest = function() {
          bc.http(request);
        };
        getManifest();
      }
    }
  };

})();
