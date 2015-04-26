util.keys = (function() {
  var hasOwnProperty = Object.hasOwnProperty;
  return function(arg) {
    var keys = [], key;
    if ( util.isArrayLike(arg) ) {
      for ( key = arg.length - 1; key >= 0; key-- ) {
        keys.push(key);
      }
    } else if ( util.isObject(arg) ) {
      for ( key in arg ) {
        if ( hasOwnProperty.call(arg, key) ) {
          keys.push(key);
        }
      }
    }
    return keys;
  };
})();
