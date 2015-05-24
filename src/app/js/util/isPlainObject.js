// Adapted from jQuery's isPlainObject function
var hasOwn = {}.hasOwnProperty;

function isDomNode(arg) {
  return arg.nodeType || arg.window === arg;
}

function hasOwnPrototypeOf(arg) {
  return arg.constructor
    && hasOwn.call(arg.constructor.prototype, 'isPrototypeOf');
}

exports = function(arg) {
  return util.isObject(arg) && !isDomNode(arg) && hasOwnPrototypeOf(arg);
};
