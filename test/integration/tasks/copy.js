'use strict';

var assert = require('assert');
var fs = require('fs');
var TestUtils = require('../fixture/TestUtils');

describe('copy', function() {
  before(function(done) {
    TestUtils.before(function() {
      TestUtils.requireTask('copy');

      done();
    });
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    TestUtils.after(done);
  });

  it('should copy files to dist', function(done) {
    TestUtils.runTask('copy', function() {
      assert.ok(fs.existsSync('dist/markdown.md'));
      assert.ok(fs.existsSync('dist/public/styles/styles.css'));
      done();
    });
  });
});
