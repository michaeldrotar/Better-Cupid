function UtilArray(arg) {
  if ( this instanceof UtilArray === true ) {
    return UtilArray(arg);
  }

  var self,
      index,
      k;

  if ( util.isArrayLike(arg) ) {
    self = new Array(arg.length);
    for ( index = arg.length - 1; index >= 0; index-- ) {
      self[index] = arg[index];
    }
  } else {
    self = [];
  }

  for ( k in UtilArray.prototype ) {
    self[k] = UtilArray.prototype[k].bind(self);
  }

  return self;
}

UtilArray.prototype = {
  clone: function() {
    return util.array(this);
  },
  concat: function() {
    var length = arguments.length,
        index, arg, innerLength, innerIndex;
    for ( index = 0; index < length; index++ ) {
      arg = arguments[index];
      if ( util.isArrayLike(arg) ) {
        innerLength = arg.length;
        for ( innerIndex = 0; innerIndex < innerLength; innerIndex++ ) {
          this.push(arg[innerIndex]);
        }
      } else {
        this.push(arg);
      }
    }
    return this;
  },
  each: function(callback) {
    var length = this.length,
        index,
        result;
    for ( index = 0; index < length; index++ ) {
      result = callback(this[index], index, this);
      if ( result !== undefined ) {
        return result;
      }
    }
  },
  every: function(callback) {
    var index = this.length - 1;
    for ( ; index >= 0; index-- ) {
      if ( !callback(this[index], index, this) ) {
        return false;
      }
    }
    return true;
  },
  filter: function(callback) {
    var index;
    for ( index = this.length - 1; index >= 0; index-- ) {
      if ( !callback(this[index], index, this) ) {
        this.splice(index, 1);
      }
    }
    return this;
  },
  hasKeys: function() {
    return this.length > 0;
  },
  indexOf: function(item, index) {
    var length = this.length;
    index = index || 0;
    if ( index < 0 ) {
      index = length + index;
      if ( index < 0 ) {
        index = 0;
      }
    }
    for ( ; index < length; index++ ) {
      if ( this[index] === target ) {
        return index;
      }
    }
    return -1;
  },
  keys: function() {
    var keys = [],
        index = this.length - 1;
    for ( ; index >= 0; index-- ) {
      keys.unshift(index);
    }
    return keys;
  },
  map: function(callback) {
    var index = this.length - 1;
    for ( ; index >= 0; index-- ) {
      this[i] = callback(this[i], i, this);
    }
    return this;
  },
  reduce: function(callback, value) {
    var length = this.length,
        index = 0;
    if ( arguments.length < 2 ) {
      index = 1;
      value = this[0];
    }
    for ( ; index < length; index++ ) {
      value = callback(value, this[index], index, this);
    }
    return value;
  },
  some: function(callback) {
    var index = this.length - 1;
    for ( ; index >= 0; index-- ) {
      if ( callback(this[i], i, this) ) {
        return true;
      }
    }
    return false;
  },
  toArray: function() {
    return this.reduce(function(arr, value, index) {
      arr[index] = value;
      return arr;
    }, new Array(this.length));
  },
  unique: function() {
    var index = this.length - 1,
        seen = [],
        value;
    for ( ; index >= 0; index-- ) {
      value = this[index];
      if ( seen.indexOf(value) > -1 ) {
        this.splice(index, 1);
      }
      seen.push(value);
    }
    return this;
  }
};

util.array = function(arg) {
  return UtilArray(arg);
};
