'use strict';

var assert = require('assert');
var mockery = require('mockery');
var plugins = require('gulp-load-plugins')();
var sinon = require('sinon');
var through = require('through2');
var TestUtils = require('../fixture/TestUtils');

describe('test', function() {
  before(function(done) {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    this.mocha = sinon.stub();
    mockery.registerMock('gulp-mocha', this.mocha);

    TestUtils.before(function() {
      TestUtils.requireTask('test');

      done();
    });
  });

  beforeEach(function(done) {
    this.mocha.returns(through.obj());

    TestUtils.beforeEach(done);
  });

  after(function(done) {
    mockery.disable();

    TestUtils.after(done);
  });

  it('should run unit tests', function(done) {
    TestUtils.runTask('test:unit', function() {
      assert.strictEqual(1, plugins.mocha.callCount);
      done();
    });
  });

  it('should run all tests', function(done) {
    TestUtils.runTask('test', function() {
      assert.strictEqual(2, plugins.mocha.callCount);
      done();
    });
  });
});
