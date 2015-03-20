(function() {

  /**
    Handles storing and retrieving data, utilizing chrome's local storage APIs.

    @alias bc.db
    @namespace
  */
  var db        = bc.namespace('db'),
      util      = bc.namespace('util'),
      storage   = chrome.storage.local,
      listeners = {
        '': []
      };

  db.get = function() {
    return storage.get.apply(storage, arguments);
  };

  db.set = function(key, value, callback) {
    var obj;
    if ( typeof key === 'object' ) {
      obj = key;
      callback = value;
    } else {
      obj = {};
      obj[key] = value;
    }
    storage.set(obj, callback);
    return db;
  };

  db.remove = function() {
    return storage.remove.apply(storage, arguments);
  };

  db.onChanged = function(key, callback) {
    if ( typeof key === 'function' ) {
      callback = key;
      key = '';
    } else {
      if ( !key || typeof key !== 'string' ) {
        key = '';
      }
    }
    listeners[key] = listeners[key] || [];
    listeners[key].push(callback);
  };

  db.unChanged = function(key, callback) {
    var index;
    if ( typeof key === 'function' ) {
      callback = key;
      key = '';
    } else {
      if ( !key || typeof key !== 'string' ) {
        key = '';
      }
    }
    if ( listeners[key] ) {
      index = listeners[key].indexOf(callback);
      if ( index >= 0 ) {
        listeners[key].splice(index, 1);
      }
    }
  }

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if ( namespace === 'local' ) {
      util.forEach(changes, function(value, key) {
        var callbacks = util.concat(listeners[key] || [], listeners['']);
        util.forEach(callbacks, function(callback) {
          try {
            callback(key, value);
          } catch ( err ) {
            console.error(err);
          }
        });
      });
    }
  });


})();
