'use strict';

var assert = require('assert');
var mockery = require('mockery');
var sinon = require('sinon');
var TestUtils = require('../fixture/TestUtils');

describe('serve', function() {
  // This test is slower, since it runs lots of tasks together, so it will have
  // a higher timeout limit than normal.
  this.timeout(4000);

  before(function() {
    var instance = this;

    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    this.appRunner = {
      run: sinon.stub()
    };
    mockery.registerMock('../src/app/AppRunner', function() {
      return instance.appRunner;
    });

    TestUtils.before();

    TestUtils.requireTask('build');
    TestUtils.requireTask('copy');
    TestUtils.requireTask('default');
    TestUtils.requireTask('images');
    TestUtils.requireTask('fonts');
    TestUtils.requireTask('scripts');
    TestUtils.requireTask('serve');
    TestUtils.requireTask('styles');
    TestUtils.requireTask('templates');
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    mockery.disable();

    TestUtils.after(done);
  });

  it('should run an app', function(done) {
    var instance = this;

    TestUtils.runTask('serve', function() {
      assert.strictEqual(1, instance.appRunner.run.callCount);

      done();
    });
  });
});
