exports = function(arg) {
  var keys, result, i, key;
  if ( util.isArrayLike(arg) ) {
    return arg.length === 0;
  } else if ( util.isObject(arg) ) {
    for ( key in arg ) {
      if ( arg.hasOwnProperty(key) ) {
        return false;
      }
    }
    return true;
  }
};
