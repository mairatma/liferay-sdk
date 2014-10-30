'use strict';

var assert = require('assert');
var fs = require('fs');
var TestUtils = require('../fixture/TestUtils');

describe('lang', function() {
  before(function(done) {
    TestUtils.before(function() {
      TestUtils.requireTask('lang');

      done();
    });
  });

  beforeEach(function(done) {
    TestUtils.beforeEach(done);
  });

  after(function(done) {
    TestUtils.after(done);
  });

  it('should extract messages for translations', function(done) {
    TestUtils.runTask('lang', function() {
      var file = 'src/translations/default.xlf';
      assert.ok(fs.existsSync(file));

      var contents = fs.readFileSync(file, 'utf8');
      assert.notStrictEqual(-1, contents.indexOf('Hello'));

      fs.unlinkSync('src/translations/default.xlf');
      done();
    });
  });
});
