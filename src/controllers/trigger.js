exports.invoke = function*() {
  var triggerId = this.request.params.id;

  var trigger = yield this.app.models.Trigger.findOne(
    { _id: triggerId }
  ).populate('playbook').exec();

  if (!trigger) throw new errors.RuntimeError('Trigger not found');

  
  yield trigger.execute(this.request.query);

  this.body = 'ok';
};



