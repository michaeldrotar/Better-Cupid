/**
  Shallow clone an array or array-like object

  @param  {Array} arg The array to clone
  @return {Array}     The clone of the array
*/
util.cloneArray = function(arg) {
  var length = arg.length,
      result = new Array(length),
      i;
  for ( i = 0; i < length; i++ ) {
    result[i] = arg[i];
  }
  return result;
};
