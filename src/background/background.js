(function(){

var version = 0,
  tabs = {},
  regex = {
    targetSite: /^https?:\/\/(?:[^\.]+\.)?okcupid\.com/i
  };

chrome.tabs.onUpdated.addListener(function(_, info, tab) {
  if ( regex.targetSite.test(tab.url) ) {
    tabs[tab.id] = tab;
  } else {
    delete tabs[tab.id];
  }
});

chrome.tabs.onRemoved.addListener(function(tabid, info) {
  delete tabs[tabid];
});

chrome.windows.getAll({ populate: true }, function(windowArray) {
  $.each(windowArray, function(_, window) {
    $.each(window.tabs, function(_, tab) {
      if ( regex.targetSite.test(tab.url) ) {
        tabs[tab.id] = tab;
      }
    });
  });
});

  var fetch_cache = {};

  var requestHandler = function(request, sender, sendResponse) {
    var response = { type: request.type };
    switch ( request.type ) {
      case "fetch":
        var url = request.url,
          key = url.toLowerCase(),
          entry = fetch_cache[key],
          age = request.age || 60*60*1000,
          timestamp = (new Date()).getTime();
        if ( request.force || !entry || !entry.data || !entry.timestamp || entry.timestamp + age < timestamp ) {
          request.type = request.requestType || "GET";
          request.key = key;
          request.success = function(data, status, jqXHR) {
            fetch_cache[this.key] = {
              data: data,
              timestamp: (new Date()).getTime()
            };
            response.data = data;
            sendResponse(response);
          }
          request.error = function(jqXHR, status, message) {
            response.error = message;
            sendResponse(response);
          }
          $.ajax(request);
          return true;
        } else {
          response.cached = true;
          response.data = entry.data;
        }
        break;
    }
    sendResponse(response);
  };

  chrome.extension.onMessage.addListener(requestHandler);

  chrome.browserAction.onClicked.addListener(function(tab) {
    window.open("http://www.okcupid.com");
  });
  /*
  chrome.browserAction.setPopup({popup:"popup.html"})
  setTimeout(function() {
    chrome.browserAction.setPopup({popup:""})
  }, 1000)
  chrome.browserAction.setBadgeBackgroundColor({color:[255,255,255,100]})
  chrome.browserAction.setBadgeText({text:"1"})
  //*/


// -- Upgrading --------------------------------------------------------------------------------------------------------

(function() {
  chrome.storage.sync.get('version', function(db) {
    if ( !db.version ) {
      db.version = JSON.parse(localStorage.getItem("--version")) || "0.0.0";
    }

    function compareVersions(a,b) {
      var aParts = a.split('.'),
          bParts = b.split('.'),
          minParts = Math.min(aParts.length, bParts.length),
          i = 0;
      for ( i = 0; i < minParts; i++ ) {
        a = parseInt(aParts[i]);
        b = parseInt(bParts[i]);
        if ( a !== b ) {
          return a < b ? -1 : 1;
        }
      }
      if ( aParts.length !== bParts.length ) {
        return aParts.length < bParts.length ? -1 : 1;
      }
      return 0;
    }

    core.manifest(function(manifest) {
      if ( compareVersions(db.version, manifest.version) !== 0 ) {

        (function() {
          // These probably should be under 0.7, but too late to move them
          var old = {},
              modules = {};

          if ( compareVersions(db.version, '0.7') < 0 ) {
            modules.youMightLike = {
              db: JSON.parse(localStorage.getItem('module-db--you-might-like')) || {}
            };
            modules.recentlyVisited = {
              db: JSON.parse(localStorage.getItem('module-db--recently-visited')) || {}
            };

            old.settings = JSON.parse(localStorage.getItem("settings"));
            if ( old.settings ) {
              if ( old.settings.hideYouMightLike !== undefined ) {
                modules.youMightLike.db.hide = old.settings.hideYouMightLike;
                delete old.settings.hideYouMightLike;
              }
              if ( old.settings.numRecentlyVisitedRows !== undefined ) {
                modules.recentlyVisited.db.maxRowCount = old.settings.numRecentlyVisitedRows;
                delete old.settings.numRecentlyVisitedRows;
              }
            }

            old.recentlyVisited = JSON.parse(localStorage.getItem("recentlyVisited"));
            if ( old.recentlyVisited ) {
              modules.recentlyVisited.db.recentlyVisited = old.recentlyVisited;
              localStorage.removeItem("recentlyVisited");
            }

            localStorage.removeItem("visits");

            localStorage.setItem('module-db--you-might-like', JSON.stringify(modules.youMightLike.db));
            localStorage.setItem('module-db--recently-visited', JSON.stringify(modules.recentlyVisited.db));
          }

          old.count = 0;
          for ( old.key in old.settings ) {
            old.count++;
          }
          if ( old.count === 0 ) {
            localStorage.removeItem("settings");
          } else {
            localStorage.setItem("settings", JSON.stringifyold.settings);
          }

        })();

        if ( compareVersions(db.version, '0.8') < 0 ) {
          // Move all settings into chrome's sync storage
          (function() {
            localStorage.removeItem('--version');

            var db = {},
                modules = [ 'people-summary', 'recently-visited', 'you-might-like' ];

            modules.forEach(function(id) {
              var data = JSON.parse(localStorage.getItem('module-db--'+id));
              if ( data ) {
                db['module-db--'+id] = data;
              }
            });

            chrome.storage.sync.set(db);

          })();
        }

        if ( compareVersions(db.version, '0.10') < 0 ) {
          // Recently visited had some urls with extra query params
          // so chopping them all off now
          (function() {
            chrome.storage.sync.get('module-db--recently-visited', function(db) {
              var recentlyVisited = db['module-db--recently-visited'],
                  visitLog = recentlyVisited ? recentlyVisited.recentlyVisited : null;
              if ( visitLog ) {
                // Reformat any urls
                visitLog.forEach(function(profile) {
                  profile.url = profile.url.replace(/\?.+$/, '');
                });
                // Remove any dupes
                visitLog.reverseForEach(function(olderProfile, i) {
                  var newerProfile, x;
                  for ( x = i - 1; x >= 0; x-- ) {
                    newerProfile = visitLog[x];
                    if ( newerProfile.url === olderProfile.url ) {
                      visitLog.splice(i, 1);
                      break;
                    }
                  }
                });
                // Save back to storage
                chrome.storage.sync.set(db);
              }
            });
          })();
        }

        chrome.storage.sync.set({version: manifest.version});
      }
    });
  });
})();

})();
