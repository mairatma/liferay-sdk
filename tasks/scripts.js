'use strict';

var gulp = require('gulp');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var config = require('../src/flavor/ProductFlavors').generateFlavoredConfig();

gulp.task('scripts', function() {
  return gulp.src(path.join('src/public/scripts', config.globScript))
    .pipe(plugins.if(config.optimizeScript, plugins.uglify(config.uglify)))
    .pipe(gulp.dest('dist/public/scripts'));
});
