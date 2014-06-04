"use strict";



var debug = require('debug')('waigo-startup-models'),
  path = require('path'),
  waigo = require('waigo');


/**
 * Load models.
 *
 * This requires the 'database' startup step to be enabled.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  var modelModuleFiles = waigo.getModulesInPath('models');

  debug('Loading ' + modelModuleFiles.length + ' models');

  app.models = {};

  modelModuleFiles.forEach(function(modulePath) {
    var name = path.basename(modulePath);

    debug('Loading model: ' + name);

    var modelClass = waigo.load(modulePath)(app.db);

    app.models[modelClass.modelName] = modelClass;
  });
};
