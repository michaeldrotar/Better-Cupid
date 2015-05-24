exports = function(arg) {
  var words = util.words(arg.toLowerCase()),
      i = 0, length = words.length,
      result = '';
  for ( ; i < length; i++ ) {
    result += ( i ? util.capitalize(words[i]) : words[i]);
  }
  return result;
};
