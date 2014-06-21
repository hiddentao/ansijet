"use strict";


exports.index = function*(next) {
  var jobs = yield this.app.models.Job.getActive();

  yield this.render('index', {
    jobs: jobs
  });
};



exports.ping = function*(next) {
  this.body = 'Ansijet up';
};
