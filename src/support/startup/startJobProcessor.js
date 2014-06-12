"use strict";



var debug = require('debug')('ansibot-job-processor'),
  co = require('co'),
  path = require('path'),
  thunkify = require('thunkify'),
  waigo = require('waigo');




var buildRunFunction = function(app, maxParallelJobs) {
  return function() {
    co(function*() {
      var activeJobs = 
        yield app.models.Job.getActive();

      debug('Processing ' + activeJobs.length + ' jobs');

      /*
      Rules:
      - No more than maxParallelJobs jobs in progress at the same time
      - No more than one job for any given playbook in progress at a time

      By 'in progress' we mean job state === 'processing'.
       */

      var pendingJobs = [],
        processingJobs = [],
        playbookProcessingJobs = {};

      activeJobs.forEach(function(job) {
        if ('processing' === job.status) {
          processingJobs.push(job);
          playbookProcessingJobs[job.trigger.playbook] = true;
        } else if ('created' === job.status) {
          pendingJobs.push(job);
        }
      }); 

      var jobsToExecute = [];

      while (maxParallelJobs > processingJobs.length && 0 < pendingJobs.length) {
        // list is in reverse chrono order and we want to deal with the oldest job first
        var nextPendingJob = pendingJobs.pop();

        // check that we're not already executing the given playbook
        if (playbookProcessingJobs[nextPendingJob.trigger.playbook]) {
          continue;
        } else {
          // add this job to execution queue
          jobsToExecute.push(nextPendingJob);

          // update other lists
          processingJobs.push(nextPendingJob);
          playbookProcessingJobs[nextPendingJob.trigger.playbook] = true;
        }
      }

      // run all the new jobs in parallel
      yield jobsToExecute.map(function(j) {
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
  app.logger.info('Mark previously active jobs as stale');

  // since app has just started up ensure there are no active jobs from a previous instance
  var activeJobs = 
    yield app.models.Job.getActive();

  yield activeJobs.map(function(j){
    j.status = 'stale';
    return thunkify(j.save).call(j);
  });

  var parallelJobs = app.config.jobsInParallel || 1;
  debug('Max parallel jobs: ' + parallelJobs);

  app.logger.info('Start job processing timer');
  setInterval(buildRunFunction(app, parallelJobs), 10000);
};
