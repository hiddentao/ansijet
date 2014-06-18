"use strict";

exports.index = function*() {
  var logs = yield this.app.models.Log.getRecent(1000);

  yield this.render('logs/index', {
    logs: logs
  });
};



