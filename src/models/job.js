"use strict";


var _ = require('lodash'),
  mongoose = require('mongoose'),
  path = require('path'),
  thunkify = require('thunkify');

var waigo = require('waigo'),
  schema = waigo.load('support/db/mongoose/schema'),
  exec = waigo.load('support/exec-then');


var jobSchema = schema.create({
  trigger: { type: mongoose.Schema.Types.ObjectId, ref: 'Trigger' },
  source: String,
  queryParams: { type: mongoose.Schema.Types.Mixed, default: {} },
  result: { type: String, default: 'created' },
  created_at: { type: Date, default: Date.now }
});





/**
 * Execute this job.
 *
 * @param {Object} req Request context.
 */
jobSchema.method('execute', function*(req) {
  yield this.log('Triggered from ' + this.source, {
    data: queryParams
  });

  try {
    var app = waigo.load('application').app;

    // trigger
    var trigger = yield app.models.Trigger.findOne(this.trigger).exec();

    // trigger type
    var triggerType = new app.triggerTypes[trigger.type];

    // playbook
    var playbook = yield app.models.Playbook.findOne(this.trigger.playbook).exec();
    if (!playbook) {
      throw new Error('Playbook not found');
    }

    this.log('Processing request');

    // let trigger type perform its checks
    var buildVariables = 
      yield triggerType.process(this.trigger.configParams, this.queryParams);

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

    this.log('Cmd: ' + cmd, { console: true });

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

      yield this.log(result.stdout, { console: true });

    } catch (err) {
      // shell exec error?
      if (undefined !== err.code) {
        yield this.log('Exit code: ' + 
            err.code + '\n\n' + err.stdout, { console: true, error: true });
      }

      throw err;
    }


    yield this.log('Job complete');
    this.result = 'success';

  } catch (err) {
    yield this.log(err.message, { error: true });

    yield this.log('Job did not complete');
    this.result = 'failed';
  } finally {
    yield thunkify(this.save).call(this);
  }

});



/**
 * The URL to view this job.
 */
jobSchema.virtual('viewUrl').get(function() {
  return '/jobs/' + this._id;
});



/**
 * Create a log message entry for this trigger.
 * @param  {String} message The status message.
 * @param {Object} meta Additional info about this log.
 */
jobSchema.method('log', function*(message, meta) {
  var app = waigo.load('application').app;

  var log = new app.models.Log({
    job: this._id,
    trigger: this.trigger,
    text: message,
    meta: meta || {}
  });

  yield thunkify(log.save).call(log);
});


/**
 * @override
 */
jobSchema.method('viewObjectKeys', function(ctx) {
  return ['_id', 'trigger', 'source', 'queryParams', 
  'result', 'created_at', 'viewUrl'];
});



/** 
 * Find active jobs.
 * @return {Promise} 
 */
jobSchema.static('findActive', function() {
  return this.find({
    result: 'created'
  }).sort({created_at: -1}).populate('trigger').exec();
});




module.exports = function(dbConn) {
  return dbConn.model('Job', jobSchema);
}

