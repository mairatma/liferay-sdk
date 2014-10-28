'use strict';

var assert = require('assert');
var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs');
var sinon = require('sinon');
var TestUtils = require('../fixture/TestUtils');

var task;

describe.only('watch', function() {
  // This test is slower, since it runs lots of tasks together, so it will have
  // a higher timeout limit than normal.
  this.timeout(6000);

  before(function(done) {
    var instance = this;

    sinon.spy(gulp, 'watch');
    sinon.stub(gutil, 'log');

    TestUtils.before();

    TestUtils.requireTask('build');
    TestUtils.requireTask('copy');
    TestUtils.requireTask('default');
    TestUtils.requireTask('images');
    TestUtils.requireTask('fonts');
    TestUtils.requireTask('scripts');
    TestUtils.requireTask('serve');
    TestUtils.requireTask('styles');
    TestUtils.requireTask('templates');
    TestUtils.requireTask('watch');

    TestUtils.cleanFiles(function() {
      runWatchTask.call(instance, done);
    });
  });

  after(function(done) {
    task.once('stop', function() {
      gulp.watch.restore();
      gutil.log.restore();

      TestUtils.after(done);
    });
    task.stop(null, true);
  });

  it('should copy new files to dist folder', function(done) {
    writeFile('src/testFile.txt', '', function() {
      assert.ok(fs.existsSync('dist/testFile.txt'));

      removeFile('src/testFile.txt', done);
    });
  });

  it('should remove deleted files from dist folder', function(done) {
    writeFile('src/testFile.txt', '', function() {
      removeFile('src/testFile.txt', function() {
        assert.ok(!fs.existsSync('dist/testFile.txt'));
        done();
      });
    });
  });

  it('should copy updated files to dist folder', function(done) {
    writeFile('src/testFile.txt', '', function() {
      var newContent = 'New Content';

      writeFile('src/testFile.txt', newContent, function() {
        var distContent = fs.readFileSync('dist/testFile.txt', 'utf8');
        assert.strictEqual(newContent, distContent);

        removeFile('src/testFile.txt', done);
      });
    });
  });

  it('should rebuild when html files change', function(done) {
    var originalContent = fs.readFileSync('src/public/index.html', 'utf8');
    var newContent = originalContent.replace('all.css', 'all2.css');

    writeFile('src/public/index.html', newContent, function() {
      var distContent = fs.readFileSync('dist/public/index.html', 'utf8');
      assert.notStrictEqual(-1, distContent.indexOf('all2.css'));

      assert.ok(fs.existsSync('dist/public/styles/all2.css'));

      writeFile('src/public/index.html', originalContent, done);
    });
  });

  it('should rebuild when markdown files change', function(done) {
    var originalContent = fs.readFileSync('src/markdown.md', 'utf8');
    var newContent = originalContent.replace('Front Matter', 'Test');

    writeFile('src/markdown.md', newContent, function() {
      var distContent = fs.readFileSync('dist/markdown.html', 'utf8');
      assert.notStrictEqual(-1, distContent.indexOf('Oi Test!'));

      writeFile('src/markdown.md', originalContent, done);
    });
  });

  it('should rebuild when image files change', function(done) {
    writeFile('src/public/images/liferay2.jpg', 'ffd8 ffe0 0010 4a46 4946', function() {
      var originalDistStats = fs.statSync('dist/public/images/liferay2.jpg');

      writeFile('src/public/images/liferay2.jpg', 'ffd8 ffe0', function() {
        var newDistStats = fs.statSync('dist/public/images/liferay2.jpg');
        assert.ok(newDistStats.size < originalDistStats.size);

        removeFile('src/public/images/liferay2.jpg', done);
      });
    });
  });

  it('should rebuild when font files change', function(done) {
    var fontContent = fs.readFileSync('src/public/fonts/liferay.svg', 'utf8');

    writeFile('src/public/fonts/liferay2.svg', fontContent, function() {
      var iconsContent = fs.readFileSync('dist/public/fonts/icons.svg', 'utf8');
      assert.notStrictEqual(-1, iconsContent.indexOf('glyph-name="liferay"'));
      assert.notStrictEqual(-1, iconsContent.indexOf('glyph-name="liferay2"'));

      removeFile('src/public/fonts/liferay2.svg', done);
    });
  });

  it('should rebuild when script files change', function(done) {
    var originalContent = fs.readFileSync('src/public/scripts/script.js', 'utf8');
    var newContent = originalContent.replace('a = 42', 'a = 24');

    writeFile('src/public/scripts/script.js', newContent, function() {
      var distContent = fs.readFileSync('dist/public/scripts/script.js', 'utf8');
      assert.notStrictEqual(-1, distContent.indexOf('var a=24'));

      writeFile('src/public/scripts/script.js', originalContent, done);
    });
  });

  it('should rebuild when scss files change', function(done) {
    var originalContent = fs.readFileSync('src/public/styles/sass.scss', 'utf8');
    var newContent = originalContent.replace('#333', '#222');

    writeFile('src/public/styles/sass.scss', newContent, function() {
      var distContent = fs.readFileSync('dist/public/styles/sass.css', 'utf8');
      assert.notStrictEqual(-1, distContent.indexOf('color:#222'));

      writeFile('src/public/styles/sass.scss', originalContent, done);
    });
  });

  it('should rebuild when css files change', function(done) {
    var originalContent = fs.readFileSync('src/public/styles/styles.css', 'utf8');
    var newContent = originalContent.replace('#333', '#222');

    writeFile('src/public/styles/styles.css', newContent, function() {
      var distContent = fs.readFileSync('dist/public/styles/styles.css', 'utf8');
      assert.notStrictEqual(-1, distContent.indexOf('color:#222'));

      writeFile('src/public/styles/styles.css', originalContent, done);
    });
  });

  it('should rebuild when soy files change', function(done) {
    var originalContent = fs.readFileSync('src/views/static.soy', 'utf8');
    var newContent = originalContent.replace('Maira', 'Henrique');

    writeFile('src/views/static.soy', newContent, function() {
      var distContent = fs.readFileSync('dist/views/static.html', 'utf8');
      assert.notStrictEqual(-1, distContent.indexOf('Oi Henrique!'));

      writeFile('src/views/static.soy', originalContent, done);
    });
  });

  it('should rebuild when the translation file changes', function(done) {
    var originalContent = fs.readFileSync('src/translations/translations_pt-BR.xlf', 'utf8');
    var newContent = originalContent.replace('Oi', 'Bom dia');

    writeFile('src/translations/translations_pt-BR.xlf', newContent, function() {
      var distContent = fs.readFileSync('dist/views/static.html', 'utf8');
      assert.notStrictEqual(-1, distContent.indexOf('Bom dia Maira!'));

      writeFile('src/translations/translations_pt-BR.xlf', originalContent, done);
    });
  });
});

/**
 * Deletes the given file and waits for the watch task to handle this change
 * before running the callback function.
 * @param {String} filepath
 * @param {!Function} done
 */
function removeFile(filepath, done) {
  runWatchedOperation(fs.unlinkSync.bind(fs, filepath), done);
}

/**
 * Runs the given operation and waits for the watch task to handle this change
 * before running the callback function.
 * @param {!Function} operationFn
 * @param {!Function} done
 */
function runWatchedOperation(operationFn, done) {
  setTimeout(function() {
    task.once('changeHandled', done);
    operationFn();
  }, 500);
}

/**
 * Runs the `watch` task and waits for the watchers to be ready.
 * @param {!Function} done Function to be called when all is done.
 */
function runWatchTask(done) {
  TestUtils.setConfigProperty('optimizeScript', true);
  TestUtils.setConfigProperty('optimizeStyle', true);
  TestUtils.setConfigProperty('defaultLocale', 'pt-BR');

  task = TestUtils.runTask('watch');
  task.on('task_start', function(event) {
    if (event.task === 'watch') {
      process.nextTick(function() {
        var watcher = gulp.watch.getCall(0).returnValue;
        watcher.once('ready', function() {
          done();
        });
      });
    }
  });
}

/**
 * Writes the given content to a file and waits for the watch task to handle
 * this change before running the callback function.
 * @param {String} filepath
 * @param {String} content
 * @param {!Function} done
 */
function writeFile(filepath, content, done) {
  runWatchedOperation(fs.writeFileSync.bind(fs, filepath, content), done);
}
