var hasOwnProperty = Object.prototype.hasOwnProperty,
    getKeys = Object.keys;

function UtilObject(arg) {
  if ( this instanceof UtilObject === false ) {
    return new UtilObject(arg);
  }

  var key;
  if ( util.isObject(arg) ) {
    for ( key in arg ) {
      if ( hasOwnProperty.call(arg, key) ) {
        this[key] = arg[key];
      }
    }
  }

  return this;
}

UtilObject.prototype = {
  clone: function() {
    return util.object(this);
  },
  extend: function(deep) {
    var args = util.clone(arguments);
    if ( typeof deep === 'boolean' ) {
      args.shift();
    } else {
      deep = false;
    }
    args.unshift(this);
    args.unshift(deep);
    util.extend.apply(window, args);
    return this;
  },
  each: function(callback) {
    var keys = getKeys(this),
        index = keys.length - 1,
        key,
        result;
    for ( ; index >= 0; index-- ) {
      key = keys[index];
      result = callback(this[key], key, this);
      if ( result !== undefined ) {
        return result;
      }
    }
  },
  filter: function(callback) {
    var keys = getKeys(this),
        index = keys.length - 1,
        key;
    for ( ; index >= 0; index-- ) {
      key = keys[index];
      if ( !callback(this[key], key, this) ) {
        delete this[key];
      }
    }
  },
  hasKeys: function() {
    var key;
    for ( key in this ) {
      if ( hasOwnProperty.call(this, key) ) {
        return true;
      }
    }
    return false;
  },
  keys: function() {
    return getKeys(this);
  },
  map: function(callback) {
    var keys = getKeys(this),
        index = keys.length - 1,
        key;
    for ( ; index >= 0; index-- ) {
      key = keys[index];
      this[key] = callback(this[key], key, this);
    }
    return this;
  },
  reduce: function(callback, value) {
    var keys = getKeys(this),
        index = keys.length - 1,
        key;
    if ( arguments.length < 2 ) {
      value = this[keys[index]];
      index--;
    }
    for ( ; index >= 0; index-- ) {
      key = keys[index];
      value = callback(value, this[key], key, this);
    }
    return value;
  },
  toObject: function() {
    return this.reduce(function(obj, value, key) {
      obj[key] = value;
      return obj;
    }, {});
  },
  values: function() {
    var keys = getKeys(this),
        length = keys.length,
        index = length - 1,
        result = new Array(length);
    for ( ; index >= 0; index-- ) {
      result[index] = this[keys[index]];
    }
    return result;
  }
};

(function() {
  var k;
  for ( k in Object.prototype ) {
    if ( UtilObject.prototype[k] === 'undefined' ) {
      UtilObject.prototype[k] = Object.prototype[k];
    }
  }
})();

util.object = function(arg) {
  return new UtilObject(arg);
};
