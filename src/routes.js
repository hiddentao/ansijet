"use strict";

module.exports = {
  'GET /playbooks/:id/addTrigger/step2': [ 'playbooks.loadPlaybook', 'playbooks.addTrigger_getStep2' ],
  'POST /playbooks/:id/addTrigger/step2': [ 'bodyParser', 'playbooks.loadPlaybook', 'playbooks.addTrigger_submitStep2' ],

  'GET /playbooks/:id/addTrigger': [ 'playbooks.loadPlaybook', 'playbooks.addTrigger_getStep1' ],
  'POST /playbooks/:id/addTrigger': [ 'bodyParser', 'playbooks.loadPlaybook', 'playbooks.addTrigger_submitStep1' ],

  'GET /playbooks/:id': [ 'playbooks.loadPlaybook', 'playbooks.view' ],
  'GET /playbooks': 'playbooks.index',

  'GET /triggers/:id': 'triggers.view',
  'DELETE /triggers/:id': 'triggers.delete',
  'GET /triggers': 'triggers.index',

  'GET /jobs/:id': 'jobs.view',

  'GET /logs': 'logs.index',

  'GET /invoke/:id': 'triggers.invoke',

  'GET /ping': 'main.ping',

  'GET /': 'main.index',
};


