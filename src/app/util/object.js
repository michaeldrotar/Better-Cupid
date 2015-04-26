function UtilObject(arg) {
  if ( this instanceof UtilObject === false ) {
    return new UtilObject(arg);
  }

  if ( util.isObject(arg) ) {
    util.extend(this, arg);
  }
  return this;
}

UtilObject.prototype = {
  clone: function() {
    return util.object(util.clone(this));
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
  each: function() {
    var args = util.clone(arguments);
    args.unshift(this);
    return util.each.apply(window, args);
  },
  filter: function() {
    var args = util.clone(arguments);
    args.unshift(this);
    return util.filter.apply(window, args);
  },
  hasKeys: function() {
    return util.hasKeys(this);
  },
  keys: function() {
    return util.array(util.keys(this));
  },
  map: function() {
    var args = util.clone(arguments);
    args.unshift(this);
    return util.object(util.map.apply(window, args));
  },
  reduce: function() {
    var args = util.clone(arguments);
    args.unshift(this);
    return util.reduce.apply(window, args);
  },
  toObject: function() {
    return this.reduce(function(obj, value, key) {
      obj[key] = value;
      return obj;
    }, {});
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
