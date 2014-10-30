'use strict';

var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var fs = require('fs.extra');
var merge = require('merge');
var path = require('path');
var sinon = require('sinon');
var ProductFlavors = require('../../../src/flavor/ProductFlavors');

var TestUtils = {
  TEST_RESOURCES_DIST_PATH: path.resolve(__dirname, '../assets/temp/dist'),
  TEST_RESOURCES_PATH: path.resolve(__dirname, '../assets/temp'),

  /**
   * Does all the handling needed before all tests are run.
   * Should be called in the `before` function of task integration tests.
   */
  before: function(done) {
    // Stub the configuration generator so we can easily test different params.
    this.originalConfig = ProductFlavors.generateFlavoredConfig();
    this.config = merge({}, this.originalConfig);
    sinon.stub(ProductFlavors, 'generateFlavoredConfig', function() {
      return TestUtils.config;
    });

    // Stub gutil
    sinon.stub(gutil, 'log');

    del(this.TEST_RESOURCES_PATH, function() {
      // Create the directory where the tasks will run.
      fs.mkdirSync(TestUtils.TEST_RESOURCES_PATH);

      // Change the working directory so the tasks can work on the test assets.
      TestUtils.initialCwd = process.cwd();
      process.chdir(TestUtils.TEST_RESOURCES_PATH);

      // Clear the array of required tasks.
      TestUtils.requiredTasks = [];

      // Build the `src` folder.
      TestUtils.buildSrc(done);
    });
  },

  /**
   * Does all the handling needed before each test is run.
   * Should be called in the `beforeEach` function of task integration tests.
   * @param {!Function} done The function to be called after all is done.
   */
  beforeEach: function(done) {
    // Override any changed config values with the original ones.
    merge(this.config, this.originalConfig);

    // Removes the `dist` folder.
    del(this.TEST_RESOURCES_DIST_PATH, done);
  },

  /**
   * Does all the handling needed after all tests are run.
   * Should be called in the `after` function of task integration tests.
   * @param {!Function} done The function to be called after all is done.
   */
  after: function(done) {
    ProductFlavors.generateFlavoredConfig.restore();

    gutil.log.restore();

    // Clear the cache for the required task files.
    this.requiredTasks.forEach(function(requiredTask) {
      delete require.cache[TestUtils.getTaskFilePath(requiredTask)];
    });

    process.chdir(TestUtils.initialCwd);

    // Remove the temporary folder for testing.
    del(this.TEST_RESOURCES_PATH, done);
  },

  /**
   * Builds the `src` folder for testing.
   * @param {!Function} done The function to be called after all is done.
   */
  buildSrc: function(done) {
    var srcPath = path.join(this.TEST_RESOURCES_PATH, 'src');
    var originalSrcPath = path.resolve(this.TEST_RESOURCES_PATH, '../src');

    del(srcPath, function() {
      fs.mkdirSync(srcPath);
      fs.copyRecursive(originalSrcPath, srcPath, done);
    });
  },

  /**
   * Gets the file path for the given task.
   * @param  {string} taskName The name of the task.
   * @return {string}
   */
  getTaskFilePath: function(taskName) {
    return path.resolve('../../../../tasks/' + taskName + '.js');
  },

  /**
   * Requires the js file for the given task. Requiring tasks through here
   * guarantees that the file's cache will be cleaned on the end of the task,
   * which can be important when running multiple task tests together.
   * @param  {string} taskName The name of the task.
   */
  requireTask: function(taskName) {
    this.requiredTasks.push(taskName);
    require(this.getTaskFilePath(taskName));
  },

  /**
   * Runs the requested gulp task and calls the given callback when it's done.
   * @param {string} name The name of the task to be run.
   * @param {Function} callback The function to be called after the task is done.
   */
  runTask: function(name, callback) {
    var task = gulp.start(name);

    if (callback) {
      task.once('stop', callback);
    }

    return task;
  },

  /**
   * Sets the requested liferay sdk config property to the given value.
   * @param {string} property The name of the property to set.
   * @param {*} value The value to set the requested property to.
   */
  setConfigProperty: function(property, value) {
    this.config[property] = value;
  }
};

module.exports = TestUtils;
