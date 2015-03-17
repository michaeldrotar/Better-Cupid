/**
  Iterates each key of the object, calling the callback once per key.
  If the callback returns a value, the iteration will immediately stop
  and the value will be returned.
  Assumes the object's keys will not be changed by the callback.

  @param  {Object}   arg      The object whose keys will be iterated
  @param  {Function} callback The function to call on each iteration, takes
                              the form function(value, key, object)
  @return {*}                 The first value returned by the callback, if any
*/
util.forEachObject = function(arg, callback) {
  var keys = util.keys(arg),
      length = keys.length,
      key, i, result;
  for ( i = 0; i < length; i++ ) {
    key = keys[i];
    result = callback(arg[key], key, arg);
    if ( result !== undefined ) {
      return result;
    }
  }
};
