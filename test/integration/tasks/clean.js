'use strict';

var assert = require('assert');
var fs = require('fs');
var TestUtils = require('../fixture/TestUtils');

describe('clean', function() {
  before(function() {
    TestUtils.before();

    TestUtils.requireTask('clean');
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    TestUtils.after(done);
  });

  it('should clean up the dist directory', function(done) {
    fs.mkdirSync('dist');
    fs.writeFileSync('dist/testFile.md');

    TestUtils.runTask('clean', function() {
      assert.ok(!fs.existsSync('dist'));
      done();
    });
  });
});