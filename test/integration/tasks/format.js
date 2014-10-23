'use strict';

var assert = require('assert');
var fs = require('fs');
var TestUtils = require('../fixture/TestUtils');

describe('format', function() {
  before(function() {
    TestUtils.before();

    TestUtils.requireTask('format');
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    TestUtils.after(done);
  });

  describe('format:scripts', function() {
    it('should format js scripts', function(done) {
      fs.writeFileSync('src/public/scripts/test.js', 'var a = 42;   ');
      fs.mkdirSync('tasks');
      fs.writeFileSync('tasks/test.js', 'var a = 42;   ');
      fs.mkdirSync('test');
      fs.writeFileSync('test/test.js', 'var a = 42;   ');

      TestUtils.runTask('format:scripts', function() {
        var contents = fs.readFileSync('src/public/scripts/test.js', 'utf8');
        assert.strictEqual('var a = 42;\n', contents);

        contents = fs.readFileSync('tasks/test.js', 'utf8');
        assert.strictEqual('var a = 42;\n', contents);

        contents = fs.readFileSync('test/test.js', 'utf8');
        assert.strictEqual('var a = 42;\n', contents);

        fs.unlinkSync('src/public/scripts/test.js');
        fs.unlinkSync('tasks/test.js');
        fs.rmdirSync('tasks');
        fs.unlinkSync('test/test.js');
        fs.rmdirSync('test');

        done();
      });
    });
  });

  describe('format:styles', function() {
    it('should format css files', function(done) {
      fs.writeFileSync('src/public/styles/test.css', '.cssClass {\ncolor: black\n}');
      fs.writeFileSync('src/public/styles/test.scss', '.cssClass {\ncolor: black\n}');

      TestUtils.runTask('format:styles', function() {
        var contents = fs.readFileSync('src/public/styles/test.css', 'utf8');
        assert.strictEqual('.cssClass {\n  color: black;\n}\n', contents);

        fs.unlinkSync('src/public/styles/test.css');
        fs.unlinkSync('src/public/styles/test.scss');

        done();
      });
    });
  });

  describe('format', function() {
    it('should format both js and css files', function(done) {
      fs.writeFileSync('src/public/scripts/test.js', 'var a = 42;   ');
      fs.writeFileSync('src/public/styles/test.css', '.cssClass {\ncolor: black\n}');

      TestUtils.runTask('format', function() {
        var contents = fs.readFileSync('src/public/scripts/test.js', 'utf8');
        assert.strictEqual('var a = 42;\n', contents);

        contents = fs.readFileSync('src/public/styles/test.css', 'utf8');
        assert.strictEqual('.cssClass {\n  color: black;\n}\n', contents);

        fs.unlinkSync('src/public/scripts/test.js');
        fs.unlinkSync('src/public/styles/test.css');

        done();
      });
    });
  });
});
