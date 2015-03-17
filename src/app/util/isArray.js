/**
  Returns true if the given argument is an array.

  @method
  @param  {*}       arg The array to check
  @return {boolean}
*/
util.isArray = Array.isArray || function(arg) {
  return arg instanceof Array;
};
