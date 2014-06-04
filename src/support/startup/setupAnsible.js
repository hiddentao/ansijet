"use strict";


var debug = require('debug')('ansibot-startup-git-repo'),
  fs = require('then-fs'),
  path = require('path'),
  thunkify = require('thunkify'),
  waigo = require('waigo');


/**
 * Setup Ansible playbooks.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  debug('Loading Ansible playbooks');

  var files = yield fs.readdir(app.config.ansiblePlaybooksFolder);

  for (var i = 0; files.length > i; ++i) {
    var file = files[i];

    // assume all .yml files in this folder are playbooks
    if ('.yml' == path.extname(file).toLowerCase()) {
      var name = path.basename(file, '.yml');

      debug('Playbook found: ' + name);

      var obj = yield app.models.Playbook.findOne({name: name}).exec();

      if (!obj) {
        debug('Adding to db: ' + name);

        var obj = new app.models.Playbook({
          name: name,
          path: file
        });        

        yield thunkify(obj.save).call(obj);
      }
    }
  }
};
