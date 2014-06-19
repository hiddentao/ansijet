"use strict";


var waigo = require('waigo'),
  timers = waigo.load('support/timers');


/**
 * Stop all timers.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  timers.stop();
};
