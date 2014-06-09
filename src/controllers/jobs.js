var waigo = require('waigo');

var errors = waigo.load('support/errors');


exports.view = function*() {
  var jobId = this.request.params.id;

  var job = yield this.app.models.Job.findOne(
    { _id: jobId }
  ).populate('trigger').exec();

  if (!job) throw new errors.RuntimeError('Job not found');

  var logs = yield this.app.models.Log.find({job: job._id})
    .sort({created_at: -1}).exec();

  yield this.render('jobs/view', {
    job: job,
    logs: logs
  });
};

