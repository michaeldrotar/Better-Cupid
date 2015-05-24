'use strict';

var gulp        = require('gulp'),
    cssmin      = require('gulp-cssmin'),
    del         = require('del'),
    htmlmin     = require('gulp-htmlmin'),
    include     = require('./gulp/include'),
    path        = require('path'),
    run         = require('run-sequence'),
    preprocess  = require('gulp-preprocess'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    uglify      = require('gulp-uglify'),
    zip         = require('gulp-zip'),
    prod        = false;

function getManifest() {
  // Cache the manifest for 1 second so that consecutive calls in the same
  // build don't keep re-building it .. do allow it to rebuild though
  // for when the json files are changed
  var now = Date.now(),
      expires = (getManifest.cacheTime || 0) + 1000;
  if ( getManifest.manifest && now < expires ) {
    return getManifest.manifest;
  }

  var manifest = JSON.parse(getFile('./src/manifest.json')),
      modules = JSON.parse(getFile('./src/modules.json')),
      changelog = JSON.parse(getFile('./src/changelog.json'));

  manifest.modules = modules;
  manifest.changelog = changelog;

  function getModule(id) {
    var mod;
    modules.forEach(function(module) {
      if ( module.id === id ) {
        mod = module;
      }
    });
    return mod;
  }

  function linkModuleProperty(module, property) {
    if ( module[property] ) {
      module[property] = module[property].map(function(id) {
        return getModule(id);
      });
    }
  }

  modules.forEach(function(module) {
    linkModuleProperty(module, 'needs');
    linkModuleProperty(module, 'wants');
    module.tabs = module.tabs || [ 'options' ];
    module.tabs = module.tabs.map(function(id) {
      var tab = { id: id };
      tab.name = id.replace(/(^\w|-\w)/g, function(match) {
        return match.replace('-', ' ').toUpperCase();
      });
      tab.filename = module.id+'.'+id+'.html';
      tab.content = getFile('src/modules/'+module.id+'/'+tab.filename);
      return tab;
    });
  });

  getManifest.manifest = manifest;
  getManifest.cacheTime = now;
  return manifest;
}

function getPipes(key) {
  if ( typeof key === 'string' ) {
    if ( key === 'scss' ) {
      return [
        //prod && sourcemaps.init(),
        include({rootPath: './src'}),
        sass(),
        prod && cssmin(),
        //prod && sourcemaps.write('.'),
        gulp.dest('dist')
      ];
    } else if ( key === 'html' ) {
      return [
        include(),
        preprocess({ context: { DEV: !prod }}),
        htmlmin({
          removeComments: true,
          collapseWhitespace: true,
          ignoreCustomComments: [
            /^\s+ko/,
            /\/ko\s+$/
          ]
        }),
        gulp.dest('dist')
      ];
    } else if ( key === 'js' ) {
      return [
        //prod && sourcemaps.init(),
        include({rootPath: './src'}),
        include({
          cmd: 'requirejs',
          rootPath: './src',
          item: {
            pre: '(function() { var exports;\n',
            post: '\nreturn exports;})()'
          },
          glob: {
            pre: '[',
            sep: ',',
            post: ']'
          }
        }),
        preprocess({ context: { DEV: !prod }}),
        include({
          cmd: 'requirejson',
          rootPath: './src'
        }),
        include({
          cmd: 'kotemplates',
          rootPath: './src',
          pipes: [
            htmlmin({collapseWhitespace: true})
          ],
          item: function(content, file) {
            var id;
            id = path.basename(file.path, '.html');
            id = 'bc-'+id.replace(/\./g, '-');
            return '\'<script type="text/html" id="'+id+'">'
              + content
                .replace(/(\r?\n|\r)/g, '\\n')
                .replace(/(')/g, '\\$1')
                .trim()
              + '</script>\'';
          },
          glob: {
            sep: "\n+"
          }
        }),
        prod && uglify({preserveComments: 'some'}),
        //prod && sourcemaps.write('.'),
        gulp.dest('dist')
      ]
    }
  }
  return key;
}

function build(file) {
  var ext, src;

  ext = file.split(/\./g);
  ext = ext[ext.length-1];

  src = gulp.src(file);
  getPipes(ext).forEach(function(pipe) {
    if ( pipe ) {
      src = src.pipe(pipe).on('error', function(error) {
        console.log('An error occured in ' + error.plugin);
        console.log(error.stack || error.message);
      });
    }
  });
  return src;
}

gulp.task('build-app', function() {
  build('src/app/css/app.scss');
  build('src/app/js/app.js');
});

gulp.task('build-assets', function() {
  gulp.src('src/assets/**')
    .pipe(gulp.dest('dist'));
  gulp.src('src/lib/icomoon/fonts/*')
    .pipe(gulp.dest('dist/fonts'));
  gulp.src('src/manifest.json')
    .pipe(gulp.dest('dist'));
});

gulp.task('build-background', function() {
  build('src/background/background.js');
});

gulp.task('build-options', function() {
  build('src/options/options.js');
  build('src/options/options.html');
});

gulp.task('build', function(done) {
  run(
    'clean',
    [
      'build-app',
      'build-assets',
      'build-background',
      'build-options'
    ],
    done
  );
});

gulp.task('build-prod', function(done) {
  prod = true;
  run('build', done);
});

gulp.task('build-readme', function() {
  var manifest = getManifest(),
      readme = getFile('README.md'),
      changelog = [];
  if ( readme ) {
    manifest.changelog.forEach(function(entry) {
      changelog.push('');
      changelog.push('### Version '+entry.version);
      changelog.push(entry.date);
      if ( entry.sections ) {
        entry.sections.forEach(function(section) {
          changelog.push('');
          changelog.push('#### '+section.heading);
          if ( section.paragraphs ) {
            section.paragraphs.forEach(function(paragraph) {
              changelog.push('');
              changelog.push(paragraph);
            });
          }
          if ( section.notes ) {
            changelog.push('');
            section.notes.forEach(function(note) {
              changelog.push('- '+note);
            });
          }
        });
      }
    });
    changelog = changelog.join('\n');

    readme = readme
        .replace(/(\r\n|\r)/g, '\n')
        .replace(/(\n\s*\#\#\s+changelog[^\n]*)[\s\S]+?(\n\s*\#\#\s+|$)/i, "$1\n"+changelog+"\n$2");

    fs.writeFile('README.md', readme);
  }
});

gulp.task('clean', function(done) {
  del(['dist/**/*'], done);
});

gulp.task('package', function(done) {
  run('build-prod', function() {
    var manifest = getManifest();
    setTimeout(function() {
      gulp.src('dist/**', '!dist/test.*')
        .pipe(zip(manifest.name+'-'+manifest.version+'.zip'))
        .pipe(gulp.dest('.'));
      done();
    }, 1000);
  });
});

gulp.task('watch', ['build'], function() {
  gulp.watch('src/**/*', ['build']);
});

gulp.task('default', ['watch']);
