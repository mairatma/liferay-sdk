'use strict';

var assert = require('assert');
var ClassLoader = require('../../../src/utils/ClassLoader');

describe('ClassLoader', function() {
  it('should load classes correctly', function() {
    var classLoader = new ClassLoader();

    var TestModule = classLoader.loadClass('test/unit/src/fixture/TestModule');
    assert.strictEqual(
      1,
      TestModule.test1,
      'Initial value should be 1'
    );
  });

  it('should work with the given base path', function() {
    var classLoader = new ClassLoader();
    classLoader.setBasePath('test/unit/src/fixture');

    var TestModule = classLoader.loadClass('TestModule');

    assert.strictEqual(
      'test/unit/src/fixture',
      classLoader.getBasePath(),
      'Base path should have been updated'
    );

    assert.strictEqual(
      1,
      TestModule.test1,
      'Initial value should be 1'
    );
  });

  it('should cache classes', function() {
    var classLoader = new ClassLoader();

    var TestModule = classLoader.loadClass('test/unit/src/fixture/TestModule');
    var TestModule2 = classLoader.loadClass('test/unit/src/fixture/TestModule');

    assert.strictEqual(
      TestModule,
      TestModule2,
      'The loaded modules should be the same'
    );
  });

  it('should clear cache when requested', function() {
    var classLoader = new ClassLoader();

    var TestModule = classLoader.loadClass('test/unit/src/fixture/TestModule');
    classLoader.clearCache();
    var TestModule2 = classLoader.loadClass('test/unit/src/fixture/TestModule');

    assert.notStrictEqual(
      TestModule,
      TestModule2,
      'The loaded modules should not be the same'
    );
  });

  it('should throw error when class is not found', function() {
    var classLoader = new ClassLoader();

    assert.throws(function() {
      classLoader.loadClass('test/unit/src/fixture/TestModule2');
    },
      Error,
      'Class test/src/fixture/TestModule2 not found.'
    );
  });
});
