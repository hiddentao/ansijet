"use strict";


var _ = require('lodash'),
  debug = require('debug')('ansijet-startup-ansible'),
  fs = require('then-fs'),
  path = require('path'),
  thunkify = require('thunkify'),
  waigo = require('waigo');

var exec = waigo.load('support/exec-then');


/**
 * Setup Ansible playbooks.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Finding ansible-playbook binary');

  app.config.ansiblePlaybookBin = 
    ((yield exec('which ansible-playbook')).stdout || '').trim();

  if ('' === app.config.ansiblePlaybookBin) {
    throw new Error('Unable to find ansible-playbook binary');
  } else {
    app.logger.info('Ansible playbook binary: ' + app.config.ansiblePlaybookBin);
  }

  debug('Loading Ansible playbooks');

  var files = yield fs.readdir(app.config.playbooks);

  for (var i = 0; files.length > i; ++i) {
    var file = files[i];

    // assume all .yml files in this folder are playbooks
    if ('.yml' === path.extname(file).toLowerCase()) {
      var name = path.basename(file, '.yml');

      debug('Playbook found: ' + name);

      var obj = yield app.models.Playbook.findOne({name: name}).exec();

      if (!obj) {
        debug('Adding to db: ' + name);

        obj = new app.models.Playbook({
          name: name,
          path: path.join(app.config.playbooks, file)
        });        

        yield thunkify(obj.save).call(obj);
      }
    }
  }
};
