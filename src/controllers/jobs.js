"use strict";


var waigo = require('waigo');

var errors = waigo.load('support/errors');


exports.view = function*() {
  var jobId = this.request.params.id;

  var job = yield this.app.models.Job.getOne(jobId);

  if (!job) {
    throw new errors.RuntimeError('Job not found', 404);
  }

  var logs = yield this.app.models.Log.getForJob(jobId);

  yield this.render('jobs/view', {
    job: job,
    logs: logs
  });
};

