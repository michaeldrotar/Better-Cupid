function UtilArray(arg) {
  if ( this instanceof UtilArray === true ) {
    return UtilArray(arg);
  }

  var self = [];
  if ( util.isArrayLike(arg) ) {
    util.extend(self, arg);
  }

  var k;
  for ( k in UtilArray.prototype ) {
    self[k] = UtilArray.prototype[k].bind(self);
  }

  return self;
}

UtilArray.prototype = {
  clone: function() {
    return UtilArray(util.clone(this));
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
    return util.each.apply(window, args);
  },
  hasKeys: function() {
    return util.hasKeys(this);
  },
  keys: function() {
    return util.keys(this);
  },
  map: function() {
    var args = util.clone(arguments);
    args.unshift(this);
    return util.array(util.map.apply(window, args));
  },
  reduce: function() {
    var args = util.clone(arguments);
    args.unshift(this);
    return util.reduce.apply(window, args);
  },
  reverse: function() {
    return util.array(util.reverse(this));
  },
  toArray: function() {
    return this.reduce(function(arr, value, index) {
      arr[index] = value;
      return arr;
    }, []);
  }
};

util.array = function(arg) {
  return UtilArray(arg);
};
