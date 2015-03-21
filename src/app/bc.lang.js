(function() {

  /**
    Provides access to localization methods paired with the util.format
    function to provide advanced string formatting.
    Also provides more convenient access to the predefined messages.

    @alias bc.lang
    @namespace
  */
  var lang = bc.namespace('lang'),
      util = bc.namespace('util'),
      i18n = chrome.i18n;

  /**
    Gets the requested localization string and formats it with the
    arguments passed, if any.

    @param  {string} key The key to the message that should be returned
    @param  {...Any}     Any number of additional arguments to feed
                         into the message using `util.format`.
    @return {string}     The message, with any wildcards substituted.
  */
  lang.get = function(key) {
    var msg = i18n.getMessage(key);
    if ( arguments.length > 1 ) {
      msg = util.format.apply(msg, util.clone(arguments).slice(1));
    }
    return msg;
  };

  /**
    Gets the language that the browser is currently configured to.

    @return {string} A locale code representing the language, such as 'en-US'
  */
  lang.getUILanguage = function() {
    return i18n.getUILanguage();
  };

  /**
      The current extension's ID
  */
  lang.extension_id = i18n.getMessage('@@extension_id');

  /**
    The current locale
  */
  lang.ui_locale = i18n.getMessage('@@ui_locale');

  /**
    The text direction of the locale, either 'ltr' or 'rtl'
  */
  lang.bidi_dir = i18n.getMessage('@@bidi_dir');

  /**
    The reverse of bidi_dir
  */
  lang.bidi_reversed_dir = i18n.getMessage('@@bidi_reversed_dir');

  /**
    The edge that texts starts on in the given locale, either 'left' or 'right'
  */
  lang.bidi_start_edge = i18n.getMessage('@@bidi_start_edge');

  /**
    The opposite edge of bidi_start_edge
  */
  lang.bidi_end_edge = i18n.getMessage('@@bidi_end_edge');

})();
