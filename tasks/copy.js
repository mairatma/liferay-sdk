'use strict';

var gulp = require('gulp');
var AppEventEmitter = require('../src/app/AppEventEmitter');

gulp.task('copy', function() {
  return gulp.src('src/**/*.*')
    .pipe(gulp.dest('dist'))
    .on('end', function() {
      AppEventEmitter.emit('resourcesUpdated');
    });
});
