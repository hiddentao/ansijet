"use strict";


var thunkify = require('thunkify'),
  waigo = require('waigo');

var errors = waigo.load('support/errors');



exports.index = function*() {
  // load triggers
  var triggers = yield this.app.models.Trigger.getAll();

  yield this.render('triggers/index', {
    triggers: triggers
  });
};




exports.view = function*() {
  var triggerId = this.request.params.id;

  var trigger = yield this.app.models.Trigger.getOne(triggerId);

  if (!trigger) {
    throw new errors.RuntimeError('Trigger not found', 404);
  }

  var jobs = yield this.app.models.Job.getForTrigger(triggerId);

  yield this.render('triggers/view', {
    trigger: trigger,
    jobs: jobs
  });
};



exports.delete = function*() {
  var triggerId = this.request.params.id;

  var trigger = yield this.app.models.Trigger.getOne(triggerId);

  if (!trigger) {
    throw new errors.RuntimeError('Trigger not found');
  }

  // remove
  yield this.app.models.Log.remove({trigger: triggerId}).exec()
  yield this.app.models.Job.remove({trigger: triggerId}).exec()
  yield this.app.models.Trigger.remove({_id: triggerId}).exec()

  this.response.redirect(trigger.playbook.viewUrl);
};




exports.invoke = function*() {
  var triggerId = this.request.params.id;

  var trigger = yield this.app.models.Trigger.getOne(triggerId);

  if (!trigger) {
    throw new errors.RuntimeError('Trigger not found');
  }

  var job = new this.app.models.Job({
    trigger: trigger._id,
    source: this.request.ip,
    queryParams: this.request.query
  });

  yield thunkify(job.save).call(job);

  this.body = 'ok';
};
