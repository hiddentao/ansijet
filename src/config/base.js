"use strict";


var path = require('path'),
  waigo = require('waigo');


module.exports = function(config) {
  // ------------- BEGIN EDITING --------------- //


  /** Path to Python installation site-packages folder */
  config.pythonSitePackages = '/usr/local/lib/python2.7/site-packages';

  /** Pat to Ansible source code (cloned from git repo) */
  config.ansibleSource = '/Users/home/dev/ansible/ansible';

  /** Path to Ansible playbooks */
  config.ansiblePlaybooks = path.join(__dirname, '..', '..', 'ansible', 'ansible');


  // ------------- STOP EDITING --------------- //

  waigo.load('waigo:config/base')(config);

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
    'listener'
  ];


  config.middleware.options.staticResources = {
    folder: '../frontend/build'
  };
};


