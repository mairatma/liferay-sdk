'use strict';

var gulp = require('gulp');
var minimatch = require('minimatch');
var path = require('path');
var runSequence = require('run-sequence');
var config = require('../src/flavor/ProductFlavors').generateFlavoredConfig();

gulp.task('watch', ['serve'], function(done) {
  gulp.watch('src/**/*.*', function(event) {
    var tasks = [];
    var filepath = path.relative(process.cwd(), event.path);

    if (minimatch(filepath, config.globHtml)) {
      tasks.push('build-html');
    } else if (minimatch(filepath, config.globIcon)) {
      tasks.push('build-icons');
    } else if (minimatch(filepath, config.globImage)) {
      tasks.push('build-images');
    } else if (minimatch(filepath, config.globMarkdown)) {
      tasks.push('build-globMarkdown');
    } else if (minimatch(filepath, config.globScript)) {
      tasks.push('build-scripts', 'build-html');
    } else if (minimatch(filepath, config.globScss)) {
      tasks.push('build-compass');
    } else if (minimatch(filepath, config.globStyle)) {
      tasks.push('build-styles', 'build-html');
    } else if (minimatch(filepath, config.globTemplate)) {
      tasks.push('build-templates');
    } else {
      tasks.push('build-copy', 'build-images', 'build-icons', 'build-scripts', 'build-styles', 'build-compass', 'build-html', 'build-markdown', 'build-templates');
    }

    runSequence.apply(runSequence, tasks);
  });

  if (config.translationsFilepath) {
    gulp.watch(config.translationsFilepath.replace('{LOCALE}', '*'), ['build-templates']);
  }
});
