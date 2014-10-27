'use strict';

var gulp = require('gulp');
var merge = require('merge');
var path = require('path');
var sinon = require('sinon');
var ProductFlavors = require('../../../src/flavor/ProductFlavors');

var TestUtils = {
  ASSETS_PATH: path.resolve(__dirname, '../assets'),

  /**
   * Does all the handling needed before all tests are run.
   * Should be called in the `before` function of task integration tests.
   */
  before: function() {
    // Stub the configuration generator so we can easily test different params.
    this.originalConfig = ProductFlavors.generateFlavoredConfig();
    this.config = merge({}, this.originalConfig);
    sinon.stub(ProductFlavors, 'generateFlavoredConfig', function() {
      return TestUtils.config;
    });

    // Changing the working directory so the tasks can work on the test assets.
    this.initialCwd = process.cwd();
    process.chdir(this.ASSETS_PATH);

    this.requiredTasks = [];
    this.requireTask('clean');
  },

  /**
   * Does all the handling needed before each test is run.
   * Should be called in the `beforeEach` function of task integration tests.
   * @param {!Function} done The function to be called after all is done.
   */
  beforeEach: function(done) {
    // Override any changed config values with the original ones.
    merge(this.config, this.originalConfig);

    this.cleanFiles(done);
  },

  /**
   * Does all the handling needed after all tests are run.
   * Should be called in the `after` function of task integration tests.
   * @param {!Function} done The function to be called after all is done.
   */
  after: function(done) {
    ProductFlavors.generateFlavoredConfig.restore();

    // Clearing the cache for the required task files.
    this.requiredTasks.forEach(function(requiredTask) {
      delete require.cache[TestUtils.getTaskFilePath(requiredTask)];
    });

    this.cleanFiles(function() {
      // Restoring the working directory.
      process.chdir(TestUtils.initialCwd);

      done();
    });
  },

  /**
   * Cleans all the files in the `dist` folder.
   * @param {!Function} done The function to be called when all the files have been removed.
   */
  cleanFiles: function(done) {
    this.runTask('clean', function() {
      done();
    });
  },

  /**
   * Gets the file path for the given task.
   * @param  {string} taskName The name of the task.
   * @return {string}
   */
  getTaskFilePath: function(taskName) {
    return path.resolve('../../../tasks/' + taskName + '.js');
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
