"use strict";


exports.index = function*(next) {
  var jobs = yield this.app.models.Job.findActive();

  yield this.render('index', {
    jobs: jobs
  });
};


