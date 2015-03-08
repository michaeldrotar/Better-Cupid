'use strict';

var gulp       = require('gulp'),
    bump       = require('gulp-bump'),
    clean      = require('gulp-clean'),
    concat     = require('gulp-concat'),
    cssmin     = require('gulp-cssmin'),
    del        = require('del'),
    htmlmin    = require('gulp-htmlmin'),
    livereload = require('gulp-livereload'),
    newer      = require('gulp-newer'),
    //sass       = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify     = require('gulp-uglify');

gulp.task('build-assets', function() {
  return gulp.src([
      'src/assets/**',
      'src/manifest.json',
      'src/modules.json'
    ])
    .pipe(gulp.dest('dist'));
});

gulp.task('build-css', function() {
  return gulp.src([
      'src/lib/**.css',
      'src/app/**.css'
    ])
    .pipe(sourcemaps.init())
      .pipe(concat('main.css'))
      //.pipe(sass())
      .pipe(cssmin())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build-js-shared', function() {
  return gulp.src([
    'src/lib/bluebird/**.js', 'src/lib/jquery/**.js', 'src/lib/**.js',
    'src/app/prototype.js', 'src/app/core.js', 'src/app/**.js',
    '!src/app/background.js', '!src/app/options.js'
    ])
    .pipe(sourcemaps.init())
      .pipe(concat('shared.js'))
      .pipe(uglify({preserveComments: 'some'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build-js-background', function() {
  return gulp.src('src/app/background.js')
    .pipe(sourcemaps.init())
      .pipe(concat('background.js'))
      .pipe(uglify({preserveComments: 'some'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build-js-options', function() {
  return gulp.src('src/app/options.js')
    .pipe(sourcemaps.init())
      .pipe(concat('options.js'))
      .pipe(uglify({preserveComments: 'some'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build-js-modules', function() {
  return gulp.src('src/modules/**.js')
    .pipe(sourcemaps.init())
      .pipe(concat('modules.js'))
      .pipe(uglify({preserveComments: 'some'}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('build-js', ['build-js-shared', 'build-js-background', 'build-js-options', 'build-js-modules' ]);

gulp.task('build-html-background', function() {
  return gulp.src('src/app/background.html')
    .pipe(htmlmin())
    .pipe(gulp.dest('dist'));
});

gulp.task('build-html-options', function() {
  return gulp.src('src/app/options.html')
    .pipe(htmlmin())
    .pipe(gulp.dest('dist'));
});

gulp.task('build-html', ['build-html-background', 'build-html-options']);

gulp.task('build', ['build-assets', 'build-css', 'build-js', 'build-html']);

gulp.task('clean', function() {
  gulp.src('dist', {read: false})
    .pipe(clean());
});

/*
gulp.task('build', function() {
  gulp.src('storage.js')
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(concat('storage.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
  gulp.src('package.json')
    .pipe(bump({type: 'prerelease'}))
    .pipe(gulp.dest('.'));
});
*/

gulp.task('watch', ['build'], function() {
  livereload.listen();
  gulp.watch('src/**', ['build']);
  gulp.watch('dist/**').on('change', livereload.changed);
});

gulp.task('default', ['test', 'watch']);