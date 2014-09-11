'use strict';

var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var madvoc = require('madvoc-route');
var path = require('path');
var App = require('../src/app/App');
var AppEventEmitter = require('../src/app/AppEventEmitter');
var SoyTemplateEngine = require('../src/template/SoyTemplateEngine');
var config = require('../src/flavor/ProductFlavors').generateFlavoredConfig();

gulp.task('serve', ['build'], function() {
  var app = new App();

  var templateEngine = new SoyTemplateEngine();
  templateEngine.setTranslationsFilePath(config.translationsFilepath);
  app.setTemplateEngine(templateEngine);

  app.setRouteFormat(config.routeFormat);

  var routesFilepath = 'dist/routes.txt';
  if (fs.existsSync(routesFilepath)) {
    gutil.log('Routing', gutil.colors.cyan(routesFilepath));
    app.setRouteConfigurator(new madvoc.RouteConfigurator(routesFilepath));
  }

  gutil.log('Serving static', gutil.colors.cyan('public/'));
  app.serveStatic('/', path.join(process.cwd(), 'dist/public'));

  if (config.defaultLocale) {
    gutil.log('Setting locale', gutil.colors.cyan(config.defaultLocale));
    app.setLocale(config.defaultLocale);
  }

  gutil.log('Compiling templates in', gutil.colors.cyan('dist/'));
  app.getTemplateEngine().compileTemplates('dist', app.getLocale(), {}, function() {
    app.start();
    gutil.log('Serving', gutil.colors.cyan('http://localhost:' + app.getServerPort()));
  });

  AppEventEmitter.on('resourcesUpdated', function() {
    gutil.log('Rerouting', gutil.colors.cyan('routes.txt'));
    app.setRouteConfigurator(new madvoc.RouteConfigurator('dist/routes.txt'));

    gutil.log('Serving static', gutil.colors.cyan('public/'));
    app.serveStatic('/', path.join(process.cwd(), 'dist/public'));

    gutil.log('Clearing class loader cache');
    app.getClassLoader().clearCache();
  });
});
