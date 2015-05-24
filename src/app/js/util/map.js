exports = function(arg, callback) {
  var index = 0, length, key, keys, result;
  if ( util.isArrayLike(arg) ) {
    result = [];
    length = arg.length;
    for ( ; index < length; index++ ) {
      result.push(callback(arg[index], index, arg));
    }
  } else if ( util.isObject(arg) ) {
    result = {};
    keys = util.keys(arg);
    length = keys.length;
    for ( ; index < length; index++ ) {
      key = keys[index];
      result[key] = callback(arg[key], key, arg);
    }
  }
  return result;
};
