"use strict";


var os = require('os');


/**
 * Notify admins that we have started up.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.logger.debug('Notifying admins that we have started up');

  yield app.notify('[STARTED] Ansijet (' + os.hostname() + ') m=' + app.config.mode);
};

