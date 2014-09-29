'use strict';

var gulp = require('gulp');
var runSequence = require('run-sequence');
var AppEventEmitter = require('../src/app/AppEventEmitter');

gulp.task('build', function(done) {
  runSequence('copy', ['images', 'fonts', 'scripts', 'styles', 'templates'], function() {
    AppEventEmitter.emit('resourcesUpdated');
    done();
  });
});
