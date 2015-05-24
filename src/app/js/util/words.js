// adapted from lodash
// https://github.com/lodash/lodash/blob/3.8.0/lodash.src.js

var reWords = (function() {
    var upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]',
        lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+',
        lookAhead = upper + '+(?=' + upper + lower + ')',
        normal = upper + '?' + lower,
        acronym = upper + '+',
        numbers = '[0-9]+';

    return RegExp([lookAhead, normal, acronym, numbers].join('|'), 'g');
})();

exports = function(arg) {
  return arg.match(reWords) || [];
};
