"use strict";

var _ = require('lodash')

var waigo = require('waigo'),
  Form = waigo.load('support/forms/form').Form;



/**
 * A trigger types.
 *
 * Trigger types represent the different ways in which a `Trigger` can be 
 * invoked.
 *
 * @param {String} description Description of this trigger type.
 * @constructor
 */
var TriggerType = module.exports = function(description) {
  this.description = description;
};


/**
 * List of ansible variables this trigger type makes available.
 *
 * Subclasses should override this.
 */
TriggerType.prototype.ansibleVariables = function() { 
  throw new Error('Not yet implemented')
};



/**
 * Get form for setting configuration parameters for this trigger type.
 * @return {Form} A Waigo `Form` instance.
 */
TriggerType.prototype.getConfigParamsForm = function() {
  var fields = [];

  _.each(this.ansibleVariables(), function(v, k) {
    if ('config' !== v.type) {
      return;
    }

    fields.push({
      name: k,
      type: 'text',
      label: v.desc,
      helpText: 'Ansible variable: ' + k,
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty' ],
    });
  });

  return new Form({ fields: fields });
};




/**
 * Get query parameters.
 *
 * This is a convenience method.
 */
TriggerType.prototype.getQueryParams = function() {
  var ret = {};

  _.each(this.ansibleVariables(), function(v, k) {
    if ('query' === v.type) {
      ret[k] = v;
    }
  });

  return ret;
};





/**
 * Process given request and get final Ansible variables.
 *
 * @param {Object} configParams The config params (see `getConfigParamsForm`).
 * @param {Object} queryParams The request query params.
 *
 * @return {Object} {proceedWithBuild: Boolean, msg:String, ansibleVars:Object).
 * 
 * @throws Error If any errors occur.
 */
TriggerType.prototype.process = function*(configParams, queryParams) {
  throw new Error('Not yet implemented');
};



