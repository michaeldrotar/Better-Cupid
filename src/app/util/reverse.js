util.reverse = function(arg) {
  var index = 0, result;
  if ( util.isArrayLike(arg) ) {
    result = [];
    for ( index = arg.length - 1; index >= 0; index-- ) {
      result.push(arg[index]);
    }
  }
  return result;
};
