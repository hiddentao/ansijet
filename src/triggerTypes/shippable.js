"use strict";


var _ = require('lodash'),
  URL = require('url'),
  util = require('util');


var waigo = require('waigo'),
  TriggerType = waigo.load('support/triggerType'),
  urlUtils = waigo.load('support/urlUtils');



var Shippable = module.exports = function() {
  TriggerType.call(this, 'Trigger deployments from Shippable.com builds');
};
util.inherits(Shippable, TriggerType);



/**
 * @override
 */
Shippable.prototype.ansibleVariables = function() {
  return {
    shippable_project_id: {
      type: 'config',
      desc: 'The project id in Shippable'
    },
    shippable_expected_branch: {
      type: 'config',
      desc: 'The branch to deploy'
    },
    shippable_build_num: {
      type: 'query',
      desc: 'The build number',
      value: '$BUILD_NUMBER'
    },
    shippable_build_branch: {
      type: 'query',
      desc: 'The git branch which got built',
      value: '$BRANCH'
    }    
  };
};




/**
 * Process given request.
 *
 * This checks the following:
 * 
 * - That the request did indeed come from Shippable
 * - That the build id is of the latest build for this project
 * - That the branch is 'master'
 *
 * @override
 */
Shippable.prototype.process = function*(configParams, queryParams) {
  queryParams = _.extend({}, queryParams);

  if (configParams.shippable_expected_branch !== queryParams.shippable_build_branch) {
    return {
      proceed: false,
      msg: 'Can only build ' + configParams.shippable_expected_branch + ' branch' 
    };
  }

  return {
    proceed: true,
    ansibleVars: {
      shippable_project_id: configParams.shippable_project_id,
      shippable_expected_branch: configParams.shippable_expected_branch,
      shippable_build_branch: queryParams.shippable_build_branch,
      shippable_build_num: queryParams.shippable_build_num
    }
  };
};







