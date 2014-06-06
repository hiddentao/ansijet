"use strict";


var _ = require('lodash'),
  mongoose = require('mongoose'),
  path = require('path'),
  thunkify = require('thunkify');

var waigo = require('waigo'),
  schema = waigo.load('support/db/mongoose/schema'),
  exec = waigo.load('support/exec-then');


var triggerSchema = schema.create({
  description: String,
  type: String,
  playbook: { type: mongoose.Schema.Types.ObjectId, ref: 'Playbook' },
  params: { type: mongoose.Schema.Types.Mixed }
}, {
  addTimestampFields: true
});


/**
 * The URL template for building a URL to invoke this trigger.
 */
triggerSchema.virtual('urlTemplate').get(function() {
  var app = waigo.load('application').app;

  var urlParams = app.triggerTypes[this.type].urlParams;

  var queryStr = _.keys(urlParams).join('=<...>&') + '=<...>';

  return '/triggers/' + this._id + '?' + queryStr;
})



/**
 * @override
 */
triggerSchema.method('viewObjectKeys', function(ctx) {
  return ['_id', 'description', 'type', 'playbook', 'params', 'urlTemplate'];
});



/**
 * Execute this trigger.
 *
 * @param {Object} query Trigger query parameters.
 */
triggerSchema.method('execute', function*(query) {
  var jobId = parseInt(Math.random() * 20000000).toString(16);

  yield this.log(jobId, 'Triggered from: <source>');

  try {
    var app = waigo.load('application').app;

    // trigger type
    var triggerType = app.triggerTypes[this.type];

    // playbook
    var playbook = yield app.models.Playbook.findOne(this.playbook).exec();
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    this.log(jobId, 'Processing request');

    // let trigger type perform its checks
    var buildVariables = yield triggerType.process(query);

    // build --extra-vars parameter string
    var extraVars = [];
    for (let key in buildVariables) {
      extraVars.push(key + '=' + buildVariables[key]);
    }

    // build final command
    var cmd = [ 
      path.join(app.config.ansibleSource, 'bin', 'ansible-playbook'),
      '-i ' + path.join(app.config.ansiblePlaybooks, 'hosts'),
      '--extra-vars=' + extraVars.join(','),
      playbook.path
    ].join(' ');

    this.log(jobId, 'Cmd: ' + cmd);

    // execute
    try {
      var result = yield exec(cmd, {
        outputTimeout: 60,
        env: {
          'ANSIBLE_LIBRARY': path.join(app.config.ansibleSource, 'library'),
          'PYTHONPATH': [
            path.join(app.config.ansibleSource, 'lib'),
            app.config.pythonSitePackages
          ].join(':')
        }
      });

      yield this.log(jobId, 'stdout: ' + result.stdout);

    } catch (err) {
      // shell exec error?
      if (undefined !== err.code) {
        yield this.log(jobId, 'exit code: ' + 
            err.code + ', stdout: ' + err.stdout);
      }

      throw err;
    }


    yield this.log(jobId, 'Job complete');

  } catch (err) {
    yield this.log(jobId, err.message);

    yield this.log(jobId, 'Job did not complete');

    throw err;
  }
});



/**
 * Create a log message entry for this trigger.
 * @param  {String} jobId   Unique id for this job.
 * @param  {String} message The status message.
 */
triggerSchema.method('log', function*(jobId, message) {
  var app = waigo.load('application').app;

  var log = new app.models.Log({
    job: jobId,
    trigger: this,
    text: message
  });

  yield thunkify(log.save).call(log);
});





module.exports = function(dbConn) {
  return dbConn.model('Trigger', triggerSchema);
}

