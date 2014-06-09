"use strict";


exports.index = function*(next) {
  var jobs = yield this.app.models.Job.getActive();

  yield this.render('index', {
    jobs: jobs
  });
};


