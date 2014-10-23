'use strict';

var gulp = require('gulp');
var es = require('event-stream');
var plugins = require('gulp-load-plugins')();
var config = require('../src/flavor/ProductFlavors').generateFlavoredConfig();

gulp.task('format:scripts', function() {
  var scripts = gulp.src('src/' + config.globScript)
    .pipe(plugins.esformatter())
    .pipe(gulp.dest('src'));

  var tasks = gulp.src(['tasks/**/*.js'])
    .pipe(plugins.esformatter())
    .pipe(gulp.dest('tasks'));

  var tests = gulp.src('test/**/*.js')
    .pipe(plugins.esformatter())
    .pipe(gulp.dest('test'));

  return es.merge(scripts, tasks, tests);
});

gulp.task('format:styles', function() {
  var styles = gulp.src('src/' + config.globStyle)
    .pipe(plugins.csscomb())
    .pipe(plugins.cssbeautify({
      indent: '  '
    }))
    .pipe(gulp.dest('src'));

  var scss = gulp.src('src/' + config.globScss)
    .pipe(plugins.csscomb())
    .pipe(plugins.cssbeautify({
      indent: '  '
    }))
    .pipe(gulp.dest('src'));

  return es.merge(styles, scss);
});

gulp.task('format', ['format:scripts', 'format:styles']);
