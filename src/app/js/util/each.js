exports = function(arg, callback) {
  var keys, length, result, i, key, start, stop, step;
  if ( util.isArrayLike(arg) ) {
    length = arg.length;
    if ( length === 0 ) {
      return;
    }
    start = 0;
    stop = length - 1;
    step = 1;
    if ( typeof callback === 'number' ) {
      start = callback;
      callback = arguments[2];
      if ( start < 0 ) {
        start = length + start;
        stop = 0;
      }
      if ( start < 0 ) {
        start = 0;
        stop = length - 1;
      }
    }
    if ( typeof callback === 'number' ) {
      stop = callback;
      if ( stop > length - 1 ) {
        stop = length - 1;
      }
      callback = arguments[3];
    }
    if ( typeof callback === 'number' ) {
      step = callback;
      callback = arguments[4];
    }
    step = Math.abs(step);
    if ( start > stop ) {
      for ( i = start; i >= stop; i -= step ) {
        result = callback(arg[i], i, arg);
        if ( result !== undefined ) {
          return result;
        }
      }
    } else {
      for ( i = start; i <= stop; i += step ) {
        result = callback(arg[i], i, arg);
        if ( result !== undefined ) {
          return result;
        }
      }
    }
  } else if ( util.isObject(arg) ) {
    keys = util.keys(arg);
    length = keys.length;
    for ( i = 0; i < length; i++ ) {
      key = keys[i];
      result = callback(arg[key], key, arg);
      if ( result !== undefined ) {
        return result;
      }
    }
  }
};
