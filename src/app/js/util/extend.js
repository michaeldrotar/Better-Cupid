exports = function() {
  var deep  = false,
      start = 1,
      stop  = arguments.length - 1,
      i, key, isArray,
      arg, src, target, dest, clone;
  if ( typeof arguments[0] === 'boolean' ) {
    deep = arguments[0];
    start = 2;
  }
  target = arguments[start - 1] || {};
  for ( i = start; i <= stop; i++ ) {
    arg = arguments[i];
    if ( util.isObject(arg) ) {
      for ( key in arg ) {
        if ( !arg.hasOwnProperty(key) ) {
          continue;
        }

        src = arg[key];
        dest = target[key];

        if ( src === target ) {
          continue;
        }

        if ( deep && ((isArray = util.isArray(src)) || util.isPlainObject(src)) ) {
          if ( isArray ) {
            isArray = false;
            clone = [];
          } else {
            clone = dest && util.isObject(dest) ? dest : {};
          }
          target[key] = util.extend(deep, clone, src);
        } else {
          target[key] = src;
        }
      }
    }
  }
  return target;
};
