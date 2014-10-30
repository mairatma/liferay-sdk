'use strict';

var execFile = require('child_process').execFile;
var gulp = require('gulp');
var path = require('path');
var requireDir = require('require-dir');
var dir = requireDir('./tasks');

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
  child.stderr.pipe(process.stderr);
});

gulp.task('test', ['test:unit', 'test:integration']);
