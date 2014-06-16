var _ = require('lodash'),
  chai = require('chai'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


exports.appFolder = path.join(__dirname, 'appFolder');

exports.assert = chai.assert;
exports.expect = chai.expect;
exports.should = chai.should();



var runGen = exports.runGen = function(genFn, arg1) {
  var fn = Q.promisify(co(genFn));
  return fn.apply(fn, _.toArray(arguments).slice(1));
}



/** 
 * Reset test db.
 * 
 * @return {Promise}
 */
exports.resetDb = function() {
  var url = 'mongodb://127.0.0.1:3306/ansibot-test';
  var db = mongoose.createConnection(url);

  var promise = new Q(function(resolve, reject) {
    db.on('error', function(err) {
      reject(err);
    });
    db.once('open', function() {
      db.removeListener('error', reject);
      resolve(db);
    });
  });

  return promise.then(function emptyAllCollections() {
    return Q.all(
      _.map(['logs', 'playbooks', 'jobs', 'triggers'], function(colName) {
        var collection = db.collection(colName);

        var fn = Q.promisify(collection.remove, collection);

        return fn();
      })
    );
  });
};




/** 
 * Start Ansibot server to test against.
 *
 * This will call `resetDb` before starting the server.
 * 
 * @return {Promise}
 */
exports.startAnsibot = function() {
  return runGen(function*() {
    yield exports.resetDb();

    yield waigo.init({
      appFolder: utils.appFolder
    })

    self.Application = waigo.load('application');

    yield self.Application.shutdown();  // shutdown current instance

    yield self.Application.start();

    return self.Application;
  });
};
