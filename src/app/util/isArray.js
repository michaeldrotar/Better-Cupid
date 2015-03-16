/**
  Returns true if the given argument is an array.

  @param arg {*}
  @return {boolean}
*/
bc.isArray = Array.isArray || function(arg) {
  return arg instanceof Array;
};
