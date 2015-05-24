exports = function() {
  var self = this,
      args = arguments;
  Module.ready(function() {
    util.each(args, function(property) {
      self[property] = ko.observable(self.get(property));
      self[property].subscribe(function(value) {
        self.set(property, value);
      });
    });
  });
};
