"use strict";



var debug = require('debug')('ansibot-job-processor'),
  co = require('co'),
  path = require('path'),
  waigo = require('waigo');




var buildRunFunction = function(app, maxParallelJobs) {
  return function() {
    co(function*() {
      var pendingJobs = 
        yield app.models.Job.getPending(maxParallelJobs);

      debug('Processing ' + pendingJobs.length + ' jobs');

      // run all the jobs in parallel
      yield pendingJobs.map(function(j) {
        return j.execute();
      });
    })(function(err) {
      if (err) {
        app.logger.error('Job processing error', err.stack);
      }
    });
  };
};




/**
 * Start the job processor.
 *
 * This should be the last startup step which gets run to ensure that the 
 * rest of app is ready and loaded.
 *
 * The job processor picks up newly created jobs and processes them.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.info('Starting job processor');

  var parallelJobs = app.config.jobsInParallel || 1;
  debug('Max parallel jobs: ' + parallelJobs);

  var timerInterval = 2000 + (1000 * parallelJobs);
  debug('Interval (ms): ' + timerInterval);

  setInterval(buildRunFunction(app, parallelJobs), timerInterval);
};
