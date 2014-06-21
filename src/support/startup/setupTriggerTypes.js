"use strict";



var debug = require('debug')('ansijet-startup-trigger-types'),
  path = require('path'),
  waigo = require('waigo');


/**
 * Load trigger types.
 *
 * This will set `app.triggerTypes`.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  var files = waigo.getModulesInPath('triggerTypes');

  debug('Loading trigger types');

  app.triggerTypes = {};

  files.forEach(function(modulePath) {
    var name = path.basename(modulePath);

    debug('Adding trigger type: ' + name);

    app.triggerTypes[name] = waigo.load(modulePath);
  });
};
