exports = function(arg, item) {
  if ( util.isArrayLike(arg) ) {
    return util.indexOf(arg, item) > -1;
  } else {
    return util.each(arg, function(value) {
      if ( value === item ) {
        return true;
      }
    }) || false;
  }
};
