(function(window, document, $) {
  /*
  var moduleObjects = {};
  
  core.getModuleObject = function(id) {
    return moduleObjects[id];
  }
  */
  function loadModules() {
    Module.inject("options", function(modules) {
      modules.sort(function(a,b) {
        // Assumes each module has a unique name
        return ( a.required() ? "!" : "" ) + a.name() > ( b.required() ? "!" : "" ) + b.name() ? 1 : -1;
      });
      modules.forEach(function(module) {
        var id = module.id(),
          container = $("#"+id+"-module"),
          depends = module.depends() || [];
        if ( container.length ) {
          container.prepend("<p>"+module.description()+"</p>");
          if ( depends.length ) {
            container.prepend(
              "<div>Depends On:<ul><li>"+
              depends.map(function(id) {
                var mod = Module.get(id);
                return mod && mod.name() || id;
              }).join("</li><li>")+
              "</li></ul></div>"
            );
          }
          container.prepend("<h1>"+module.name()+"</h1>");
          options.ProcessOptionsPage(container, module);
        }
      });
    });
    /*
    core.manifest(function(manifest) {
      var modules = manifest.modules;
      
      if ( !modules || modules.length === 0 ) {
        return;
      }
      
      modules.forEach(function(module) {
        var mod = new Module(module);
        moduleObjects[mod.id()] = mod;
        
        $.ajax(mod.path("defaults.json"), {
          dataType: "json",
          timeout: 2000,
          success: function(defaults, status, xhr) {
            mod.db.defaults(defaults);
            
            $.ajax(mod.path(module.id+"-options.html"), {
              dataType: "html",
              timeout: 5000,
              success: function(markup, status, xhr) {
                var container = document.createElement("div");
                container.id = module.id+"-module";
                container.innerHTML = "<h1>"+mod.name()+"</h1>"+markup;
                
                window.module = mod;
                $(document.body).append(container);
                delete window.module;
                
                options.ProcessOptionsPage("#"+module.id+"-module", mod);
              },
              error: function(xhr, status, error) {
                core.error("Failed to load " + module.id + " module.");
              }
            });
          },
          error: function(xhr, status, error) {
            core.error("Failed to load defaults for " + module.id + " module.");
          }
        });
      });
    });
    */
  }
  
  loadModules();
})(window, document, jQuery);
