exports = function(key, value) {
  var self = this,
      data = self.data;
  if ( typeof key === 'object' ) {
    util.extend(true, data, key);
  } else {
    data[key] = value;
  }
  persist(this.id, this.data);
};
