/**
  Iterates each index of the array, calling the callback once per index.
  If the callback returns a value, the iteration will immediately stop
  and the value will be returned.
  Assumes the array indexes will not be changed by the callback.

  @param  {Array}    arg      The array to iterate over
  @param  {Function} callback The function to call on each iteration, takes
                              the form function(value, index, array)
  @return {*}                 The first value returned by the callback, if any
*/
util.forEachArray = function(arg, callback) {
  var length = arg.length,
      i, result;
  for ( i = 0; i < length; i++ ) {
    result = callback(arg[i], i, arg);
    if ( result !== undefined ) {
      return result;
    }
  }
};
