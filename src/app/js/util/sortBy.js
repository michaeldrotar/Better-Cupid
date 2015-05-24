// adapted from Angular's orderBy function
// https://github.com/angular/angular.js/blob/master/src/ng/filter/orderBy.js

function compare(a, b, property) {
  var ta = typeof a,
      tb = typeof b;
  if ( ta === tb ) {
    if ( ta === 'number' || ta === 'boolean' ) {
      return a - b;
    } else if ( ta === 'string' ) {
      return a.localeCompare(b);
    }
  }
  return ta < tb ? -1 : 1;
}

function get(obj, property) {
  var dot,
      remaining;
  if ( util.isObject(obj) ) {
    dot = property.indexOf('.');
    if ( dot > -1 ) {
      remaining = property.substring(dot+1);
      property = property.substring(0,dot);
      if ( remaining ) {
        return get(obj[property], remaining);
      }
    }
    return obj[property];
  }
  return obj;
}

function lower(a) {
  if ( typeof a === 'string' ) {
    a = a.toLowerCase();
  }
  return a;
}

function reverse(fn) {
  return function(a,b) { return fn(b,a); };
}

exports = function(collection, properties, caseSensitive) {
  if ( !util.isArray(properties) ) {
    properties = util.concat([], properties);
  }
  properties = properties.map(function(property) {
    var sign = property.charAt(0),
        ascending = true,
        fn;
    if ( sign === '+' || sign === '-' ) {
      property = property.substring(1);
      ascending = sign === '+';
    }
    if ( caseSensitive ) {
      fn = function(a,b) {
        return compare(get(a, property), get(b, property));
      };
    } else {
      fn = function(a,b) {
        return compare(lower(get(a, property)), lower(get(b, property)));
      };
    }
    if ( !ascending ) {
      fn = reverse(fn);
    }
    return fn;
  });
  return collection.sort(function(a,b) {
    var i = 0,
        length = properties.length,
        result;
    for ( ; i < length; i++ ) {
      result = properties[i](a, b);
      if ( result !== 0 ) return result;
    }
    return 0;
  });
};
