(function() {

  /**
    Provides data and methods pertaining to the location that the BC lib is
    currently running in.

    @alias bc.location
    @namespace
  */
  var location = bc.namespace('location'),
      util     = bc.namespace('util'),
      lang     = bc.namespace('lang'),
      loc      = document.location,
      root = 'chrome-extension://'+lang.extension_id;

  if ( loc.href.indexOf(root) === 0 ) {
    root = '';
  }

  /** The location's protocol, such as 'http' or 'https' */
  location.protocol = loc.protocol.substring(0, loc.protocol.length - 1);

  /** The location's domain, such as 'example.com' */
  location.domain = loc.host;

  /** The location's port, such as 80 */
  location.port = loc.port;

  /** The location's path, such as '/my/path/index.html' */
  location.path = loc.pathname;

  /** The location's query string, such as 'apples=3&bananas=4' */
  location.query = loc.search.substring(1); // Chop '?'

  /** The location's hash, such as 'header' */
  location.hash = loc.hash.substring(1); // Chop '#'

  /** The location's base url */
  location.baseUrl = [
    location.protocol,'://',
    location.domain,
    location.port.length ? ':'+location.port : '',
    location.path
  ].join('');

  /** The location's full url */
  location.url = [
    location.baseUrl,
    location.query ? '?' + location.query : '',
    location.hash ? '#' + location.hash : ''
  ].join('');

  /** True if currently running in a content script **/
  location.onContentScript = location.protocol !== 'chrome-extension';

  /**
    Determines if the current page matches the given page. Useful for
    short-circuiting modules or other logic that only applies to certain
    pages. The search is case-sensitive so it's best to use a regex
    with the `i` flag if unsure of letter casing.

    @param  {string|RegExp} search The string or regex to test against
    @return {boolean}              True if the search matches
  */
  location.onPage = function(search) {
    if ( typeof search === 'string' ) {
      return location.url.indexOf(search) > -1;
    } else {
      return search.test(location.url);
    }
  };

  /**
    Creates a path to the given resource accounting for if the lib is
    currently loaded in a content script or not.

    @param  {string} path The relative path to the resource
    @return {string}      The full path to the resource
  */
  location.getResourcePath = function(path) {
    if ( path.substring(0, 1) !== '/' ) {
      path = '/' + path;
    }
    return root + path;
  };

})();
