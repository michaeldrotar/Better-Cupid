;(function(window, bc) {

  /**
    Supplies ability to create custom errors

    @alias bc.error
    @namespace
  */
  var error = bc.namespace('error'),
      util  = bc.namespace('util'),
      hash  = {};

  /**
    Creates a custom error message and attaches it to the bc namespace.

    @param name {string}
      The name of the error and the key to add to bc.
      Name must start with a capital letter, be camelCase, and end in
        the word 'Error'.
    @param [parent=Error] {Error|string}
      The parent to inherit, defaults to Error.
    @param [properties] {Object|string[]}
      An array of arguments to pass into the error's constructor.
      Must not include 'message' as that is always the final
        constructor argument.
      To specify values for properties, specify an object instead.
      To specify constructor arguments and values, the object may be
        the final argument to the array.
      If not given, inherited from parent.
    @param [message] {string}
      The default message to display, should be friendly enough to display
        to an end user.
      May contain string wildcards referencing properties of the error.
      If not given, inherited from parent.

    @throws {TypeError}
      Indicates a given argument was invalid.
    @throws {ReferenceError}
      Indicates the error type already exists or the given parent
        does not exist.

    @returns {Error}

    @example
      bc.error.create({
        name: 'SimpleError',
        message: 'Something simple went wrong. Try again.'
      });
      throw new bc.SimpleError();

    @example
      bc.error.create({
        name: 'PropertiesError',
        parent: bc.SimpleError,
        properties: [ 'code' ],
        message: 'A {code} error occured, aborting...'
      });
      throw new bc.PropertiesError(500);

    @example
      bc.error.create({
        name: 'OverwriteMessageError',
        message: 'Uh oh!'
      });
      throw new bc.OverwriteMessageError('Uh oh spaghettio!');

    @example
      bc.error.create({
        name: 'SpecifyPropertiesError',
        parent: 'PropertiesError',
        properties: {
          code: 500
        }
      });
      throw new bc.SpecifyPropertiesError();

    @example
      bc.error.create({
        name: 'DefaultPropertiesError',
        parent: 'PropertiesError',
        properties: [ 'code', {
          code: 500
        }]
      });
      throw new bc.DefaultPropertiesError();
      throw new bc.DefaultPropertiesError(500);

    @example
      bc.error.create({
        name: 'NewPropertiesError',
        parent: 'PropertiesError',
        properties: [ 'newCode', {
          code: 500
        }],
        message: 'A {code} error occured but was replaced with {newCode}'
      });
      throw new bc.NewPropertiesError(200);

  */
  error.create = function(data) {
    var parent,
        i, l;

    // Check for required params
    /* @ifdef DEV */
    if ( !util.isObject(data) || !data.name ) {
      throw new TypeError(
        'KOR.error.create requires a data object to be '+
        'passed in with a unique name');
    }
    /* @endif */

    // Copy off all the data into metadata so errors can report on
    // the original data
    var meta = util.clone(data);

    // Check that the name adheres to standards and isn't in use
    /* @ifdef DEV */
    if (
        typeof meta.name !== 'string' ||
        meta.name[0] !== meta.name[0].toUpperCase() ||
        meta.name.substr(meta.name.length-5) !== 'Error' ) {
      throw new TypeError(
        'bc.error.create requires a name that starts with '+
        'an uppercase letter and ends in \'Error\', '+
        'received: \''+data.name+'\'');
    }

    if ( hash[meta.name] ) {
      if ( bc[meta.name] === undefined ) {
        delete hash[meta.name]; // Allow for dev (tests), not for prod
      } else {
        throw new ReferenceError(
          'bc.error.create tried to create an Error type that '+
          'already exists: \''+data.name+'\'');
      }
    }
    /* @endif */

    // Determine parent, check that it's an instance of Error
    if ( !meta.parent ) {
      meta.parent = window.Error;
    }

    if ( typeof meta.parent === 'function' ) {
      parent = new meta.parent();
      if ( parent instanceof window.Error ) {
      } else {
        parent = null;
      }
    }

    /* @ifdef DEV */
    if ( !parent ) {
      throw new TypeError(
        'bc.error.create requires that the parent be a class '+
        'that inherits window.Error');
    }
    /* @endif */

    // Transform properties into an array, if possible
    // Copy it so that it's immutable
    if ( !meta.properties ) {
      if ( hash[parent.name] ) {
        meta.properties = util.clone(hash[parent.name].properties);
      } else {
        meta.properties = [];
      }
    } else if ( util.isArray(meta.properties) ) {
      meta.properties = util.cloneArray(meta.properties);
      if ( util.isObject(meta.properties[meta.properties.length-1]) ) {
        meta.hash = meta.properties.splice(meta.properties.length-1)[0];
      }
    } else if ( util.isObject(meta.properties) ) {
      meta.hash = util.cloneObject(meta.properties);
      meta.properties = [];
    } else {
      throw new TypeError(
        'bc.error.create requires that properties be an array or object, if given');
    }

    // Check that properties are all strings
    for ( i = 0, l = meta.properties.length; i < l; i++ ) {
      if ( typeof meta.properties[i] !== 'string' ) {
        throw new TypeError(
          'bc.error.create requires that all properties are strings');
      }
    }

    // Inherit the message, if one isn't given
    if ( !meta.message ) {
      if ( hash[parent.name] ) {
        meta.message = hash[parent.name].message || '';
      } else {
        meta.message = '';
      }
    }

    hash[meta.name] = meta;

    // Create the error class
    function Error() {
      // Grab all the values passed in
      var values = util.clone(arguments),
          err = this;

      // Set the name
      err.name = meta.name;

      // Assign the defaults
      if ( meta.hash ) {
        util.forEach(meta.hash, function(value, key) {
          err[key] = value;
        });
      }

      // Iterate the args defined in the create function, assign the values,
      // in order, to properties denoted by the args
      util.forEach(meta.properties, function(arg, i) {
        var value = values[i];
        if ( value !== undefined ) {
          err[arg] = values[i];
        }
      });

      // Get the error message (may be passed as the first arg after the
      // defined properties)
      err.message = values[meta.properties.length];
      if ( err.message !== undefined ) {
        // Ensure it's a string else format will error
        err.message += '';
      }
      err.message = util.format(err.message || meta.message, err);

      // Attach the stack trace
      if ( window.Error && window.Error.captureStackTrace ) {
        window.Error.captureStackTrace(err, Error);
      }

      // Return the error object
      return err;
    };

    // Create the parent relationship so that instanceof works
    Error.prototype = new meta.parent();
    Error.prototype.constructor = Error;

    // Attach to the bc namespace
    bc[meta.name] = Error;

    // Return the new error type class
    return Error;
  };

})(window, window.bc);
