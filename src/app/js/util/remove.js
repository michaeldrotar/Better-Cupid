exports = function(arg, callback) {
  var index = 0, length, value, key, keys, result;
  if ( util.isArrayLike(arg) ) {
    result = [];
    length = arg.length;
    for ( ; index < length; index++ ) {
      value = arg[index];
      if ( !callback(value, index, arg) ) {
        result.push(value);
      }
    }
  } else if ( util.isObject(arg) ) {
    result = {};
    keys = util.keys(arg);
    length = keys.length;
    for ( ; index < length; index++ ) {
      key = keys[index];
      value = arg[key];
      if ( !callback(value, key, arg) ) {
        result[key] = value;
      }
    }
  }
  return result;
};
