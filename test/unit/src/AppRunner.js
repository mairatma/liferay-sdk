'use strict';

var assert = require('assert');
var fs = require('fs');
var gutil = require('gulp-util');
var madvoc = require('madvoc-route');
var mockery = require('mockery');
var path = require('path');
var sinon = require('sinon');
var App = require('../../../src/app/App');
var AppEventEmitter = require('../../../src/app/AppEventEmitter');
var AppRunner;
var ClassLoader = require('../../../src/utils/ClassLoader');
var ProductFlavors = require('../../../src/flavor/ProductFlavors');
var SoyTemplateEngine = require('../../../src/template/SoyTemplateEngine');

describe('AppRunner', function() {
  before(function() {
    this.sinon = sinon.sandbox.create();

    this.config = {};
    this.sinon.stub(ProductFlavors, 'generateFlavoredConfig').returns(this.config);

    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });
    mockery.registerMock('../template/SoyTemplateEngine', function() {
      return sinon.createStubInstance(SoyTemplateEngine);
    });
    mockery.registerMock('./App', function() {
      return sinon.createStubInstance(App);
    });

    // Only require the AppRunner here, as some of its dependencies need to have
    // already been stubbed/mocked before it loads.
    delete require.cache[path.resolve(process.cwd(), 'src/app/AppRunner.js')];
    AppRunner = require('../../../src/app/AppRunner');
  });

  beforeEach(function() {
    this.sinon.stub(fs, 'existsSync').returns(true);
    this.sinon.stub(gutil, 'log');
    this.sinon.stub(madvoc, 'RouteConfigurator', function() {
      return sinon.createStubInstance(madvoc.RouteConfigurator);
    });

    this.config.defaultLocale = 'pt_BR';
    this.config.routeFormat = 1;
    this.config.translationsFilepath = 'path/to/translations';
  });

  afterEach(function() {
    this.sinon.restore();

    if (this.appRunner) {
      this.appRunner.stop();
    }
  });

  it('should run an app', function() {
    var app = sinon.createStubInstance(App);
    this.appRunner = createAppRunner(app);

    this.appRunner.run();

    sinon.assert.calledWithExactly(app.setRouteFormat, this.config.routeFormat);
    sinon.assert.calledWithExactly(app.setLocale, this.config.defaultLocale);
    sinon.assert.calledOnce(app.setTemplateEngine);
    sinon.assert.calledOnce(app.setRouteConfigurator);
    sinon.assert.calledOnce(app.serveStatic);
  });

  it('should create app if none is given', function() {
    this.appRunner = new AppRunner();
    assert.ok(this.appRunner.getApp());
  });

  it('should log messages while running app', function() {
    this.appRunner = createAppRunner();
    this.appRunner.run();

    sinon.assert.called(gutil.log);
  });

  it('should not log messages while running app on muted mode', function() {
    this.appRunner = createAppRunner();
    this.appRunner.setMute(true);
    this.appRunner.run();

    assert.strictEqual(0, gutil.log.callCount);
  });

  it('should not set locale if not set in the config', function() {
    delete this.config.defaultLocale;

    this.appRunner = createAppRunner();
    this.appRunner.run();

    assert.strictEqual(0, this.appRunner.getApp().setLocale.callCount);
  });

  it('should not configure routes if routes file doesn\'t exist', function() {
    fs.existsSync.returns(false);

    this.appRunner = createAppRunner();
    this.appRunner.run();

    assert.strictEqual(0, this.appRunner.getApp().setRouteConfigurator.callCount);
  });

  it('should start the app after templates are compiled', function() {
    this.appRunner = createAppRunner();
    this.appRunner.run();

    var app = this.appRunner.getApp();
    var templateEngine = app.setTemplateEngine.getCall(0).args[0];

    sinon.assert.calledOnce(templateEngine.compileTemplates);
    assert.strictEqual(0, app.start.callCount);

    templateEngine.compileTemplates.getCall(0).args[3]();
    sinon.assert.calledOnce(app.start);
  });

  it('should reroute app when resources are updated', function() {
    var app = sinon.createStubInstance(App);
    this.appRunner = createAppRunner(app);
    this.appRunner.run();

    assert.strictEqual(1, app.setRouteConfigurator.callCount);
    assert.strictEqual(1, app.serveStatic.callCount);

    AppEventEmitter.emit('resourcesUpdated');

    assert.strictEqual(2, app.setRouteConfigurator.callCount);
    assert.strictEqual(2, app.serveStatic.callCount);
  });

  it('should clear class loader cache when resources are updated', function() {
    var app = sinon.createStubInstance(App);
    this.appRunner = createAppRunner(app);
    this.appRunner.run();

    assert.strictEqual(0, app.getClassLoader().clearCache.callCount);

    AppEventEmitter.emit('resourcesUpdated');

    sinon.assert.calledOnce(app.getClassLoader().clearCache);
  });

  it('should stop the app when requested', function() {
    this.appRunner = createAppRunner();
    this.appRunner.stop();

    sinon.assert.calledOnce(this.appRunner.getApp().stop);
  });
});

function createAppRunner(app) {
  var appRunner = new AppRunner(app);
  appRunner.getApp().getClassLoader.returns(sinon.createStubInstance(ClassLoader));

  return appRunner;
}
