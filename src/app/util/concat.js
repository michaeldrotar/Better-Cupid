/**
  Concatenate any number of arguments together into a single array.

  @param  {...Array} arg The arrays and values to concatenate
  @return {Array}        The resulting array
*/
util.concat = function() {
  var length = arguments.length,
      result = [],
      i, arg, argLength, x;
  for ( i = 0; i < length; i++ ) {
    arg = arguments[i];
    if ( util.isArray(arg) ) {
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
