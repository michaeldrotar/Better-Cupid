/**
  Shallow clone an object by coping all of the keys to a new object.

  @param  {Object} arg The object to clone
  @return {Object}     The clone of the object
*/
util.cloneObject = function(arg) {
  var keys = util.keys(arg),
      length = keys.length,
      result = {},
      i, key;
  for ( i = 0; i < length; i++ ) {
    key = keys[i];
    result[key] = arg[key];
  }
  return result;
};
