'use strict';

var assert = require('assert');
var fs = require('fs');
var TestUtils = require('../fixture/TestUtils');

describe('format', function() {
  before(function(done) {
    TestUtils.before(function() {
      TestUtils.requireTask('format');

      done();
    });
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

    it('should not format src js scripts outside public folder', function(done) {
      fs.writeFileSync('src/test.js', 'var a = 42;   ');

      TestUtils.runTask('format:scripts', function() {
        var contents = fs.readFileSync('src/test.js', 'utf8');
        assert.notStrictEqual('var a = 42;\n', contents);
        assert.strictEqual('var a = 42;   ', contents);

        fs.unlinkSync('src/test.js');
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

        contents = fs.readFileSync('src/public/styles/test.scss', 'utf8');
        assert.strictEqual('.cssClass {\n  color: black;\n}\n', contents);

        fs.unlinkSync('src/public/styles/test.css');
        fs.unlinkSync('src/public/styles/test.scss');

        done();
      });
    });

    it('should not format css files outside public folder', function(done) {
      fs.writeFileSync('src/test.css', '.cssClass {\ncolor: black\n}');
      fs.writeFileSync('src/test.scss', '.cssClass {\ncolor: black\n}');

      TestUtils.runTask('format:styles', function() {
        var contents = fs.readFileSync('src/test.css', 'utf8');
        assert.notStrictEqual('.cssClass {\n  color: black;\n}\n', contents);
        assert.strictEqual('.cssClass {\ncolor: black\n}', contents);

        contents = fs.readFileSync('src/test.scss', 'utf8');
        assert.notStrictEqual('.cssClass {\n  color: black;\n}\n', contents);
        assert.strictEqual('.cssClass {\ncolor: black\n}', contents);

        fs.unlinkSync('src/test.css');
        fs.unlinkSync('src/test.scss');

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
