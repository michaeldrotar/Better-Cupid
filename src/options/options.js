;(function() {
  
  var module_hash = {};
  
  var init = {
    checkbox: function(setting, module) {
      this.checked = module.db.get(setting);
      $(this).change();
    },
    text: function(setting, module) {
      this.value = module.db.get(setting);
      $(this).change();
    }
  };
  
  var onchange = {
    checkbox: function(e, setting, module) {
      module.db.set(setting, this.checked);
    },
    text: function(e, setting, module) {
      var val = this.value;
      switch ( this.getAttribute("data-type") ) {
        case "integer":
          val = parseInt(val);
        case "float":
          val = parseFloat(val);
      }
      module.db.set(setting, val);
    }
  };
  
  $("#reset-all-button").click(function(e) {
    $("[data-module]").each(function() {
      var modName = this.getAttribute("data-module"),
        setting = this.getAttribute("data-setting"),
        module = module_hash[modName],
        f = init[this.type];
      module.db.remove(setting);
      if ( f ) {
        f.call(this, setting, module);
      }
    });
    $("#reset-confirmation-dialog").dialog("close");
  });
  $("#reset-page-button").click(function(e) {
    $("#settings_tab_content .switcher li").each(function() {
      var tab = this,
        module,
        modName;
      if ( tab.hasClass("active") ) {
        modName = tab.id.replace(/\-tab$/, "");
        module = module_hash[modName];
        $("[data-module="+modName+"]").each(function() {
          var setting = this.getAttribute("data-setting"),
            f = init[this.type];
          module.db.remove(setting);
          if ( f ) {
            f.call(this, setting, module);
          }
        });
      }
    });
    $("#reset-confirmation-dialog").dialog("close");
  });
  
  $(document)
    .on('click', '.module-enabled-switch', function(e) {
      e.stopPropagation(); // don't select the module settings as well
      var btn = $(this),
          id = btn.attr('data-module');
      Module.get(id).then(function(module) {
        module.enabled(!module.enabled());
        if ( module.enabled() ) {
          btn.addClass('is-enabled').text('Enabled');
        } else {
          btn.removeClass('is-enabled').text('Disabled');
        }
      });
    });
    
  Module.all().then(function(modules) {
    modules.forEach(function(module) {
      var btn = $('.module-enabled-switch[data-module="'+module.id()+'"]');
      if ( module.enabled() ) {
        btn.addClass('is-enabled').text('Enabled');
      }
      
      var section = $('[data-module="'+module.id()+'"]');
      section.find('[data-setting]').each(function() {
        var input = this,
            setting = input.getAttribute('data-setting');
        (init[input.type] || init.text).call(input, setting, module);
        $(input).on('change', function(e) {
          (onchange[input.type] || onchange.text).call(input, e, setting, module);
        });
      });
    });
    $('.page').show();
  });
  
})();