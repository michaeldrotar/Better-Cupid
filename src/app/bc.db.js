(function() {

  /**
    Handles storing and retrieving data, utilizing chrome's local storage APIs.

    @alias bc.db
    @namespace
  */
  var db       = bc.namespace('db'),
      util     = bc.namespace('util'),
      storage  = chrome.storage.local,
      handlers = {
        '': []
      };

  /**
    Retrieves data from storage.

    @param {string|string[]} [key]    A single key or array of keys.
                                      If not given, all keys are passed.
    @param {Function}        callback The function to pass the data to.
                                      Takes the form function(data),
                                      where data is an object with the
                                      aforementioned key(s) populated.
  */
  db.get = function() {
    return storage.get.apply(storage, arguments);
  };

  /**
    Sets a value in storage.

    @param {string|object} key      If given a string, sets the value
                                    parameter as the value of the given key.
                                    Otherwise, must be an object of key/value
                                    pairs to store.
    @param {*}             [value]  The value of the string key to set.
    @param {Function}      callback The function to call once the data is set.
  */
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

  /**
    Removes a key from storage.

    @param {string|string[]} key      The key(s) to remove from storage.
    @param {Function}        callback The function to call once its done.
  */
  db.remove = function() {
    return storage.remove.apply(storage, arguments);
  };

  /**
    Attaches an event handler that will be called any time the value
    of the given key is changed. If key is not given, the handler will be
    called whenever any key's value is changed.

    @param {String}   key     The key to monitor for changes
    @param {Function} handler The event handler function to call. Takes the
                              form function(key, value) where key is the
                              changed key and value is an object with old
                              and new properties representing the previous
                              and current value.
  */
  db.onChanged = function(key, handler) {
    if ( typeof key === 'function' ) {
      handler = key;
      key = '';
    } else {
      if ( !key || typeof key !== 'string' ) {
        key = '';
      }
    }
    handlers[key] = handlers[key] || [];
    handlers[key].push(handler);
  };

  /**
    Removes an event handler. Must be called with the same key and handler
    that were passed to the `onChanged` method.

    @param {String}   key     The key that the handler was registered under.
    @param {Function} handler The handler that was registered with `onChanged`.
  */
  db.unChanged = function(key, handler) {
    var index;
    if ( typeof key === 'function' ) {
      handler = key;
      key = '';
    } else {
      if ( !key || typeof key !== 'string' ) {
        key = '';
      }
    }
    if ( handlers[key] ) {
      index = handlers[key].indexOf(handler);
      if ( index >= 0 ) {
        handlers[key].splice(index, 1);
      }
    }
  }

  // Always monitor for any changes and propagate out the events to
  // their handlers, if any.
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if ( namespace === 'local' ) {
      util.forEach(changes, function(value, key) {
        var all = util.concat(handlers[key] || [], handlers['']);
        util.forEach(all, function(handler) {
          try {
            handler(key, value);
          } catch ( err ) {
            console.error(err);
          }
        });
      });
    }
  });


})();
