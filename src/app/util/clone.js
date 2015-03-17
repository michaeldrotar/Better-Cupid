/**
  Clone an array or object.

  @param  {Object} arg The object to clone
  @return {Object}     The clone of the object
*/
util.clone = function(arg) {
  if ( util.isArray(arg) ) {
    return util.cloneArray(arg);
  }
  return util.cloneObject(arg);
};
