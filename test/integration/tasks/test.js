'use strict';

var assert = require('assert');
var childProcess = require('child_process');
var mockery = require('mockery');
var plugins = require('gulp-load-plugins')();
var sinon = require('sinon');
var through = require('through2');
var EventEmitter = require('events').EventEmitter;
var TestUtils = require('../fixture/TestUtils');

describe('test', function() {
  before(function() {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    });

    var mocha = sinon.stub().returns(through.obj());
    mockery.registerMock('gulp-mocha', mocha);

    var spawn = new EventEmitter();
    sinon.stub(childProcess, 'spawn', function() {
      process.nextTick(spawn.emit.bind(spawn, 'exit'));
      return spawn;
    });

    TestUtils.before();

    TestUtils.requireTask('test');
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    mockery.disable();
    childProcess.spawn.restore();

    TestUtils.after(done);
  });

  it('should run unit tests', function(done) {
    TestUtils.runTask('test', function() {
      assert.strictEqual(1, plugins.mocha.callCount);
      done();
    });
  });

  it('should run integration tests', function(done) {
    sinon.stub(TestUtils, 'cleanFiles', function(callback) {
      callback();
    });

    TestUtils.runTask('test:integration', function() {
      assert.strictEqual(1, childProcess.spawn.callCount);
      assert.strictEqual('mocha', childProcess.spawn.getCall(0).args[0]);
      assert.strictEqual(1, TestUtils.cleanFiles.callCount);

      TestUtils.cleanFiles.restore();

      done();
    });
  });
});
