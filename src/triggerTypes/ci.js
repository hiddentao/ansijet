"use strict";


var _ = require('lodash'),
  URL = require('url'),
  util = require('util');


var waigo = require('waigo'),
  TriggerType = waigo.load('support/triggerType'),
  urlUtils = waigo.load('support/urlUtils');



var CIBuild = module.exports = function() {
  TriggerType.call(this, 'Trigger deployments from continous integration builds');
};
util.inherits(CIBuild, TriggerType);



/**
 * @override
 */
CIBuild.prototype.ansibleVariables = function() {
  return {
    ci_expected_branch: {
      type: 'config',
      desc: 'The branch to deploy'
    },
    ci_build_branch: {
      type: 'query',
      desc: 'The version control branch which got built',
      value: '(branch id)'
    }    
  };
};




/**
 * Process given request.
 *
 * This checks the following:
 * 
 * - That the branch matches the pre-configured branch
 *
 * @override
 */
CIBuild.prototype.process = function*(configParams, queryParams) {
  queryParams = _.extend({}, queryParams);

  if (configParams.ci_expected_branch !== queryParams.ci_build_branch) {
    return {
      proceed: false,
      msg: 'Can only build ' + configParams.ci_expected_branch + ' branch' 
    };
  }

  return {
    proceed: true,
    ansibleVars: {
      ci_expected_branch: configParams.ci_expected_branch,
      ci_build_branch: queryParams.ci_build_branch,
    }
  };
};







