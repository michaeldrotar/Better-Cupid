exports = function(arg) {
  var keys, length, result, i, key;
  if ( util.isArrayLike(arg) ) {
    length = arg.length;
    result = new Array(length);
    for ( i = 0; i < length; i++ ) {
      result[i] = arg[i];
    }
    return result;
  } else if ( util.isObject(arg) ) {
    keys = util.keys(arg);
    length = keys.length;
    result = {};
    for ( i = 0; i < length; i++ ) {
      key = keys[i];
      result[key] = arg[key];
    }
    return result;
  }
};
