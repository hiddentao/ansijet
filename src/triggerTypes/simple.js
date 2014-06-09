var _ = require('lodash'),
  https = require('https'),
  URL = require('url'),
  util = require('util');


var waigo = require('waigo'),
  TriggerType = waigo.load('support/triggerType');



var Simple = module.exports = function() {
  TriggerType.call(this, 'Trigger deployments by URL');
};
util.inherits(Simple, TriggerType);



/**
 * @override
 */
Simple.prototype.ansibleVariables = function() {
  return {};
};




/**
 * Process given request.
 *
 * @override
 */
Simple.prototype.process = function*(configParams, queryParams) {
  return {};
};





