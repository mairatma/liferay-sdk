'use strict';

var del = require('del');
var gulp = require('gulp');

gulp.task('clean', function(done) {
  del(['dist'], done);
});
