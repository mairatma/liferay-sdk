'use strict';

var assert = require('assert');
var fs = require('fs');
var TestUtils = require('../fixture/TestUtils');

describe('templates', function() {
  before(function() {
    TestUtils.before();

    TestUtils.requireTask('templates');
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    TestUtils.after(done);
  });

  describe('templates:html', function() {
    it('should output the html files to dist directory', function(done) {
      TestUtils.runTask('templates:html', function() {
        assert.ok(fs.existsSync('dist/public/index.html'));
        done();
      });
    });

    it('should not optimize html files by default', function(done) {
      TestUtils.runTask('templates:html', function() {
        var contents = fs.readFileSync('dist/public/index.html', 'utf8');
        assert.notStrictEqual(-1, contents.indexOf('<body>\n    <h1>'));
        assert.strictEqual(-1, contents.indexOf('<body><h1>'));

        done();
      });
    });

    it('should optimize html files when optimizeHtml is true', function(done) {
      TestUtils.setConfigProperty('optimizeHtml', true);
      TestUtils.runTask('templates:html', function() {
        var contents = fs.readFileSync('dist/public/index.html', 'utf8');
        assert.strictEqual(-1, contents.indexOf('<body>\n    <h1>'));
        assert.notStrictEqual(-1, contents.indexOf('<body><h1>'));

        done();
      });
    });

    it('should build resources by default', function(done) {
      TestUtils.runTask('templates:html', function() {
        var file = 'dist/public/styles/all.css';
        assert.ok(fs.existsSync(file));

        var contents = fs.readFileSync(file, 'utf8');
        assert.notStrictEqual(-1, contents.indexOf('color: #333;'));

        file = 'dist/public/scripts/all.js';
        assert.ok(fs.existsSync(file));

        contents = fs.readFileSync(file, 'utf8');
        assert.notStrictEqual(-1, contents.indexOf('a = 42'));

        done();
      });
    });

    it('should optimize built css js when config values are true', function(done) {
      TestUtils.setConfigProperty('optimizeScript', true);
      TestUtils.setConfigProperty('optimizeStyle', true);
      TestUtils.runTask('templates:html', function() {
        var file = 'dist/public/styles/all.css';
        assert.ok(fs.existsSync(file));

        var contents = fs.readFileSync(file, 'utf8');
        assert.notStrictEqual(-1, contents.indexOf('color:#333'));

        file = 'dist/public/scripts/all.js';
        assert.ok(fs.existsSync(file));

        contents = fs.readFileSync(file, 'utf8');
        assert.notStrictEqual(-1, contents.indexOf('a=42'));

        done();
      });
    });

    it('should not build resources when optimizeHtmlResource is false', function(done) {
      TestUtils.setConfigProperty('optimizeHtmlResource', false);
      TestUtils.runTask('templates:html', function() {
        assert.ok(!fs.existsSync('dist/public/styles/all.css'));
        assert.ok(!fs.existsSync('dist/public/scripts/all.js'));
        done();
      });
    });
  });

  describe('templates:markdown', function() {
    it('should convert markdown to html by default', function(done) {
      TestUtils.runTask('templates:markdown', function() {
        assert.ok(fs.existsSync('dist/markdown.md'));
        assert.ok(fs.existsSync('dist/markdown.html'));

        done();
      });
    });

    it('should not convert markdown to html when outputMarkdownAsHtml is false', function(done) {
      TestUtils.setConfigProperty('outputMarkdownAsHtml', false);
      TestUtils.runTask('templates:markdown', function() {
        assert.ok(fs.existsSync('dist/markdown.md'));
        assert.ok(!fs.existsSync('dist/markdown.html'));

        done();
      });
    });

    it('should apply front matter variables by default', function(done) {
      TestUtils.runTask('templates:markdown', function() {
        var contents = fs.readFileSync('dist/markdown.html', 'utf8');
        assert.notStrictEqual(-1, contents.indexOf('Hello Front Matter!'));
        assert.notStrictEqual(-1, contents.indexOf('Did you know? Lorem Ipsum.'));

        done();
      });
    });

    it('should build resources by default', function(done) {
      TestUtils.runTask('templates:markdown', function() {
        assert.ok(fs.existsSync('dist/public/styles/all.css'));
        assert.ok(fs.existsSync('dist/public/scripts/all.js'));
        done();
      });
    });

    it('should not build resources when optimizeHtmlResource is false', function(done) {
      TestUtils.setConfigProperty('optimizeHtmlResource', false);
      TestUtils.runTask('templates:markdown', function() {
        assert.ok(!fs.existsSync('dist/public/styles/all.css'));
        assert.ok(!fs.existsSync('dist/public/scripts/all.js'));
        done();
      });
    });
  });

  describe('templates:soy', function() {
    it('should output soy files to the dist directory', function(done) {
      TestUtils.runTask('templates:soy', function() {
        assert.ok(fs.existsSync('dist/views/home.soy'));

        done();
      });
    });

    it('should convert static soy files to html', function(done) {
      TestUtils.runTask('templates:soy', function() {
        assert.ok(!fs.existsSync('dist/views/home.html'));

        var file = 'dist/views/static.html';
        assert.ok(fs.existsSync(file));

        var contents = fs.readFileSync(file, 'utf8');
        assert.notStrictEqual(-1, contents.indexOf('Hello Maira!'));

        done();
      });
    });

    it('should translate soy files to correct locale', function(done) {
      TestUtils.setConfigProperty('defaultLocale', 'pt-BR');
      TestUtils.runTask('templates:soy', function() {
        assert.ok(!fs.existsSync('dist/views/home.html'));

        var file = 'dist/views/static.html';
        assert.ok(fs.existsSync(file));

        var contents = fs.readFileSync(file, 'utf8');
        assert.strictEqual(-1, contents.indexOf('Hello Maira!'));
        assert.notStrictEqual(-1, contents.indexOf('Oi Maira!'));

        done();
      });
    });

    it('should not output soy.js files by default', function(done) {
      TestUtils.runTask('templates:soy', function() {
        assert.ok(!fs.existsSync('dist/views/home.soy.js'));

        done();
      });
    });

    it('should output soy.js files when outputTemplateAsJavascript is true', function(done) {
      TestUtils.setConfigProperty('outputTemplateAsJavascript', true);
      TestUtils.runTask('templates:soy', function() {
        var file = 'dist/views/home.soy.js';
        assert.ok(fs.existsSync(file));

        var contents = fs.readFileSync(file, 'utf8');
        assert.strictEqual(-1, contents.indexOf('styles.css'));
        assert.notStrictEqual(-1, contents.indexOf('allHome.css'));

        done();
      });
    });

    it('should build resources by default', function(done) {
      TestUtils.runTask('templates:soy', function() {
        assert.ok(fs.existsSync('dist/public/styles/all.css'));
        assert.ok(fs.existsSync('dist/public/scripts/all.js'));
        done();
      });
    });

    it('should not build resources when optimizeHtmlResource is false', function(done) {
      TestUtils.setConfigProperty('optimizeHtmlResource', false);
      TestUtils.runTask('templates:soy', function() {
        assert.ok(!fs.existsSync('dist/public/styles/all.css'));
        assert.ok(!fs.existsSync('dist/public/scripts/all.js'));
        done();
      });
    });
  });
});
