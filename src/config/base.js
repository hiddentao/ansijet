"use strict";


var path = require('path'),
  waigo = require('waigo');


module.exports = function(config) {
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
    'outputFormats'
  ];

  config.startupSteps = [
    'logging',
    'middleware',
    'database',
    'models',
    'routes',
    'setupTriggerTypes',
    'setupAnsible',
    'listener'
  ];


  /* Set the following values according to your system */

  config.pythonSitePackages = '/usr/local/lib/python2.7/site-packages';

  config.ansibleSource = '/Users/home/dev/ansible/ansible';

  config.ansiblePlaybooks = path.join(__dirname, '..', '..', 'ansible', 'ansible');
};


