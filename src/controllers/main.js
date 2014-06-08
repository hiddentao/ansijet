"use strict";


exports.index = function*(next) {
  // load triggers
  var triggers = yield this.app.models.Trigger.find().populate('playbook').exec();

  // load latest 10 logs
  var logs = yield this.app.models.Log.find().populate('trigger').sort({created_at: -1}).limit(30).exec();

  yield this.render('index', {
    triggers: triggers,
    logs: logs
  });
};


