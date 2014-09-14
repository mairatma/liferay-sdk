'use strict';

var gulp = require('gulp');
var path = require('path');

var TestUtils = {
  ASSETS_PATH: path.resolve(__dirname, '../assets'),

  /**
   * Does all the handling needed before all tests are run.
   * Should be called in the `before` function of task integration tests.
   */
  before: function() {
    // Changing the working directory so the tasks can work on the test assets.
    this.initialCwd = process.cwd();
    process.chdir(this.ASSETS_PATH);

    this.requiredTasks = [];
    this.requireTask('clean');
  },

  /**
   * Does all the handling needed after all tests are run.
   * Should be called in the `after` function of task integration tests.
   */
  after: function() {
    // Clearing the cache for the required task files.
    this.requiredTasks.forEach(function(requiredTask) {
      delete require.cache[TestUtils.getTaskFilePath(requiredTask)];
    });

    // Restoring the working directory.
    process.chdir(this.initialCwd);
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
   * @param {!Function} callback The function to be called after the task is done.
   */
  runTask: function(name, callback) {
    gulp.start(name).once('stop', callback);
  }
};

module.exports = TestUtils;
