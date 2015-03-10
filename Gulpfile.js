'use strict';

var gulp       = require('gulp'),
    bump       = require('gulp-bump'),
    concat     = require('gulp-concat'),
    cssmin     = require('gulp-cssmin'),
    del        = require('del'),
    fs         = require('fs'),
    htmlmin    = require('gulp-htmlmin'),
    livereload = require('gulp-livereload'),
    newer      = require('gulp-newer'),
    nunjucks   = require('gulp-nunjucks-html'),
    //sass       = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify     = require('gulp-uglify'),
    prod       = false,
    path       = {
      app: {
        css: [
          'src/lib/**/*.css', 'src/app/**/*.css'
        ],
        js: [
          'src/lib/jquery/**.js', 'src/lib/**.js',
          'src/app/prototype.js', 'src/app/core.js', 'src/app/**.js'
        ]
      },
      assets: [
        'src/assets/**/*', 'src/*.json'
      ],
      background: {
        js: [
          'src/background/background.js', 'src/modules/**/*.background.js'
        ]
      },
      options: {
        css: [
          'src/options/options.css', 'src/modules/**/*.options.css'
        ],
        html: 'src/options/options.html',
        js: [
          'src/options/options.js', 'src/modules/**/*.options.js'
        ]
      },
      scripts: {
        css: [
          'src/modules/**/*.scripts.css'
        ],
        js: [
          'src/modules/**/*.scripts.js'
        ]
      }
    },
    res = {};

function buildResource(path, res) {
  var k;
  for ( k in path ) {
    if ( typeof path[k] === 'string' || Array.isArray(path[k]) ) {
      res[k] = gulp.src(path[k]);
    } else {
      res[k] = {};
      buildResource(path[k], res[k]);
    }
  }
}
buildResource(path, res);

function getManifest() {
  if ( getManifest.manifest ) {
    return getManifest.manifest;
  }
  
  function getFile(path) {
    try {
      return fs.readFileSync(path, 'utf8');
    } catch ( e ) {
      return '';
    }
  }
  
  var manifest = require('./src/manifest.json'),
      modules = require('./src/modules.json');
  manifest.modules = modules;
  modules.forEach(function(module) {
    module.depends.map(function(dep) {
      var i = modules.length - 1;
      for ( ; i >= 0; i-- ) {
        if ( modules[i].id === dep ) {
          return modules[i];
        }
      }
      return { id: dep, name: dep };
    });
    
    module.contents = {
      options: getFile('src/modules/'+module.id+'/'+module.id+'.options.html')
    };
  });
  
  getManifest.manifest = manifest;
  return manifest;
}

function getPipes(key, file) {
  if ( typeof key === 'string' ) {
    if ( key === 'css' ) {
      return [
        prod && sourcemaps.init(),
        concat(file),
        prod && cssmin(),
        prod && sourcemaps.write('.'),
        gulp.dest('dist')
      ];
    } else if ( key === 'html' ) {
      //nunjucks.nunjucks.configure(['./src']);
      return [
        nunjucks({
          locals: {
            manifest: getManifest()
          },
          searchPaths: ['src']
        }),
        htmlmin({
          removeComments: true,
          collapseWhitespace: true
        }),
        gulp.dest('dist')
      ];
    } else if ( key === 'js' ) {
      return [
        prod && sourcemaps.init(),
        concat(file),
        prod && uglify({preserveComments: 'some'}),
        gulp.dest('dist')
      ]
    }
  }
  return key;
}

function build(file, pipes) {
  var ret = res,
      keys = file.split(/\./g),
      key = keys.pop();
  keys.forEach(function(key) {
    if ( ret[key] ) {
      ret = ret[key];
    }
  });
  getPipes(pipes || key, file).forEach(function(pipe) {
    if ( pipe ) {
      ret[key] = ret[key].pipe(pipe).on('error', function(error) {
        console.log('oops!');
      });
    }
  });
  ret[key] = ret[key].on('error', function(error) {
    console.log('oops!');
  });
  return ret[key];
}

function build(file, pipes) {
  var keys = file.split(/\./g),
      key = keys.pop(),
      src = path;
  keys.forEach(function(key) {
    if ( src[key] ) {
      src = src[key];
    }
  });
  src = gulp.src(src[key]);
  getPipes(pipes || key, file).forEach(function(pipe) {
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
  build('app.css');
  build('app.js');
});

gulp.task('build-assets', function() {
  build('assets', [
    gulp.dest('dist')
  ]);
});

gulp.task('build-background', function() {
  build('background.js');
});

gulp.task('build-options', function() {
  build('options.css');
  build('options.js');
  build('options.html');
});

gulp.task('build-scripts', function() {
  build('scripts.css');
  build('scripts.js');
});

gulp.task('build', ['clean'], function() {
  return gulp.start([
    'build-app', 'build-assets',
    'build-background', 'build-options', 'build-scripts'
  ]);
});

gulp.task('build-prod', function() {
  prod = true;
  return gulp.start('build');
});

gulp.task('clean', function(done) {
  del(['dist/**/*'], done);
});

gulp.task('watch', ['build'], function() {
  livereload.listen();
  /*
  gulp.watch(path.app.css,       ['build-app']);
  gulp.watch(path.app.js,        ['build-app']);
  gulp.watch(path.assets,        ['build-assets']);
  gulp.watch(path.background.js, ['build-background']);
  gulp.watch(path.options.css,   ['build-options']);
  gulp.watch(path.options.js,    ['build-options']);
  gulp.watch(path.options.html,  ['build-options']);
  gulp.watch(path.scripts.css,   ['build-scripts']);
  gulp.watch(path.scripts.js,    ['build-scripts']);
  */
  gulp.watch('src/**', ['build']).on('error', function(error) {
    console.log(error);
  });
  gulp.watch('dist/**').on('change', livereload.changed);
});

gulp.task('default', ['watch']);