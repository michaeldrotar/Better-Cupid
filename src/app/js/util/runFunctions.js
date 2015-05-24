exports = function(fns, args) {
  if ( !util.isArrayLike(fns) ) {
    return;
  }
  util.each(fns, function(fn) {
    try {
      fn.apply(this, args || []);
    } catch ( err ) {
      console.error(err);
    }
  });
};
