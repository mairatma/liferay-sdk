'use strict';

var gulp = require('gulp');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var config = require('../src/flavor/ProductFlavors').generateFlavoredConfig();

gulp.task('images', function() {
  return gulp.src(path.join('src/public/images', config.globImage))
    .pipe(plugins.if(config.optimizeImage, plugins.imagemin({
      interlaced: true,
      progressive: true
    })))
    .pipe(gulp.dest('dist/public/images'));
});
