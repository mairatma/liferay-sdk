'use strict';

var assert = require('assert');
var fs = require('fs');
var TestUtils = require('../fixture/TestUtils');

describe('scripts', function() {
  before(function() {
    TestUtils.before();

    TestUtils.requireTask('scripts');
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    TestUtils.after(done);
  });

  it('should output js files to the dist directory', function(done) {
    TestUtils.runTask('scripts', function() {
      assert.ok(fs.existsSync('dist/public/scripts/script.js'));

      done();
    });
  });

  it('should not optimize js files by default', function(done) {
    TestUtils.runTask('scripts', function() {
      var contents = fs.readFileSync('dist/public/scripts/script.js', 'utf8');
      assert.notStrictEqual(-1, contents.indexOf('var a = 42'));

      done();
    });
  });

  it('should optimize js files when optimizeScript is true', function(done) {
    TestUtils.setConfigProperty('optimizeScript', true);
    TestUtils.runTask('scripts', function() {
      var contents = fs.readFileSync('dist/public/scripts/script.js', 'utf8');
      assert.notStrictEqual(-1, contents.indexOf('var a=42'));

      done();
    });
  });
});
