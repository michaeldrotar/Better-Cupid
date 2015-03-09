var options = {};

(function() {

// -- General ----------------------------------------------------------------------------------------------------------

$(".switcher").switcher();

// -- Changelog/About --------------------------------------------------------------------------------------------------

(function() {

  var cache = {};
  function GenerateLoadSectionFunction(selector, url, callback) {
    var widget = $(selector),
      func, onerror;
    onerror = function() {
      cache[selector] = false;
      var refresh = $(
        "<p class='error'>"+
          "There was an error retrieving the information. The server may be down."+
          " Click <a href=''>here</a> to try again."+
        "</p>"
      );
      refresh.click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        func(true);
      });
      widget.html("").append(refresh);
    };
    func = function(force) {
      if ( force === true || !cache[selector] ) {
        widget.html("<p>Loading...</p>");
        core.SendRequest({
          type: "fetch",
          force: force === true,
          url: url
        }, function(response) {
          if ( response.error ) {
            onerror();
          } else {
            cache[selector] = true;
            if ( callback ) {
              try {
                callback(response);
              } catch(error) {
                onerror();
              }
            } else {
              widget.html($(response.data).find(".markdown-body").html());
            }
          }
        });
      }
    };
    return func;
  }
  
  $("#changelog_tab").click(GenerateLoadSectionFunction(
    "#changelog_tab_content",
    "https://github.com/michaeldrotar/Better-Cupid/wiki/Changelog",
    function(response) {
      
      var changelog = $("#changelog_tab_content")
            .html(
              '<div class="tab_content_nav">' +
                '<div class="title">Versions</div>' +
                  '<ul class="switcher"></ul>' +
                '</div>' +
                '<div class="tab_content_left">' +
                '</div>' +
              '</div>'
            ),
          changelogSwitcher = changelog.find('.switcher'),
          changelogContent = changelog.find('.tab_content_left'),
          versions = {},
          section;
      
      
      $(response.data).find('.markdown-body').children().each(function() {
        var child = $(this),
            isHeader = this.tagName.toLowerCase() === 'h2',
            versionText,
            shortVersion,
            key;
        
        if ( isHeader ) {
          versionText = child.text().trim();
          child.text(versionText);
          
          shortVersion = versionText.replace(/([\d\.]+)\.\d+$/, '$1');
          key = shortVersion.replace(/[^\d\w]/g, '_');
          
          if ( versions[key] ) {
            if ( section ) {
              section.append(child);
            }
          } else {
            versions[key] = true;
            changelogContent.append(section);
            
            changelogSwitcher.append(
              '<li id="changelog_'+key+'_tab"' +
                  ' data-content-selector="#changelog_'+key+'_content">' +
                shortVersion +
              '</li>'
            );
            section = $('<div id="changelog_'+key+'_content"></div>');
            section.append(child);
          }
        } else {
          if ( section ) {
            section.append(child);
          }
        }
      });
      if ( section && section.children().length ) {
        changelogContent.append(section);
      }
      
      changelogContent.html(
        changelogContent.html().replace(
          /<p>(\s*\d+\/\d+\/\d+\s*)<\/p>/g,
          "<div class='date'>$1</div>"
        )
      );
      
      changelogSwitcher.switcher();
    }
  ));
  
  $("#about_tab").click(GenerateLoadSectionFunction(
    "#about_tab_content",
    "https://github.com/michaeldrotar/Better-Cupid/wiki/About"
  ));
  
})();

// -- Settings ---------------------------------------------------------------------------------------------------------

(function() {
  
  var module_hash = {};
  
  var init = {
    checkbox: function(setting, module) {
      module.db.get(setting, function(db) {
        this.checked = db[setting];
        $(this).change();
      });
    },
    text: function(setting, module) {
      module.db.get(setting, function(db) {
        this.value = db[setting];
        $(this).change();
      });
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
  
  function toggleEnabled(module) {
    module.db.set("enabled", !module.db.get("enabled"));
  }
  
  core.manifest(function(manifest) {
    var modules = manifest.modules.map(function(module) {
          return new Module(module);
        });
    
    modules.forEach(function(module) {
      module_hash[module.id()] = module;
      
      var page = $('[id="'+module.id()+'-module"]');
      if ( !page.length ) {
        page = $(
          '<div id="'+module.id()+'-module">' +
            '<h2>'+module.name()+'</h2>' +
            '<p>'+module.description()+'</p>' +
            ( module.depends().length ?
              '<div>Depends On:<ul><li>' +
              module.depends().map(function(id) {
                var dep;
                modules.forEach(function(module) {
                  if ( module.id() === id ) {
                    dep = module;
                  }
                });
                return dep && dep.name || id;
              }).join('</li><li>') +
              '</li></ul></div>' :
              ''
            ) +
          '</div>'
        );
        $("#settings_tab_content .tab_content_left").append(page);
      } else {
        page.find('[data-setting]').attr('data-module', module.id()).each(function() {
          var f = init[this.type],
              f2 = onchange[this.type],
              setting = this.getAttribute('data-setting');
          if ( f ) {
            f.call(this, setting, module);
          }
          if ( f2 ) {
            $(this).change(function(e) {
              f2.call(this, e, setting, module);
            });
          }
        });
      }
      
      var li = $("<li id='"+module.id()+"-tab' data-content-selector='#"+page.attr("id")+"'>"+module.name()+"</li>");
      $("#settings_tab_content .switcher").append(li).switcher();
      
      if ( !module.required() ) {
        var en = $("<span class='switch'></span>");
        en.click(function(e) {
          toggleEnabled(module);
          if ( module.enabled() ) {
            this.addClass("enabled");
            this.innerHTML = "Enabled";
          } else {
            this.removeClass("enabled");
            this.innerHTML = "Disabled";
          }
          e.stopPropagation();
          e.preventDefault();
        });
        if ( module.enabled() ) {
          en.addClass("enabled");
          en.html("Enabled");
        } else {
          en.html("Disabled");
        }
        li.append(en);
      }
    });
  });
  
  options.ProcessOptionsPage = function(selector, module) {
    var page = $(selector);
    
    module_hash[module.id()] = module;
    
    page.find("[data-setting]").attr("data-module", module.id()).each(function() {
      var f = init[this.type],
        f2 = onchange[this.type],
        setting = this.getAttribute("data-setting");
      if ( f ) {
        f.call(this, setting, module);
      }
      if ( f2 ) {
        $(this).change(function(e) {
          f2.call(this, e, setting, module);
        });
      }
    });
    
    $("#settings_tab_content .tab_content_left").append(page);
    var li = $("<li id='"+module.id()+"-tab' data-content-selector='#"+page.attr("id")+"'>"+module.name()+"</li>");
    $("#settings_tab_content .switcher").append(li).switcher();
    
    if ( !module.required() ) {
      var en = $("<span class='switch'></span>");
      en.click(function(e) {
        toggleEnabled(module);
        if ( module.enabled() ) {
          this.addClass("enabled");
          this.innerHTML = "Enabled";
        } else {
          this.removeClass("enabled");
          this.innerHTML = "Disabled";
        }
        e.stopPropagation();
        e.preventDefault();
      });
      if ( module.enabled() ) {
        en.addClass("enabled");
        en.html("Enabled");
      } else {
        en.html("Disabled");
      }
      li.append(en);
    }
  };
  
  $("#reset-confirmation-dialog").dialog({
    autoOpen: false,
    modal: true,
    open: function() {
      $(".ui-widget-overlay").css("height", "").css("width", "");
      if ( $("#settings_tab").hasClass("active") ) {
        $("#reset-confirmation-dialog .page-text").show();
        $("#reset-confirmation-dialog .all-text").hide();
        $("#reset-page-button").show();
      } else {
        $("#reset-confirmation-dialog .page-text").hide();
        $("#reset-confirmation-dialog .all-text").show();
        $("#reset-page-button").hide();
      }
    }
  });
  $("#reset_button").click(function(e) {
    $("#reset-confirmation-dialog").dialog("open");
  });
  $("#reset-all-button").click(function(e) {
    $("[data-module]").each(function() {
      var modName = this.getAttribute("data-module"),
        setting = this.getAttribute("data-setting"),
        module = module_hash[modName],
        f = init[this.type];
      module.db.clear(setting);
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
          module.db.clear(setting);
          if ( f ) {
            f.call(this, setting, module);
          }
        });
      }
    });
    $("#reset-confirmation-dialog").dialog("close");
  });
  
  if ( 1 ) return;
  
  (function() {
    var settings = core.settings;
    $("input").each(function() {
      var key = this.getAttribute("data-setting");
      if ( key ) {
        switch ( this.type ) {
          case "checkbox":
            this.checked = settings.get(key);
            $(this).click(function() {
              settings.set(this.getAttribute("data-setting"), this.checked ? true : false);
            });
            break;
            
          case "range":
            this.value = settings.get(key);
            $("#"+key+"Display").html(this.value);
            $(this).change(function() {
              var key = this.getAttribute("data-setting");
              settings.set(key, this.value);
              $("#"+key+"Display").html(this.value);
            });
            break;
          
          case "text":
          default:
            break;
        }
      }
    });
  })();
  
})();

})();