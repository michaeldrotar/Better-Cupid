(function() {
  var migrations;
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
      // Move everything to local chrome storage, simplify the module
      // keys and fix the urls stored by recently-visited to not
      // include any query params
      chrome.storage.sync.get(function(db) {
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
          // Store the data back and rename key
          db['module-db--recently-visited'].log = visitLog;
          delete db['module-db--recently-visited'].recentlyVisited;

          // Create storage for basic stuff
          db.bc = {
            version: db.version
          };
          delete db.version;

          // Simplify module keys
          var k;
          for ( k in db ) {
            if ( db.hasOwnProperty(k) ) {
              if ( k.indexOf('module-db--') === 0 ) {
                db[k.replace('module-db--', '')] = db[k];
                delete db[k];
              }
            }
          }

          // Store back to local storage and remove sync storage
          chrome.storage.local.set(db, function() {
            chrome.storage.sync.clear(done);
          });
        }
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
    bc.manifest(function(manifest) {
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
    });
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
