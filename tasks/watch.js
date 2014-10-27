'use strict';

var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var minimatch = require('minimatch');
var path = require('path');
var runSequence = require('run-sequence');
var config = require('../src/flavor/ProductFlavors').generateFlavoredConfig();

var task = gulp.task('watch', ['serve'], function(done) {
  gulp.watch('src/**/*', function(event) {
    // Synchronize added and deleted files.
    var distpath = path.join('dist',
      path.relative(path.join(process.cwd(), 'src'), event.path));

    if (event.type === 'deleted') {
      fs.unlink(distpath, changeHandled);
      gutil.log(gutil.colors.red('Deleted'), event.path);
      return;
    }
    if (event.type === 'added') {
      gutil.log(gutil.colors.green('Added'), event.path);
      gulp.src(event.path)
        .pipe(gulp.dest(path.dirname(distpath)))
        .on('end', changeHandled);
      return;
    }

    // Watch tasks known files types.
    var filepath = path.relative(process.cwd(), event.path);
    var globTranslations = config.translationsFilepath.replace('{LOCALE}', '*');
    if (is(filepath, config.globHtml)) {
      runSequence('templates:html', changeHandled);
    } else if (is(filepath, path.join('..', config.globMarkdown))) {
      runSequence('templates:markdown', changeHandled);
    } else if (is(filepath, path.join('fonts', config.globIconfont))) {
      runSequence('fonts', changeHandled);
    } else if (is(filepath, config.globImage)) {
      runSequence('images', changeHandled);
    } else if (is(filepath, config.globScript)) {
      runSequence('scripts', 'templates', changeHandled);
    } else if (is(filepath, config.globScss)) {
      runSequence('styles:scss', 'templates', changeHandled);
    } else if (is(filepath, config.globStyle)) {
      runSequence('styles:css', 'templates', changeHandled);
    } else if (is(filepath, path.join('..', config.globTemplate))) {
      runSequence('templates:soy', changeHandled);
    } else if (is(filepath, path.join('../..', globTranslations))) {
      runSequence('templates', changeHandled);
    } else {
      runSequence('build', changeHandled);
    }
  });
});

function is(filepath, glob) {
  return minimatch(filepath, path.join('src/public', glob));
}

function changeHandled() {
  task.emit('changeHandled');
}
