"use strict";


var waigo = require('waigo');


/**
 * Cleanup resources
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  waigo.load('support/timers').stop();
  yield (waigo.load('support/exec-then').killPendingExecs());
};
