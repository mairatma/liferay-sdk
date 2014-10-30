'use strict';

var assert = require('assert');
var fs = require('fs');
var sinon = require('sinon');
var AppEventEmitter = require('../../../src/app/AppEventEmitter');
var TestUtils = require('../fixture/TestUtils');

describe('build', function() {
  // This test is slower, since it runs lots of tasks together, so it will have
  // a higher timeout limit than normal.
  this.timeout(4500);

  before(function(done) {
    TestUtils.before(function() {
      TestUtils.requireTask('build');
      TestUtils.requireTask('copy');
      TestUtils.requireTask('images');
      TestUtils.requireTask('fonts');
      TestUtils.requireTask('scripts');
      TestUtils.requireTask('styles');
      TestUtils.requireTask('templates');

      done();
    });
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    TestUtils.after(done);
  });

  it('should build all resources together', function(done) {
    TestUtils.setConfigProperty('outputTemplateAsJavascript', true);
    TestUtils.runTask('build', function() {
      assert.ok(fs.existsSync('dist/README.txt'));

      assert.ok(fs.existsSync('dist/public/images/liferay.jpg'));

      assert.ok(fs.existsSync('dist/public/fonts/icons.css'));
      assert.ok(fs.existsSync('dist/public/fonts/icons.eot'));
      assert.ok(fs.existsSync('dist/public/fonts/icons.svg'));
      assert.ok(fs.existsSync('dist/public/fonts/icons.ttf'));
      assert.ok(fs.existsSync('dist/public/fonts/icons.woff'));

      assert.ok(fs.existsSync('dist/public/scripts/script.js'));

      assert.ok(fs.existsSync('dist/public/styles/styles.css'));

      assert.ok(fs.existsSync('dist/public/index.html'));
      assert.ok(fs.existsSync('dist/public/styles/all.css'));
      assert.ok(fs.existsSync('dist/public/scripts/all.js'));

      assert.ok(fs.existsSync('dist/markdown.html'));

      assert.ok(fs.existsSync('dist/views/home.soy'));
      assert.ok(fs.existsSync('dist/views/home.soy.js'));

      done();
    });
  });

  it('should emit event when build is done', function(done) {
    var listener = sinon.stub();
    AppEventEmitter.on('resourcesUpdated', listener);

    TestUtils.runTask('build', function() {
      assert.strictEqual(1, listener.callCount);

      done();
    });
  });
});
