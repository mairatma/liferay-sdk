'use strict';

var gulp = require('gulp');
var AppRunner = require('../src/app/AppRunner');

gulp.task('serve', ['all'], function() {
  var appRunner = new AppRunner();
  appRunner.run();
});
