'use strict';

var assert = require('assert');
var child = require('child_process');
var mockery = require('mockery');
var path = require('path');
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

    var mocha = sinon.stub().returns(through.obj());
    mockery.registerMock('gulp-mocha', mocha);

    var execFile = {
      stdout: {
        pipe: function() {}
      }
    };
    sinon.stub(child, 'execFile', function(file, args, options, callback) {
      process.nextTick(callback);
      return execFile;
    });

    TestUtils.before(function() {
      TestUtils.requireTask('test');

      done();
    });
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    mockery.disable();
    child.execFile.restore();

    TestUtils.after(done);
  });

  it('should run unit tests', function(done) {
    TestUtils.runTask('test:unit', function() {
      assert.strictEqual(1, plugins.mocha.callCount);
      done();
    });
  });

  it('should run integration tests', function(done) {
    TestUtils.runTask('test:integration', function() {
      assert.strictEqual(1, child.execFile.callCount);
      assert.strictEqual('mocha', path.basename(child.execFile.getCall(0).args[0]));

      done();
    });
  });
});
