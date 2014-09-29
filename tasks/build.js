'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');

gulp.task('build', function(done) {
  runSequence('copy', ['images', 'fonts', 'scripts', 'styles', 'templates'], done);
});
