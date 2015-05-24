exports = function(arg, item, index) {
  var length;
  length = arg.length;
  index = index || 0;
  if ( index < 0 ) {
    index = length + index;
    if ( index < 0 ) {
      index = 0;
    }
  }
  for ( ; index < length; index++ ) {
    if ( arg[index] === item ) {
      return index;
    }
  }
  return -1;
};
