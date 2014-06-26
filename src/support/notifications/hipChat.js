"use strict";


var debug = require('debug')('ansijet-notifier-hipchat'),
  HipChatter = require('hipchatter'),
  Q = require('bluebird');



/**
 * HipChat notifier.
 * @param {Object} config HipChat config info.
 */
var HipChat = module.exports = function(config) {
  this.roomId = config.roomId;
  this.authToken = config.authToken;

  this.hipChat = new HipChatter();
  Q.promisifyAll(this.hipChat);
};




/**
 * Send a notification.
 *
 * @param {String} msg The message.
 * @param {String} [type] Message type - info (default), success or error. 
 */
HipChat.prototype.notify = function*(msg, type) {
  debug('Notifying HipChat: ' + msg);

  var color = 'yellow';

  if ('success' === type) {
    color = 'green';
  } else if ('error' === type) {
    color = 'red';
  }

  yield this.hipChat.notifyAsync(this.roomId, {
    message: msg,
    color: color,
    token: this.authToken
  });
};
