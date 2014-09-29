'use strict';

var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var minimatch = require('minimatch');
var path = require('path');
var runSequence = require('run-sequence');
var config = require('../src/flavor/ProductFlavors').generateFlavoredConfig();

gulp.task('watch', ['serve'], function(done) {
  gulp.watch('src/**/*.*', function(event) {
    // Synchronize added and deleted files.
    var distpath = path.join(
      'dist',
      path.relative(path.join(process.cwd(), 'src'), event.path)
    );
    if (event.type === 'deleted') {
      fs.unlink(distpath);
      gutil.log(gutil.colors.red('Deleted'), event.path);
      return;
    }
    if (event.type === 'added') {
      gutil.log(gutil.colors.green('Added'), event.path);
      gulp.src(event.path)
        .pipe(gulp.dest(path.dirname(distpath)));
      return;
    }

    // Watch tasks known files types.
    var filepath = path.relative(process.cwd(), event.path);
    if (is(filepath, config.globHtml)) {
      runSequence('templates:html');
    } else if (is(filepath, config.globMarkdown)) {
      runSequence('templates:markdown');
    } else if (is(filepath, config.globImage)) {
      runSequence('images');
    } else if (is(filepath, config.globIconfont)) {
      runSequence('fonts');
    } else if (is(filepath, config.globScript)) {
      runSequence('scripts', 'templates');
    } else if (is(filepath, config.globScss)) {
      runSequence('styles:scss', 'templates');
    } else if (is(filepath, config.globStyle)) {
      runSequence('styles:css', 'templates');
    } else if (is(filepath, path.join('..', config.globTemplate))) {
      runSequence('templates:soy');
    } else {
      runSequence('build');
    }
  });

  if (config.translationsFilepath) {
    gulp.watch(config.translationsFilepath.replace('{LOCALE}', '*'), ['templates']);
  }
});

function is(filepath, glob) {
  return minimatch(filepath, path.join('src/public', glob));
}
