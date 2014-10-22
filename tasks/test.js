'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var spawn = require('child_process').spawn;

gulp.task('test', function() {
  return gulp.src(['test/unit/**/*.js', '!test/unit/**/fixture/**/*.js'])
    .pipe(plugins.mocha());
});

gulp.task('test:integration', function(callback) {
  var args = ['test/integration/**/*.js', '--slow', '1000', '--timeout', '3000'];
  var config = {
    stdio: 'inherit'
  };

  spawn('mocha', args, config)
    .on('exit', function() {
      if (callback) {
        callback();
      }
    });
});
