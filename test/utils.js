"use strict";


var _ = require('lodash'),
  chai = require('chai'),
  co = require('co'),
  mongoose = require('mongoose'),
  path = require('path'),
  Q = require('bluebird'),
  waigo = require('waigo');


exports.appFolder = path.join(__dirname, '..', 'src');

exports.assert = chai.assert;
exports.expect = chai.expect;
exports.should = chai.should();


/** 
 * Wait for given no. of milliseconds
 * @param  {Number} ms milliseconds.
 * @return {Promise}
 */
exports.waitFor = function(ms) {
  return new Q(function(resolve) {
    setTimeout(resolve, ms);
  });
}



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
  var url = 'mongodb://127.0.0.1:27017/ansijet-test';
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
 * Start Ansijet server to test against.
 *
 * This will call `resetDb` before starting the server.
 *
 * @param {Object} [customConfig] App configuration settings to set.
 * 
 * @return {Promise}
 */
exports.startAnsijet = function(customConfig) {
  return runGen(function*() {
    yield exports.resetDb();

    yield waigo.init({
      appFolder: exports.appFolder
    })

    var Application = waigo.load('application');

    yield Application.shutdown();  // shutdown current instance

    yield Application.start({
      postConfig: function(config) {
        config.port = parseInt(10000 + Math.random() * 20000);

        config.baseURL = 'http://localhost:' + config.port;

        config.playbooks = path.join(__dirname, 'data', 'playbooks');

        config.db = {
          mongo: {
            host: '127.0.0.1',
            port: '27017',
            db: 'ansijet-test'
          }
        };

        _.extend(config, {
          // for testing we want instant job gratification
          jobProcessingIntervalMs: 0
        }, customConfig);
      }
    });

    return Application;
  });
};



/** 
 * Stop Ansijet server to test against.
 *
 * @return {Promise}
 */
exports.stopAnsijet = function() {
  return runGen(function*() {
    yield exports.resetDb();
    var Application = waigo.load('application');

    yield Application.shutdown();  // shutdown current instance
  });
};


/**
 * Close all db connections
 * 
 * @return {Promise}
 */
exports.closeAllDbConnections = function() {
  return Q.promisify(mongoose.disconnect, mongoose)();
};


