exports = function(key) {
  var data,
      defaults = this.defaults;
  // Data must have undefined values in order for them to be removed from
  // storage, but must ignore them when getting the value
  data = util.remove(this.data, function(value) {
    return value === undefined;
  });
  if ( typeof key === 'string' ) {
    return data.hasOwnProperty(key) ? data[key] : defaults[key];
  } else {
    return util.extend(true, {}, defaults, data);
  }
};
