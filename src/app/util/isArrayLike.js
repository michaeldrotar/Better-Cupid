util.isArrayLike = function(arg) {
  if ( util.isObject(arg) ) {
    if ( typeof arg.length === 'number' ) {
      return true;
    }
  }
}
