"use strict";


var path = require('path'),
  waigo = require('waigo');


module.exports = function(config) {
  // ------------- BEGIN EDITING --------------- //

  /** Path to folder containg Ansible playbooks */
  config.ansiblePlaybooks = path.join(__dirname, '..', '..', 'ansible', 'playbooks');

  /** Max no. of jobs to execute in parallel. Should match no. of CPU cores. */
  config.jobsInParallel = 1;

  /** Output timeout (seconds). When running a Playbook job, 
  if the shell process does not produce any output within this time period then 
  the job is assumed to have frozen and will be terminated */
  config.outputTimeout = 300;


  // ------------- STOP EDITING --------------- //

  waigo.load('waigo:config/base')(config);

  config.jobProcessingIntervalMs = 5000;

  config.db = {
    mongo: {
      host: '127.0.0.1',
      port: '27017',
      db: 'ansibot'
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
    'setupTriggerTypes',
    'setupAnsible',
    'setupTemplateHelpers',
    'listener',
    'startJobProcessor'
  ];

  config.shutdownSteps = [
    'stopJobProcessor',
    'listener',
  ];

  config.middleware.options.staticResources = {
    folder: '../frontend/build'
  };
};


