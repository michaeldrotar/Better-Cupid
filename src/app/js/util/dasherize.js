exports = function(arg) {
  var words = util.words(arg),
      i = 0, length = words.length,
      result = '';
  for ( ; i < length; i++ ) {
    result += ( i ? '-' : '' ) + words[i].toLowerCase();
  }
  return result;
};
