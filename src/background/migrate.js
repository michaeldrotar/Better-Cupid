(function() {
  var util = bc.util,
      migrations;
  migrations = [
    { version: '0.8', run: function(done) {
      // Move all settings into chrome's sync storage
      localStorage.removeItem('--version');

      var db = {},
          modules = [
            'people-summary',
            'recently-visited',
            'you-might-like'
          ];

      modules.forEach(function(id) {
        var data = JSON.parse(localStorage.getItem('module-db--'+id));
        if ( data ) {
          db['module-db--'+id] = data;
        }
      });

      chrome.storage.sync.set(db, done);
    }},
    { version: '0.10', run: function(done) {
      // The module data wasn't cleared in 0.8 after being migrated,
      // do it here to clean it up
      util.each(
        ['people-summary', 'recently-visited', 'you-might-like'],
        function(id) {
          localStorage.removeItem('module-db--'+id);
        }
      );

      // Move everything to local chrome storage, simplify the module
      // keys and fix the urls stored by recently-visited to not
      // include any query params
      chrome.storage.sync.get(function(db) {
        var recentlyVisited = db['module-db--recently-visited'],
            visitLog = recentlyVisited ? recentlyVisited.recentlyVisited : null;
        if ( visitLog ) {
          // Reformat any urls and add username
          visitLog.forEach(function(profile) {
            profile.url = profile.url.replace(/\?.+$/, '');
            profile.username = profile.url.substring(profile.url.lastIndexOf('/')+1);
          });
          // Remove any dupes
          visitLog = util.remove(visitLog, function(olderProfile, i) {
            if ( i > 0 ) {
              return util.each(visitLog, 0, i-1, function(newerProfile) {
                if ( newerProfile.url === olderProfile.url ) {
                  return true;
                }
              });
            }
          });
          // Store the data back and rename key
          recentlyVisited.log = visitLog;
          delete recentlyVisited.recentlyVisited;
        }

        if ( recentlyVisited ) {
          // Rename some keys
          if ( recentlyVisited.visibleRowCount !== undefined ) {
            recentlyVisited.visible = recentlyVisited.visibleRowCount * 4;
            delete recentlyVisited.visibleRowCount;
          }
          if ( recentlyVisited.maxRowCount !== undefined ) {
            recentlyVisited.max = recentlyVisited.maxRowCount * 4;
            delete recentlyVisited.maxRowCount;
          }
        }

        // Simplify module keys
        var k;
        for ( k in db ) {
          if ( db.hasOwnProperty(k) ) {
            if ( k.indexOf('module-db--') === 0 ) {
              db[util.camelize(k.replace('module-db--', ''))] = db[k];
              delete db[k];
            }
          }
        }

        // Store back to local storage and remove sync storage
        chrome.storage.local.set(db, function() {
          chrome.storage.sync.clear(done);
        });
      });
    }}
  ];

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

  function migrate(version) {
    var manifest = bc.manifest;

    function migrationsDone() {
      chrome.storage.local.set({ bc: { version: manifest.version } });
    }

    if ( !version ) {
      migrationsDone();
    } else if ( compareVersions(version, manifest.version) !== 0 ) {
      (function() {
        var i = 0, l = migrations.length, runNextMigration;
        runNextMigration = function() {
          if ( i >= l ) {
            migrationsDone();
            return;
          }

          var migration = migrations[i];
          i++;
          if ( compareVersions(version, migration.version) < 0 ) {
            migration.run(runNextMigration);
          } else {
            setTimeout(runNextMigration, 1);
          }
        };
        runNextMigration();
      })();
    }
  }

  chrome.storage.local.get(function(db) {
    if ( db.version ) {
      migrate(db.version);
    } else {
      chrome.storage.sync.get(function(db) {
        if ( db.version ) {
          migrate(db.version);
        } else {
          migrate(JSON.parse(localStorage.getItem('--version')));
        }
      });
    }
  });
})();
