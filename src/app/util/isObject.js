/**
  Returns true if the given argument is an object and not null.

  @param  {*}       arg The object to check
  @return {boolean}
*/
util.isObject = function(arg) {
  return arg && typeof arg === 'object';
};
