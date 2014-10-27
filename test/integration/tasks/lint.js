'use strict';

var assert = require('assert');
var mockery = require('mockery');
var plugins = require('gulp-load-plugins')();
var sinon = require('sinon');
var through = require('through2');
var TestUtils = require('../fixture/TestUtils');

describe('lint', function() {
  before(function() {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    var jshint = sinon.stub().returns(through.obj());
    jshint.reporter = sinon.stub().returns(through.obj());
    mockery.registerMock('gulp-jshint', jshint);

    TestUtils.before();

    TestUtils.requireTask('lint');
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    mockery.disable();

    TestUtils.after(done);
  });

  it('should run lint for js files', function(done) {
    TestUtils.runTask('lint', function() {
      assert.strictEqual(1, plugins.jshint.callCount);
      assert.strictEqual(1, plugins.jshint.reporter.callCount);
      done();
    });
  });
});
