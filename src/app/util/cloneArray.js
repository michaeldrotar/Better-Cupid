/**
  Clone an array or array-like object

  @param array {Array}
  @return {Array}
*/
util.cloneArray = function(arr) {
  var i, l = arr.length, sliced = new Array(length);
  for ( i = 0; i < l; i++ ) {
    sliced[i] = arr[i];
  }
  return sliced;
};
