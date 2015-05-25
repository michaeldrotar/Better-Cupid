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
    through     = require('through2'),
    uglify      = require('gulp-uglify'),
    zip         = require('gulp-zip'),
    prod        = false;

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
        preprocess({ context: { DEV: !prod }}),
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

gulp.task('build-app-css', function() {
  return build('src/app/css/app.scss');
});

gulp.task('build-app-js', function() {
  return build('src/app/js/app.js');
});

gulp.task('build-assets', function() {
  return gulp.src('src/assets/**')
    .pipe(gulp.dest('dist'));
});

gulp.task('build-background', function() {
  return build('src/background/background.js');
});

gulp.task('build-icomoon-fonts', function() {
  return gulp.src('src/lib/icomoon/fonts/*')
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('build-manifest', function() {
  return gulp.src('src/manifest.json')
    .pipe(gulp.dest('dist'));
});

gulp.task('build-options-html', function() {
  return build('src/options/options.html');
});

gulp.task('build-options-js', function() {
  return build('src/options/options.js');
});

gulp.task('build', function(done) {
  run(
    'clean',
    [
      'build-app-css',
      'build-app-js',
      'build-assets',
      'build-background',
      'build-icomoon-fonts',
      'build-manifest',
      'build-options-html',
      'build-options-js'
    ],
    done
  );
});

gulp.task('build-prod', function(done) {
  prod = true;
  run('build', done);
});

gulp.task('build-readme', function() {
  gulp.src('README.md')
    .pipe(through.obj(function(file, enc, done) {
      var self = this,
          readme = file,
          contents = String(readme.contents),
          changelog = '';
      gulp.src('src/changelog.json')
        .pipe(through.obj(function(file, enc, cb) {
          var lines = [];
          JSON.parse(String(file.contents)).forEach(function(entry) {
            lines.push('');
            lines.push('### Version '+entry.version);
            lines.push(entry.date);
            if ( entry.sections ) {
              entry.sections.forEach(function(section) {
                lines.push('');
                lines.push('#### '+section.heading);
                if ( section.paragraphs ) {
                  section.paragraphs.forEach(function(paragraph) {
                    lines.push('');
                    lines.push(paragraph);
                  });
                }
                if ( section.notes ) {
                  lines.push('');
                  section.notes.forEach(function(note) {
                    lines.push('- '+note);
                  });
                }
              });
            }
          });
          changelog = lines.join('\n');

          contents = contents
              .replace(/(\r\n|\r)/g, '\n')
              .replace(/(\n\s*\#\#\s+changelog[^\n]*)[\s\S]+?(\n\s*\#\#\s+|$)/i, "$1\n"+changelog+"\n$2");

          cb();
          readme.contents = new Buffer(contents);
          self.push(readme);
          done();
        }))
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('clean', function(done) {
  del(['dist/**/*'], done);
});

gulp.task('package', ['build-prod'], function() {
  var manifest = require('./dist/manifest.json');
  return gulp.src('dist/**')
    .pipe(zip(manifest.name+'-'+manifest.version+'.zip'))
    .pipe(gulp.dest('.'));
});

gulp.task('watch', ['build', 'build-readme'], function() {
  gulp.watch('src/**/*', ['build']);
  gulp.watch('src/changelog.json', ['build-readme']);
});

gulp.task('default', ['watch']);
