"use strict";

module.exports = {
  'GET /playbooks/:id/addTrigger': [ 'playbooks.loadPlaybook', 'playbooks.newTrigger' ],
  'POST /playbooks/:id/addTrigger': [ 'bodyParser', 'playbooks.loadPlaybook', 'playbooks.createTrigger' ],

  'GET /playbooks/:id': [ 'playbooks.loadPlaybook', 'playbooks.view' ],

  'GET /playbooks': 'playbooks.index',

  'GET /invoke/:id': 'trigger.invoke',

  'GET /': 'main.index',
};


