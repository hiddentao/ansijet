exports.index = function*() {
  var logs = yield this.app.models.Log.find().sort({updated_at: -1}).limit(1000).exec();

  yield this.render('logs/index', {
    logs: logs
  });
};



