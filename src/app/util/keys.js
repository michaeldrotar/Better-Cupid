/**
  Returns an array of all keys for a given object.

  @param  {Object} arg The object holding the keys
  @return {Array}      The array of keys
*/
util.keys = Object.keys || (function() {
  var hasOwnProperty = Object.hasOwnProperty;
  return function(arg) {
    var keys = [], key;
    for ( key in arg ) {
      if ( hasOwnProperty.call(arg, key) ) {
        keys.push(key);
      }
    }
    return keys;
  };
})();
