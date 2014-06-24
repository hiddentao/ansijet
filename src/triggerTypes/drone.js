"use strict";


var _ = require('lodash'),
  URL = require('url'),
  util = require('util');


var waigo = require('waigo'),
  TriggerType = waigo.load('support/triggerType'),
  urlUtils = waigo.load('support/urlUtils');



var Drone = module.exports = function() {
  TriggerType.call(this, 'Trigger deployments from Drone.io builds');
};
util.inherits(Drone, TriggerType);



/**
 * @override
 */
Drone.prototype.ansibleVariables = function() {
  return {
    ci_expected_branch: {
      type: 'config',
      desc: 'The git branch to run playbooks for'
    },
    ci_build_branch: {
      type: 'query',
      desc: 'The git branch which got built',
      value: '$DRONE_BRANCH'
    },
    ci_build_commit: {
      type: 'query',
      desc: 'The git commit which got built',
      value: '$DRONE_COMMIT'
    }    
  };
};




/**
 * Process given request.
 *
 * This checks the following:
 * 
 * - That the branch is matches the pre-configured branch
 *
 * @override
 */
Drone.prototype.process = function*(configParams, queryParams) {
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
      ci_build_commit: queryParams.ci_build_commit
    }
  };
};







