/**
  The BetterCupid lib

  @namespace
*/
bc = {};

/**
  Takes a dot seperated namespace for within the bc namespace.
  If the namespace already exists, it's returned; otherwise, it's created
    as an empty object.
  If a second argument is given, it may be an object or function to extend
    the namespace with.

  @example
    var simple = bc.namespace('simple');
  @example
    var complexName = bc.namespace('complex.name');
  @example
    var init = bc.namespace('init', {
          doSomething: function() {}
        });
*/
bc.namespace = function(ns, init) {
  var parts, i, l, part, key, temp;

  // Separate the namespace into it parts
  parts = ns.split('.');

  // If assigning a function to the namespace, will need the
  // last key later on
  if ( typeof init === 'function' ) {
    key = parts.pop();
  }

  // Start at bc, iterate each part
  ns = bc;
  for ( i = 0, l = parts.length; i < l; i++ ) {
    // Create the part if it doesn't exist and update
    // namespace to point at it
    part = parts[i];
    ns = ns[part] = ns[part] || {};
  }

  // For extending a function to the namespace, save off the existing
  // namespace and put the function in its place, then copy over any
  // pre-existing keys of the namespace back onto the function
  // For extending with another object, a simple key-copy operation will do
  if ( key ) {
    temp = ns[key];
    ns[key] = init;
    for ( part in temp ) {
      if ( init[part] === undefined ) {
        init[part] = temp[part];
      }
    }
    ns = ns[key];
  } else if ( init ) {
    for ( part in init ) {
      ns[part] = init[part];
    }
  }

  // Return the final namespace
  return ns;
};
