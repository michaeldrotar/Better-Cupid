exports = function(id) {
  return util.each(modules, function(module) {
    if ( module.id === id ) {
      return module;
    }
  });
};
