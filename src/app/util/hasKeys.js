util.hasKeys = (function() {
  var hasOwnProperty = Object.hasOwnProperty;
  return function(arg) {
    var key;
    if ( util.isArrayLike(arg) ) {
      return arg.length > 0;
    } else if ( util.isObject(arg) ) {
      for ( key in arg ) {
        if ( hasOwnProperty.call(arg, key) ) {
          return true;
        }
      }
    }
    return false;
  };
})();
