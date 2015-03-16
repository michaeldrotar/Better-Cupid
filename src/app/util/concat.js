/**
  Concatenate any number of arguments together into a single array.

  @param  {...Array} item The items to concatenate
  @return {Array}         The resulting array
*/
util.concat = function() {
  var length = arguments.length,
      arr = [],
      i, item, childLength, j;
  for ( i = 0; i < length; i++ ) {
    item = arguments[i];
    if ( util.isArray(item) ) {
      childLength = item.length;
      for ( j = 0; j < childLength; j++ ) {
        arr.push(item[j]);
      }
    } else {
      arr.push(item);
    }
  }
  return arr;
};
