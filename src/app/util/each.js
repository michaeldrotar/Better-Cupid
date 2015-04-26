util.each = function(arg, callback) {
  var keys, length, result, i, key;
  if ( util.isArrayLike(arg) ) {
    length = arg.length;
    for ( i = 0; i < length; i++ ) {
      result = callback(arg[i], i, arg);
      if ( result !== undefined ) {
        return result;
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
