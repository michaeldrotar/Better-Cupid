;(function() {

// Define the wildcard match, grab anything between curly braces
var reWildcard = /\{([^\s]+)\}/g;

/**
  Returns a string that has had its wildcards replaced with the given data.
  The template may be the first argument passed or may be passed as 'this'.
  If the wildcard is a number, parameters are grabbed based on their index
  in the arguments.
  If the wildcard is a string, parameters are grabbed as keys off the first
  argument.

  @example
    var place = 'Disneyland',
        user = 'Mickey';
    core.string.format('Hi, {1}! Welcome to {0}!', place, user);

  @example
    var user = {
          first: 'Mickey',
          last: 'Mouse'
        };
    core.string.format('{first} {last} is great!', user);

  @example
    var msg = 'Hello, {0}!',
        args = [ 'world' ];
    core.string.format.apply(msg, args);
*/
util.format = function() {
  var args = Array.prototype.slice.call(arguments, 0),
      hash,
      message;

  // If 'this is a string then use it as the message; otherwise
  // the message is the first argument, remove it from the argument list
  if ( typeof this === 'string' || this instanceof String ) {
    message = this.toString();
  } else {
    message = args.shift();
  }

  // If the first argument is an object then use it as a hash
  // for string wildcards
  hash = args.length && args[0];
  if ( !hash || typeof hash !== 'object' ) {
    hash = null;
  }

  // Return the string with the substitutions made
  return message.replace(reWildcard, function(match, wildcard, index, message) {
    // Parse the wildcard as a number to represent the position in
    // the arguments list
    var position = parseInt(wildcard);

    // If position isn't a number, try to get the wildcard from the hash;
    // otherwise, get the position from within the arguments
    if ( isNaN(position) ) {
      if ( hash && hash.hasOwnProperty(wildcard) ) {
        return hash[wildcard];
      }
    } else {
      if ( position >= 0 && position < args.length ) {
        return args[position];
      }
    }

    // If the wildcard doesn't match up with anything, just return it
    return '{'+wildcard+'}';
  });
};
})();
