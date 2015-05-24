function flatten(args, result) {
  var i = 0,
      length = args.length,
      arg;
  for ( ; i < length; i++ ) {
    arg = args[i];
    if ( util.isArrayLike(arg) ) {
      flatten(arg, result);
    } else {
      result.push(arg);
    }
  }
  return result;
}

exports = function() {
  return flatten(util.clone(arguments), []);
};
