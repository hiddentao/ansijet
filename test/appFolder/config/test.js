"use strict";


module.exports = function(config) {
  config.ansiblePlaybooks = path.join(__dirname, '..', 'playbooks');

  config.jobsInParallel = 1;

  config.db = {
    mongo: {
      host: '127.0.0.1',
      port: '27017',
      db: 'ansibot-test'
    }
  };
};


