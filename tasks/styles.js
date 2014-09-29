'use strict';

var gulp = require('gulp');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var config = require('../src/flavor/ProductFlavors').generateFlavoredConfig();

gulp.task('styles:css', function() {
  return gulp.src(path.join('src/public/styles', config.globStyle))
    .pipe(plugins.if(config.optimizeStyle, plugins.autoprefixer(config.autoprefixer)))
    .pipe(plugins.if(config.optimizeStyle, plugins.csso()))
    .pipe(gulp.dest('dist/public/styles'));
});

gulp.task('styles:scss', function() {
  return gulp.src(path.join('src/public/styles', config.globScss))
    .pipe(plugins.compass(config.compass))
    .pipe(plugins.ignore.include('*.css'))
    .pipe(plugins.if(config.optimizeStyle, plugins.autoprefixer(config.autoprefixer)))
    .pipe(plugins.if(config.optimizeStyle, plugins.csso()))
    .pipe(gulp.dest('dist/public/styles'));
});

gulp.task('styles', ['styles:css', 'styles:scss']);
