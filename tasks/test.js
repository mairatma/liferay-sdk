'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

gulp.task('test:unit', function() {
  return gulp.src(['test/unit/**/*.js', '!test/unit/**/fixture/**/*.js'])
    .pipe(plugins.mocha());
});

gulp.task('test', ['test:unit']);
