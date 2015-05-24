exports = function() {
  var length = arguments.length,
      result = [],
      i, arg, argLength, x;
  for ( i = 0; i < length; i++ ) {
    arg = arguments[i];
    if ( util.isArrayLike(arg) ) {
      argLength = arg.length;
      for ( x = 0; x < argLength; x++ ) {
        result.push(arg[x]);
      }
    } else {
      result.push(arg);
    }
  }
  return result;
};
