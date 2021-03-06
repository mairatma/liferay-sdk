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
    var distpath = path.join('dist',
      path.relative(path.join(process.cwd(), 'src'), event.path));

    if (event.type === 'deleted') {
      updateDeletedFile(event.path, distpath);
    } else {
      updateChangedFile(event.path, distpath);
    }
  });
});

/**
 * Emits the `changeHandled` event for the watch task.
 */
function changeHandled() {
  task.emit('changeHandled');
}

/**
 * Checks if a filepath matches the given glob.
 * @param {String} filepath
 * @param {String} glob
 * @return {Boolean}
 */
function is(filepath, glob) {
  return minimatch(filepath, path.join('src/public', glob));
}

/**
 * Builds the necessary resources to keep the project's build files updated
 * after the changes to the given file.
 * @param {String} filepath
 * @param {String} distpath
 */
function updateChangedFile(filepath, distpath) {
  var globTranslations = config.translationsFilepath.replace('{LOCALE}', '*');
  filepath = path.relative(process.cwd(), filepath);
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
    gulp.src(filepath)
      .pipe(gulp.dest(path.dirname(distpath)))
      .on('end', changeHandled);
  }
}

/**
 * Removes the deleted file from the `dist` folder as well.
 * @param {String} filepath
 * @param {String} distpath
 */
function updateDeletedFile(filepath, distpath) {
  fs.unlink(distpath, changeHandled);
  gutil.log(gutil.colors.red('Deleted'), filepath);
}
