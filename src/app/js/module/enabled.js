exports = function(value) {
  if ( arguments.length === 0 ) {
    var needsEnabled = true;
    util.each(this.needs, function(id) {
      var module = Module.get(id);
      if ( !module.enabled() ) {
        needsEnabled = false;
      }
    });
    return this.required || (this.get('enabled') && needsEnabled);
  } else {
    this.set('enabled', value);
  }
};
