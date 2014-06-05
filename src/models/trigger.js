"use strict";


var _ = require('lodash'),
  mongoose = require('mongoose'),
  thunkify = require('thunkify');

var waigo = require('waigo'),
  schema = waigo.load('support/db/mongoose/schema'),
  exec = waigo.load('support/exec');


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
 * @param {Object} req The current request.
 */
triggerSchema.method('execute', function*(req) {
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
    var buildVariables = yield triggerType.process(req.query);

    // build --extra-vars parameter string
    var extraVars = [];
    for (let key in buildVariables) {
      extraVars.push(key + '=' + buildVariables[key]);
    }

    // build final command
    var cmd = 'ansible-playbook --extra-vars=' 
        + extraVars.join(',') + ' '  + playbook.fullPath;    

    this.log(jobId, 'Cmd: ' + cmd);


    // execute
    var ansibleOutput = {};
    try {
      ansibleOutput = yield exec(cmd);

      yield this.log(jobId, 'stdout: ' + ansibleOutput.stdout);

    } catch (err) {
      ansibleOutput = err.data;

      yield this.log(jobId, 'exit code: ' + 
          ansibleOutput.code + ', stdout: ' + ansibleOutput.stdout);

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

