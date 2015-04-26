util.reduce = function(arg, callback, initial) {
  var index = 0, length, key, keys;
  if ( util.isArrayLike(arg) ) {
    if ( arguments.length < 3 ) {
      initial = arg[0];
      index = 1;
    }
    length = arg.length;
    for ( ; index < length; index++ ) {
      initial = callback(initial, arg[index], index, arg);
    }
  } else if ( util.isObject(arg) ) {
    keys = util.keys(arg);
    if ( arguments.length < 3 && keys.length ) {
      initial = arg[keys[0]];
      index = 1;
    }
    length = keys.length;
    for ( ; index < length; index++ ) {
      key = keys[index];
      initial = callback(initial, arg[key], key, arg);
    }
  }
  return initial;
};
