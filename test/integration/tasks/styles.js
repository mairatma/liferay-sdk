'use strict';

var assert = require('assert');
var fs = require('fs');
var TestUtils = require('../fixture/TestUtils');

describe('styles', function() {
  before(function() {
    TestUtils.before();

    TestUtils.requireTask('styles');
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    TestUtils.after(done);
  });

  describe('styles:css', function() {
    it('should output the css files to dist directory', function(done) {
      TestUtils.runTask('styles:css', function() {
        assert.ok(fs.existsSync('dist/public/styles/styles.css'));
        done();
      });
    });

    it('should not optimize css files by default', function(done) {
      TestUtils.runTask('styles:css', function() {
        var contents = fs.readFileSync('dist/public/styles/styles.css', 'utf8');
        assert.notStrictEqual(-1, contents.indexOf('color: #333;'));

        done();
      });
    });

    it('should optimize css files when optimizeStyle is true', function(done) {
      TestUtils.setConfigProperty('optimizeStyle', true);
      TestUtils.runTask('styles:css', function() {
        var contents = fs.readFileSync('dist/public/styles/styles.css', 'utf8');
        assert.notStrictEqual(-1, contents.indexOf('color:#333'));

        done();
      });
    });
  });

  describe('styles:scss', function() {
    it('should output the css files to dist directory', function(done) {
      TestUtils.runTask('styles:scss', function() {
        assert.ok(fs.existsSync('dist/public/styles/sass.css'));
        done();
      });
    });

    it('should build css files with compass', function(done) {
      TestUtils.runTask('styles:scss', function() {
        var contents = fs.readFileSync('dist/public/styles/sass.css', 'utf8');
        assert.notStrictEqual(-1, contents.indexOf('color: #333333;'));

        done();
      });
    });

    it('should build and optimize css files with optimizeStyle is true', function(done) {
      TestUtils.setConfigProperty('optimizeStyle', true);
      TestUtils.runTask('styles:scss', function() {
        var contents = fs.readFileSync('dist/public/styles/sass.css', 'utf8');
        assert.notStrictEqual(-1, contents.indexOf('color:#333'));

        done();
      });
    });
  });

  describe('styles', function() {
    it('should run both styles:css and styles:scss', function(done) {
      TestUtils.runTask('styles', function() {
        assert.ok(fs.existsSync('dist/public/styles/styles.css'));
        assert.ok(fs.existsSync('dist/public/styles/sass.css'));
        done();
      });
    });
  });
});
