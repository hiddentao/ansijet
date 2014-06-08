exports.view = function*() {
  var triggerId = this.request.params.id;

  var trigger = yield this.app.models.Trigger.findOne(
    { _id: triggerId }
  ).populate('playbook').exec();

  if (!trigger) throw new errors.RuntimeError('Trigger not found');

  var logs = yield this.app.models.Log.find({
    trigger: trigger._id}
  ).sort({created_at: -1}).limit(1000).exec();

  yield this.render('triggers/view', {
    trigger: trigger,
    logs: logs
  });
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



