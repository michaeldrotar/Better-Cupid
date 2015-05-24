var template = {};

/**
  Injects a knockout template binding into the given element(s).
  The binding must be a knockout template string such as:
    "{ name: 'my-template' }"
*/
template.inject = function(element, binding, viewModel) {
  if ( bc.location.onContentScript ) {
    if ( typeof binding === 'string' ) {
      if ( binding.indexOf('<') !== 0 ) {
        if ( binding.indexOf('{') !== 0 ) {
          binding = '{ name: \'' + binding + '\' }';
        }
        binding = '<span data-bind="template: '+binding+'"></span>';
      }
    }
    $(element).each(function() {
      var container = $(binding);
      $(this).append(container);
      ko.applyBindings(viewModel, container[0]);
    });
  }
};

$(function() {
  $('body').append(kotemplates('/**/*.template.html'));
});

exports = template;
