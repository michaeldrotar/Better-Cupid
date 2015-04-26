/**
  Iterates over the given object or array.
  If the callback returns a value, the iteration will immediately stop
  and the value will be returned.
  Assumes the object's keys or array's indexes will not be changed by the
  callback;

  @param  {Object}   arg      The object or array to iterate
  @param  {Function} callback The function to call on each iteration, takes
                              the form function(value, key|index, object)
  @return {*}                 The first value returned by the callback, if any
*/
util.forEach = function(arg, callback) {
  if ( util.isArray(arg) ) {
    return util.forEachArray(arg, callback);
  } else if ( util.isObject(arg) ) {
    return util.forEachObject(arg, callback);
  }
};
