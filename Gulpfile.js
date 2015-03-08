'use strict';

var gulp       = require('gulp'),
    bump       = require('gulp-bump'),
    concat     = require('gulp-concat'),
    del        = require('del'),
    livereload = require('gulp-livereload'),
    mocha      = require('gulp-mocha'),
    newer      = require('gulp-newer'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify     = require('gulp-uglify');

gulp.task('build', function() {
  gulp.src('storage.js')
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(concat('storage.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('.'));
  gulp.src('package.json')
    .pipe(bump({type: 'prerelease'}))
    .pipe(gulp.dest('.'));
});

gulp.task('test', function() {
  return gulp.src('spec.js', {read: false})
    .pipe(mocha());
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('storage.js').on('change', livereload.changed);
  gulp.watch(['storage.js', 'spec.js'], ['test']);
});

gulp.task('default', ['test', 'watch']);