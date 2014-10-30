'use strict';

var assert = require('assert');
var fs = require('fs');
var TestUtils = require('../fixture/TestUtils');

describe('fonts', function() {
  before(function(done) {
    TestUtils.before(function() {
      TestUtils.requireTask('fonts');

      done();
    });
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    TestUtils.after(done);
  });

  it('should output icon files to the dist directory', function(done) {
    TestUtils.runTask('fonts', function() {
      assert.ok(fs.existsSync('dist/public/fonts/icons.eot'));
      assert.ok(fs.existsSync('dist/public/fonts/icons.svg'));
      assert.ok(fs.existsSync('dist/public/fonts/icons.ttf'));
      assert.ok(fs.existsSync('dist/public/fonts/icons.woff'));

      done();
    });
  });

  it('should output icon css file to the dist directory', function(done) {
    TestUtils.runTask('fonts', function() {
      var cssFile = 'dist/public/fonts/icons.css';
      assert.ok(fs.existsSync(cssFile));

      var contents = fs.readFileSync(cssFile, 'utf8');
      assert.notStrictEqual(-1, contents.indexOf('font-family: "icons";'));

      done();
    });
  });

  it('should optimize icon css file when optimizeStyle is true', function(done) {
    TestUtils.setConfigProperty('optimizeStyle', true);
    TestUtils.runTask('fonts', function() {
      var contents = fs.readFileSync('dist/public/fonts/icons.css', 'utf8');
      assert.notStrictEqual(-1, contents.indexOf('font-family:"icons"'));

      done();
    });
  });
});
