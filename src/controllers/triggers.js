var waigo = require('waigo');

var errors = waigo.load('support/errors');



exports.index = function*() {
  // load triggers
  var triggers = yield this.app.models.Trigger.find({created_at: -1}).populate('playbook').exec();

  yield this.render('triggers/index', {
    triggers: triggers
  });
};




exports.view = function*() {
  var triggerId = this.request.params.id;

  var trigger = yield this.app.models.Trigger.findOne(
    { _id: triggerId }
  ).populate('playbook').exec();

  if (!trigger) throw new errors.RuntimeError('Trigger not found');

  var jobs = yield this.app.models.Job.find({
    trigger: trigger._id}
  ).sort({created_at: -1}).limit(1000).exec();

  yield this.render('triggers/view', {
    trigger: trigger,
    jobs: jobs
  });
};



exports.delete = function*() {
  var triggerId = this.request.params.id;

  var trigger = yield this.app.models.Trigger.findOne(
    { _id: triggerId }
  ).populate('playbook').exec();

  if (!trigger) throw new errors.RuntimeError('Trigger not found');

  // remove
  yield this.app.models.Log.remove({trigger: triggerId}).exec()
  yield this.app.models.Job.remove({trigger: triggerId}).exec()
  yield this.app.models.Trigger.remove({_id: triggerId}).exec()

  this.response.redirect(trigger.playbook.viewUrl);
};




exports.invoke = function*() {
  var triggerId = this.request.params.id;

  var trigger = yield this.app.models.Trigger.findOne(
    { _id: triggerId }
  ).populate('playbook').exec();

  if (!trigger) throw new errors.RuntimeError('Trigger not found');

  
  yield trigger.execute(this.request);

  this.body = 'ok';
};



