"use strict";



/**
 * Stop the job processor.
 *
 * @param {Object} app The application.
 */
module.exports = function*(app) {
  app.stopJobProcessing = true; 
};
