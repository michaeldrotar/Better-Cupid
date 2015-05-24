exports = function(key) {
  this.data[key] = undefined; // NOTE: using delete won't persist the value
  persist(this.id, this.data);
};
