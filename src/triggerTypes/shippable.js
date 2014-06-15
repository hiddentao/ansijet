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
    // shippable_build_artifacts_url: {
    //   type: 'generated',
    //   desc: 'URL to deployable build artifacts zipfile'
    // },
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

  /*
  Build artefacts can no longer be accessed without auth so let's skip this 
  section until https://github.com/Shippable/support/issues/205 is fixed.
   */
  // var artifactsUrl = 'https://api.shippable.com/projects/' + configParams.shippable_project_id + '/builds/' + queryParams.shippable_build_num + '/artifacts';
  // // check that artifacts can be accessed
  // try {
  //   yield urlUtils.check(artifactsUrl);
  // } catch (err) {
  //   throw new Error('Build artifacts not accessible: ' + artifactsUrl + ', ' + err.toString());
  // }
  // TODO check that this is the latest build
  
  return {
    proceed: true,
    ansibleVars: {
      shippable_project_id: configParams.shippable_project_id,
      shippable_expected_branch: configParams.shippable_expected_branch,
      shippable_build_branch: queryParams.shippable_build_branch,
      shippable_build_num: params.shippable_build_num,
      shippable_build_artifacts_url: artifactsUrl,      
    }
  };
};







