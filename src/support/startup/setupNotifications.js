"use strict";


var debug = require('debug')('ansijet-startup-notifications'),
  waigo = require('waigo');


var HipChat = waigo.load('support/notifications/hipChat');




/**
 * Setup HipChat notifications interface.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  var notificationsConfig = app.config.notifications || {};

  var notifiers = Object.keys(notificationsConfig ).map(function(k) {
    debug('Setting up notifier: ' + k);

    var NClass = waigo.load('support/notifications/' + k);

    return new NClass(notificationsConfig[k] || {});
  });


  /**
    * Send a notification.
    * @param {String} msg The message.
    * @param {String} [type] Message type - info (default), success or error. 
    */
  app.notify = function*(msg, type) {
    debug('Sending notification: ' + msg);

    for (let i=0; notifiers.length>i; ++i) {
      yield notifiers[i].notify(msg, type);
    }
  };

};

