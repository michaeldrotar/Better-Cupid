;(function($, Promise) {

  /**
    Contains functionality for performing http requests asynchronously by
      wrapping jQuery's ajax functions inside of bluebird promises.
    The resulting promise can be .cancel()'d, which will .abort() the
      jQuery operation.

    @alias bc.http
    @namespace
  */

  var http  = bc.namespace('http'),
      error = bc.namespace('error'),
      util  = bc.namespace('util');

  /*
    Wraps an ajax async function in a promise and provides standard
    error-handling
  */
  function wrap(fn) {
    return function() {
      // Get the xhr response
      var xhr = fn.apply($, arguments);
      // Return a Promise
      return new Promise(function(resolve, reject) {
        // When the xhr is done, handles success and failure states
        xhr.then(function(response, status, xhr) {
          resolve(response);
        }, function(xhr, status, message) {
          var err;
          // Do error handling, converting the error 'response' to a
          // true error object that can be thrown.
          if ( status === 'abort' ) {
            err = new bc.HttpAbortError();
          } else if ( status === 'timeout' ) {
            err = new bc.HttpTimeoutError();
          } else if ( status === 'parsererror' ) {
            err = new SyntaxError(message);
          } else if ( xhr.status === 404 ) {
            err = new bc.HttpNotFoundError();
          } else if ( xhr.status === 500 ) {
            err = new bc.HttpInternalServerErrorError();
          } else {
            err = new bc.HttpError(xhr.status);
          }
          // Reject the promise with the error
          reject(err);
        })
      })
      // Make the Promise cancellable
      .cancellable()
      // If the Promise is cancelled, abort the underyling xhr,
      // let the error propagate in case anything else needs to
      // take action on it
      .caught(Promise.CancellationError, function(err) {
        xhr.abort()
        throw new bc.HttpAbortError();
      });;
    }
  }

  /**
    Performs a highly configurable http request.

    @alias http
    @memberOf bc.http
    @method
    @param  {String}  [url]      The url to call
    @param  {Object}  [settings] The http request settings
    @return {Promise}
    @see http://api.jquery.com/jquery.ajax/
  */
  http = bc.namespace('http', wrap($.ajax));

  /**
    Performs a GET request.

    @alias get
    @memberOf bc.http
    @method
    @param  {String}  [url]      The url to call
    @param  {Object}  [settings] The http request settings
    @return {Promise}
    @see http://api.jquery.com/jquery.get/
  */
  http.get = wrap($.get);

  /**
    Performs a POST request.

    @alias post
    @memberOf bc.http
    @method
    @param  {String}  [url]      The url to call
    @param  {Object}  [settings] The http request settings
    @return {Promise}
    @see http://api.jquery.com/jquery.post/
  */
  http.post = wrap($.post);

  /**
    Indicates a generic http error response.

    @class
    @name bc.HttpError
    @extends Error
    @param {Number} code      The http response code
    @param {String} [message] A custom error response message
  */
  error.create({
    name: 'HttpError',
    properties: ['code'],
    messageKey: 'http.error'
  });

  /**
    Indicates that the http request was aborted.

    @class
    @name bc.HttpAbortError
    @extends bc.HttpError
    @param {String} [message] A custom error response message
  */
  error.create({
    name: 'HttpAbortError',
    parent: bc.HttpError,
    properties: { code: null },
    messageKey: 'http.abort.error'
  });

  /**
    Indicates that the http request timed out.

    @class
    @name bc.HttpTimeoutError
    @extends bc.HttpError
    @param {String} [message] A custom error response message
  */
  error.create({
    name: 'HttpTimeoutError',
    parent: bc.HttpError,
    properties: { code: null },
    messageKey: 'http.timeout.error'
  });

  /**
    Indicates that the http request returned a 404 Not Found error.

    @class
    @name bc.HttpNotFoundError
    @extends bc.HttpError
    @param {String} [message] A custom error response message
  */
  error.create({
    name: 'HttpNotFoundError',
    parent: bc.HttpError,
    properties: { code: 404 },
    messageKey: 'http.notFound.error'
  });

  /**
    Indicates that the http request returned a 500 Internal Server Error error.

    @class
    @name bc.HttpInternalServerErrorError
    @extends bc.HttpError
    @param {String} [message] A custom error response message
  */
  error.create({
    name: 'HttpInternalServerErrorError',
    parent: bc.HttpError,
    properties: { code: 500 },
    messageKey: 'http.internalServerError.error'
  });

})(jQuery, Promise);
