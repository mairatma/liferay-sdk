'use strict';

var fs = require('fs');
var gutil = require('gulp-util');
var madvoc = require('madvoc-route');
var path = require('path');
var App = require('./App');
var AppEventEmitter = require('./AppEventEmitter');
var config = require('../flavor/ProductFlavors').generateFlavoredConfig();
var SoyTemplateEngine = require('../template/SoyTemplateEngine');

/**
 * Responsible for instantiating and running an app.
 * @param {App} opt_app The app to be instantiated
 * @constructor
 */
function AppRunner(opt_app) {
  this.setApp(opt_app || new App());
}

/**
 * The filepath of the routes configuration.
 * @type {String}
 * @static
 */
AppRunner.ROUTES_FILEPATH = 'dist/routes.txt';

/**
 * The app this runner is responsible for.
 * @type {App}
 */
AppRunner.prototype.app = null;

/**
 * Flag indicating if the runner's logs should be muted.
 * @type {Boolean}
 * @default false
 */
AppRunner.prototype.mute = false;

/**
 * Gets the app.
 * @return {App}
 */
AppRunner.prototype.getApp = function() {
  return this.app;
};

/**
 * Gets the mute flag.
 * @return {Boolean}
 */
AppRunner.prototype.getMute = function() {
  return this.mute;
};

/**
 * Logs the message, unless `mute` is set to true.
 */
AppRunner.prototype.log = function() {
  if (!this.getMute()) {
    gutil.log.apply(gutil, arguments);
  }
};

/**
 * Fired on the `resourcesUpdated` event. Reroutes the up and clears the class
 * loader's cache.
 */
AppRunner.prototype.onResourcesUpdated = function() {
  this.setUpRoutes();

  this.log('Clearing class loader cache');
  this.getApp().getClassLoader().clearCache();
};

/**
 * Runs the app.
 */
AppRunner.prototype.run = function() {
  var instance = this;
  var app = this.getApp();

  var templateEngine = new SoyTemplateEngine();
  templateEngine.setTranslationsFilePath(config.translationsFilepath);
  app.setTemplateEngine(templateEngine);

  app.setRouteFormat(config.routeFormat);

  this.setUpRoutes();

  if (config.defaultLocale) {
    this.log('Setting locale', gutil.colors.cyan(config.defaultLocale));
    app.setLocale(config.defaultLocale);
  }

  this.log('Compiling templates in', gutil.colors.cyan('dist/'));
  templateEngine.compileTemplates('dist', app.getLocale(), {}, function() {
    app.start();
    instance.log('Serving', gutil.colors.cyan('http://localhost:' + app.getServerPort()));
  });

  this.resourcesUpdatedListener = this.onResourcesUpdated.bind(this);
  AppEventEmitter.on('resourcesUpdated', this.resourcesUpdatedListener);
};

/**
 * Sets the app.
 * @param {App} app
 */
AppRunner.prototype.setApp = function(app) {
  this.app = app;
};

/**
 * Sets the mute flag.
 * @param {Boolean} mute
 */
AppRunner.prototype.setMute = function(mute) {
  this.mute = mute;
};

/**
 * Throws away all previous routes and makes the app start listening for the new
 * routes instead.
 */
AppRunner.prototype.setUpRoutes = function() {
  var app = this.getApp();

  if (fs.existsSync(AppRunner.ROUTES_FILEPATH)) {
    this.log('Routing', gutil.colors.cyan(AppRunner.ROUTES_FILEPATH));
    app.setRouteConfigurator(new madvoc.RouteConfigurator(AppRunner.ROUTES_FILEPATH));
  }

  this.log('Serving static', gutil.colors.cyan('public/'));
  app.serveStatic('/', path.join(process.cwd(), 'dist/public'));
};

/**
 * Stops the app and removes all AppEventEmitter listeners.
 */
AppRunner.prototype.stop = function() {
  this.getApp().stop();

  if (this.resourcesUpdatedListener) {
    AppEventEmitter.removeListener('resourcesUpdated', this.resourcesUpdatedListener);
  }
};

module.exports = AppRunner;
