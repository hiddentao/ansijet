"use strict";


exports.index = function*(next) {
  // playbooks
  var playbooks = yield this.app.models.Playbook.find().exec();

  // load triggers
  var triggers = yield this.app.models.Trigger.find().exec();

  // load latest 10 logs
  var logs = yield this.app.models.Log.find().sort({updated_at: -1}).limit(10).exec();

  yield this.render('index', {
    playbooks: playbooks,
    triggers: triggers,
    logs: logs
  });
};


