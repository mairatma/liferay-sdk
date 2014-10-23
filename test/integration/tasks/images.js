'use strict';

var assert = require('assert');
var fs = require('fs');
var TestUtils = require('../fixture/TestUtils');

describe('images', function() {
  before(function() {
    TestUtils.before();

    TestUtils.requireTask('images');
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    TestUtils.after(done);
  });

  it('should output image files to the dist directory', function(done) {
    TestUtils.runTask('images', function() {
      assert.ok(fs.existsSync('dist/public/images/liferay.jpg'));

      done();
    });
  });

  it('should not optimize image by default', function(done) {
    TestUtils.runTask('images', function() {
      var originalStats = fs.statSync('src/public/images/liferay.jpg');
      var newStats = fs.statSync('dist/public/images/liferay.jpg');

      assert.strictEqual(originalStats.size, newStats.size);

      done();
    });
  });

  it('should optimize image when optimizeImage is true', function(done) {
    TestUtils.setConfigProperty('optimizeImage', true);
    TestUtils.runTask('images', function() {
      var originalStats = fs.statSync('src/public/images/liferay.jpg');
      var newStats = fs.statSync('dist/public/images/liferay.jpg');

      assert.ok(originalStats.size > newStats.size);

      done();
    });
  });
});
