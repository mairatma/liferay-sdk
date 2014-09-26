'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var pipelines = require('../src/utils/pipelines');
var AppEventEmitter = require('../src/app/AppEventEmitter');
var config = require('../src/flavor/ProductFlavors').generateFlavoredConfig();

gulp.task('build-compass', function() {
  return gulp.src(config.globScss)
    .pipe(plugins.plumber(pipelines.logError))
    .pipe(plugins.compass({
      config_file: 'src/public/styles/config.rb',
      css: 'dist/public/styles',
      image: 'dist/public/images',
      logging: true,
      sass: 'src/public/styles'
    }))
    .pipe(plugins.if(config.optimizeStyle, pipelines.buildCss()))
    .pipe(gulp.dest('dist/public/styles'));
});

gulp.task('build-copy', function() {
  return gulp.src('src/**').pipe(gulp.dest('dist')).on('end', function() {
    AppEventEmitter.emit('resourcesUpdated');
  });
});

gulp.task('build-styles', function() {
  return gulp.src(config.globStyle)
    .pipe(plugins.plumber(pipelines.logError))
    .pipe(plugins.if(config.optimizeStyle, pipelines.buildCss()))
    .pipe(gulp.dest('dist/public'));
});

gulp.task('build-html', function() {
  return gulp.src([config.globHtml, config.globMarkdown, config.globTemplate])
    .pipe(plugins.plumber(pipelines.logError))
    .pipe(plugins.if(config.optimizeHtmlResource, pipelines.buildHtmlResources()))
    .pipe(plugins.ignore.include('**/*.{css,js,html}'))
    .pipe(plugins.if(config.optimizeStyle, pipelines.buildCss()))
    .pipe(plugins.if(config.optimizeScript, pipelines.buildJavaScript()))
    .pipe(plugins.if(config.optimizeHtml, pipelines.buildHtml()))
    .pipe(gulp.dest('dist/public'));
});

gulp.task('build-icons', function() {
  return gulp.src(config.globIcon)
    .pipe(plugins.plumber(pipelines.logError))
    .pipe(plugins.iconfontCss({
      fontName: 'icons',
      fontPath: '../images/icons/',
      path: 'src/public/styles/.icons',
      targetPath: '../../styles/icons.css'
    }))
    .pipe(plugins.iconfont({
      fontName: 'icons',
      normalize: true,
      log: function() {}
    }))
    .pipe(plugins.if(config.optimizeStyle, pipelines.buildCss()))
    .pipe(gulp.dest('dist/public/images/icons'));
});

gulp.task('build-images', function() {
  return gulp.src(config.globImage)
    .pipe(plugins.plumber(pipelines.logError))
    .pipe(plugins.if(config.optimizeImage, plugins.imagemin({
      interlaced: true,
      progressive: true
    })))
    .pipe(gulp.dest('dist/public'));
});

gulp.task('build-markdown', function() {
  return gulp.src([config.globMarkdown, config.globTemplate])
    .pipe(plugins.plumber(pipelines.logError))
    .pipe(plugins.if(config.optimizeHtmlResource, pipelines.buildHtmlResources()))
    .pipe(plugins.ignore.exclude('**/*.{css,js,html}'))
    .pipe(plugins.frontMatter())
    .pipe(plugins.if(config.outputMarkdownAsHtml, pipelines.buildMarkdown()))
    .pipe(plugins.if(config.applyFrontMatterVariables, pipelines.buildFrontMatter()))
    .pipe(plugins.if(config.optimizeHtml, pipelines.buildHtml()))
    .pipe(gulp.dest('dist/public'));
});

gulp.task('build-scripts', function() {
  return gulp.src(config.globScript)
    .pipe(plugins.plumber(pipelines.logError))
    .pipe(plugins.if(config.optimizeScript, pipelines.buildJavaScript()))
    .pipe(gulp.dest('dist/public'));
});

gulp.task('build-templates', function() {
  return gulp.src(config.globTemplate)
    .pipe(plugins.plumber(pipelines.logError))
    .pipe(plugins.if(config.optimizeHtmlResource, pipelines.buildHtmlResources()))
    .pipe(plugins.ignore.exclude('**/*.{css,js,html}'))
    .pipe(plugins.soynode({
      loadCompiledTemplates: true,
      locales: config.defaultLocale ? [config.defaultLocale] : null,
      messageFilePathFormat: config.translationsFilepath,
      renderSoyWeb: config.outputTemplateAsHtml,
      renderSoyWebContext: {
        config: config
      }
    }))
    .pipe(plugins.if(!config.outputTemplateAsJavascript, plugins.ignore.exclude('*.soy.js')))
    .pipe(plugins.if(config.optimizeHtml, pipelines.buildHtml()))
    .pipe(gulp.dest('dist'));
});

gulp.task('build', function(done) {
  runSequence('build-copy', 'build-images', 'build-icons', 'build-scripts', 'build-styles', 'build-compass', 'build-html', 'build-markdown', 'build-templates', done);
});
