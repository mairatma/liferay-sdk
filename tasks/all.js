'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('all', function(done) {
  runSequence('clean', 'build', done);
});
