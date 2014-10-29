'use strict';

var gulp = require('gulp');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var execFile = require('child_process').execFile;

gulp.task('test:integration', function(done) {
  var args = ['test/integration/**/*.js', '--slow', '1000', '--timeout', '3000'];
  var config = {
    stdio: 'inherit'
  };

  var localMocha = path.join(process.cwd(), 'node_modules', '.bin', 'mocha');

  var child = execFile(localMocha, args, config, function() {
    done();
  });
  child.stdout.pipe(process.stdout);
});

gulp.task('test:unit', function() {
  return gulp.src(['test/unit/**/*.js', '!test/unit/**/fixture/**/*.js'])
    .pipe(plugins.mocha());
});

gulp.task('test', ['test:unit', 'test:integration']);
