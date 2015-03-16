'use strict';

var gulp       = require('gulp'),
    bump       = require('gulp-bump'),
    concat     = require('gulp-concat'),
    cssmin     = require('gulp-cssmin'),
    del        = require('del'),
    fs         = require('fs'),
    htmlmin    = require('gulp-htmlmin'),
    http       = require('http'),
    https      = require('https'),
    livereload = require('gulp-livereload'),
    newer      = require('gulp-newer'),
    nunjucks   = require('gulp-nunjucks-html'),
    run        = require('run-sequence'),
    preprocess = require('gulp-preprocess'),
    sass       = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    spawn      = require('child_process').spawn,
    uglify     = require('gulp-uglify'),
    zip        = require('gulp-zip'),
    prod       = false,
    path       = {
      app: {
        css: [
          'src/lib/**/*.css', 'src/app/**/*.scss'
        ],
        js: [
          'src/lib/jquery/**/*.js', 'src/lib/**/*.js',
          'src/app/prototype.js', 'src/app/core.js',
          'src/app/core.error.js',
          'src/app/core.*.js',
          'src/app/bc.js',
          'src/app/util/**/*.js',
          'src/app/bc.*.js',
          'src/app/**/*.js'
        ]
      },
      assets: [
        'src/assets/**/*', 'src/*.json', '!src/changelog.json'
      ],
      background: {
        js: [
          'src/background/background.js', 'src/modules/**/*.background.js'
        ]
      },
      doc: {
        js: [
          'src/**/*.js', '!src/lib/**'
        ]
      },
      options: {
        css: [
          'src/options/options.scss', 'src/modules/**/*.options.scss'
        ],
        html: [
          'src/options/options.html'
        ],
        js: [
          'src/options/options.js', 'src/modules/**/*.options.js'
        ]
      },
      scripts: {
        css: [
          'src/modules/**/*.scripts.scss'
        ],
        js: [
          'src/modules/**/*.scripts.js'
        ]
      },
      test: {
        css: [
          'node_modules/mocha/mocha.css'
        ],
        html: [
          'test/test.html'
        ],
        js: [
          'node_modules/chai/chai.js',
          'node_modules/mocha/mocha.js',
          'test/test.init.js',
          'test/**/*.js',
          'test/test.run.js'
        ]
      }
    };

// Optional dependencies...
var open;
try {
  open = require('opener');
} catch ( err ) {
  // fail silently
}
if ( !open ) {
  open = function() {
    console.log(
      'Notice: You may run `npm install -g opener` if you wish for this ' +
      'command to automatically open the resource in your browser.'
    );
  };
}

var throttles = {};
var throttle_int;
function throttle(key, fn) {
  if ( !throttles[key] ) {
    throttles[key] = {
      key: key
    };
  }
  throttles[key].fn = fn;
  throttles[key].requested_at = Date.now();
  if ( Object.keys(throttles).length === 1 ) {
    throttle_int = setInterval(function() {
      var now = Date.now(),
          k;
      for ( k in throttles ) {
        if ( now > throttles[k].requested_at + 100 ) {
          throttles[k].fn();
          delete throttles[k];
          break;
        }
      }
      if ( Object.keys(throttles).length === 0 ) {
        clearInterval(throttle_int);
      }
    }, 100);
  }
}

function exec(cmd, callback) {
  var process = require('child_process').exec(cmd);
  process.stdout.on('data', console.log);
  process.stderr.on('data', console.log);
  process.on('error', function(error) {
    console.error(error.stack || error.message);
  });
  process.on('close', function(code) {
    callback(code);
  });
  return process;
}

function downloadFile(url, path, done) {
  var file = fs.createWriteStream(path),
      module = url.indexOf('https') > -1 ? https : http;
  module.get(url, function(res) {
    res.on('data', function(chunk) {
      file.write(chunk);
    }).on('end', function() {
      file.end();
      done();
    });
  });
}

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
      modules = require('./src/modules.json'),
      changelog = require('./src/changelog.json');

  manifest.modules = modules;
  manifest.changelog = changelog;

  modules.forEach(function(module) {
    if ( module.depends ) {
      module.depends.map(function(dep) {
        var i = modules.length - 1;
        for ( ; i >= 0; i-- ) {
          if ( modules[i].id === dep ) {
            return modules[i];
          }
        }
        return { id: dep, name: dep };
      });
    }
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
        //prod && sourcemaps.init(),
        concat(file),
        sass(),
        prod && cssmin(),
        //prod && sourcemaps.write('.'),
        gulp.dest('dist')
      ];
    } else if ( key === 'html' ) {
      return [
        preprocess({ context: { DEV: !prod }}),
        nunjucks({
          locals: {
            manifest: getManifest()
          },
          searchPaths: ['src'],
          setUp: function(env) {
            env.addFilter('version', function(version) {
              var res = /^\d+\.\d+/.exec(version);
              if ( res && res.length ) {
                return res[0];
              }
              return version;
            });
            return env;
          }
        }),
        htmlmin({
          removeComments: true,
          collapseWhitespace: true
        }),
        gulp.dest('dist')
      ];
    } else if ( key === 'js' ) {
      return [
        //prod && sourcemaps.init(),
        concat(file),
        preprocess({ context: { DEV: !prod }}),
        prod && uglify({preserveComments: 'some'}),
        //prod && sourcemaps.write('.'),
        gulp.dest('dist')
      ]
    }
  }
  return key;
}

function build(file, pipes) {
  var keys, key, src, dest;
  if ( typeof file === 'string' ) {
    dest = file;
    keys = file.split(/\./g);
    key = keys.pop();
    src = path;
    keys.forEach(function(key) {
      if ( src[key] ) {
        src = src[key];
      }
    });
    if ( prod ) {
      src = src[key].concat(['!src/lib/livejs/**']);
    } else {
      src = src[key];
    }
    src = gulp.src(src);
  } else {
    src = file;
    dest = pipes;
    pipes = pipes.split(/\./g)[1];
  }
  getPipes(pipes || key, dest).forEach(function(pipe) {
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

gulp.task('build-doc', function(done) {
  build('doc.js').on('end', function() {
    exec('jsdoc dist/doc.js -d docs', done);
  });
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

gulp.task('build-test', function() {
  build('test.css');
  build('test.html');
  build('test.js');
});

gulp.task('build', function(done) {
  run(
    'clean',
    [
      'build-app',
      'build-assets',
      'build-background',
      'build-options',
      'build-scripts',
      'build-doc',
      'build-test'
    ],
    done
  );
});

gulp.task('build-prod', function(done) {
  prod = true;
  run('build', done);
});

gulp.task('clean', function(done) {
  del(['dist/**/*', 'docs/**/*'], done);
});

gulp.task('package', function(done) {
  run('build-prod', function() {
    var manifest = getManifest();
    setTimeout(function() {
      gulp.src('dist/**', '!dist/doc.js', '!dist/test.*')
        .pipe(zip(manifest.name+'-'+manifest.version+'.zip'))
        .pipe(gulp.dest('.'));
      done();
    }, 1000);
  });
});

gulp.task('update-resources', function(done) {
  var count = 0,
      changelog,
      about;
  function checkDone() {
    count++;
    if ( count == 2 ) {
      done();
    }
  }

  downloadFile(
    'https://github.com/michaeldrotar/Better-Cupid/wiki/Changelog',
    'src/options/changelog.html',
    checkDone
  );

  downloadFile(
    'https://github.com/michaeldrotar/Better-Cupid/wiki/About',
    'src/options/about.html',
    checkDone
  );
});

gulp.task('watch', ['build'], function() {
  gulp.watch(path.app.css,       ['build-app']);
  gulp.watch(path.app.js,        ['build-app']);
  gulp.watch(path.assets,        ['build-assets']);
  gulp.watch(path.background.js, ['build-background']);
  gulp.watch(['src/*.json'],     ['build-options']);
  gulp.watch(path.options.css,   ['build-options']);
  gulp.watch(path.options.js,    ['build-options']);
  gulp.watch(path.options.html,  ['build-options']);
  gulp.watch(path.scripts.css,   ['build-scripts']);
  gulp.watch(path.scripts.js,    ['build-scripts']);
  gulp.watch(path.doc.js,        ['build-doc']);
  gulp.watch(path.test.js,       ['build-test']);

  livereload.listen();
  gulp.watch([
    'test/test.html',
    'docs/**',
    'dist/**', '!dist/doc.js'
  ]).on('change', function() {
    livereload.changed.apply(this, arguments);
  });

  gulp.watch([
    'test/test.html',
    'dist/**', '!dist/doc.js'
  ]).on('change', function() {
    throttle('reload-extension', function() {
      //open('http://reload.extensions?extensions=BetterCupid^&refreshTabs=true');
    });
  });
});

gulp.task('default', ['watch']);
