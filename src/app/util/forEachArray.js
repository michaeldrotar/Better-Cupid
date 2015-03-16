/**
  Iterates each member of the array, calling the callback once.
  If the callback returns a value, the iteration will stop and
    bc.forEach will return the value.

  @param array {Array}
  @param callback {Function}
    Takes the form function(value, index, array)
  @return {*}
*/
util.forEachArray = function(arr, callback) {
  var i, l = arr.length, ret;
  for ( i = 0; i < l; i++ ) {
    ret = callback(arr[i], i, arr);
    if ( ret !== undefined ) {
      return ret;
    }
  }
};
