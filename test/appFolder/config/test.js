"use strict";


module.exports = function(config) {
  config.port = parseInt(10000 + Math.random() * 20000);

  config.baseURL = 'http://localhost:' + config.port;

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


