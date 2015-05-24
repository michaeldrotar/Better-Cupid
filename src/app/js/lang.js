/**
  Provides access to localization methods paired with the util.format
  function to provide advanced string formatting.
  Also provides more convenient access to the predefined messages.

  @alias bc.lang
  @namespace
*/
var i18n = chrome.i18n;

exports = {

  /**
    Gets the requested localization string and formats it with the
    arguments passed, if any.

    @param  {string} key The key to the message that should be returned
    @param  {...Any}     Any number of additional arguments to feed
                         into the message using `util.format`.
    @return {string}     The message, with any wildcards substituted.
  */
  get: function(key) {
    var msg = i18n.getMessage(key);
    if ( arguments.length > 1 ) {
      msg = util.format.apply(msg, util.clone(arguments).slice(1));
    }
    return msg;
  },

  /**
    Gets the language that the browser is currently configured to.

    @return {string} A locale code representing the language, such as 'en-US'
  */
  getUILanguage: function() {
    return i18n.getUILanguage();
  },

  /**
      The current extension's ID
  */
  extension_id: i18n.getMessage('@@extension_id'),

  /**
    The current locale
  */
  ui_locale: i18n.getMessage('@@ui_locale'),

  /**
    The text direction of the locale, either 'ltr' or 'rtl'
  */
  bidi_dir: i18n.getMessage('@@bidi_dir'),

  /**
    The reverse of bidi_dir
  */
  bidi_reversed_dir: i18n.getMessage('@@bidi_reversed_dir'),

  /**
    The edge that texts starts on in the given locale, either 'left' or 'right'
  */
  bidi_start_edge: i18n.getMessage('@@bidi_start_edge'),

  /**
    The opposite edge of bidi_start_edge
  */
  bidi_end_edge: i18n.getMessage('@@bidi_end_edge')
};
