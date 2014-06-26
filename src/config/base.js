"use strict";


var path = require('path'),
  waigo = require('waigo');

module.exports = function(config) {
  // ------------- BEGIN EDITING --------------- //

  /** Path to folder containg Ansible playbooks */
  config.playbooks = '/playbooks';

  /** Max no. of jobs to execute in parallel. Should match no. of CPU cores. */
  config.jobsInParallel = 1;

  /**
   * Output timeout (seconds). When running a Playbook job, if the shell 
   * process does not produce any output within this time period then 
   * the job is assumed to have frozen and will be terminated.
   */
  config.outputTimeout = 300;

  /**
   * Notifications configurations.
   *
   * Notifications get sent when jobs are started and stopped and when they 
   * succeed and fail.
   *
   * See modules file under `support/notifications` path for the list of 
   * available notifiers and their options.
   */
  config.notifications = {
    // hipChat: {
    //   roomId: ,
    //   authToken: ,
    // }
  }

  // ------------- STOP EDITING --------------- //

  waigo.load('waigo:config/base')(config);

  config.jobProcessingIntervalMs = 5000;

  config.db = {
    mongo: {
      host: '127.0.0.1',
      port: '27017',
      db: 'ansijet'
    }
  };

  config.middleware.order = [
    'errorHandler',
    'staticResources',
    'methodOverride',
    'outputFormats',
    'sessions'
  ];

  config.startupSteps = [
    'logging',
    'middleware',
    'database',
    'models',
    'routes',
    'setupNotifications',
    'setupTriggerTypes',
    'setupAnsible',
    'setupTemplateHelpers',
    'listener',
    'startJobProcessor',
    'notifyAdminsOfStartup'
  ];

  config.shutdownSteps = [
    'cleanupResources',
    'listener',
  ];

  config.middleware.options.staticResources = {
    folder: '../frontend/build'
  };
};


