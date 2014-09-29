'use strict';

var gulp = require('gulp');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var config = require('../src/flavor/ProductFlavors').generateFlavoredConfig();

gulp.task('fonts', function() {
  return gulp.src(path.join('src/public/fonts', config.globIconfont))
    .pipe(plugins.iconfontCss(config.iconfontCss))
    .pipe(plugins.iconfont(config.iconfont))
    .pipe(plugins.if(config.globStyle, plugins.if(config.optimizeStyle, plugins.autoprefixer(config.autoprefixer))))
    .pipe(plugins.if(config.globStyle, plugins.if(config.optimizeStyle, plugins.csso())))
    .pipe(gulp.dest('dist/public/fonts'));
});
