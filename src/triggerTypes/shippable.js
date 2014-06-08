var _ = require('lodash'),
  https = require('https'),
  URL = require('url');


var waigo = require('waigo'),
  Form = waigo.load('support/forms/form').Form;



/**
 * Construct parameter form.
 *
 * The parameter form is presented to the user when creating a trigger and 
 * consists of a list of parameters for which the user is required to set a 
 * value. These parameters are specific to a `Trigger` and are necessary for 
 * this trigger type to work.
 * 
 * @return {Form}
 */
exports.getParamsForm = function*() {
  return new Form({
    fields: [
      {
        name: 'projectId',
        type: 'text',
        label: 'Shippable Project Id',
        sanitizers: [ 'trim' ],
        validators: [ 'notEmpty' ],
      },
      {
        name: 'branch',
        type: 'text',
        label: 'Branch to deploy',
        sanitizers: [ 'trim' ],
        validators: [ 'notEmpty' ]
      }
    ]
  });
};




/**
 * Expected URL parameters for this trigger type.
 */
exports.urlParams = {
  build_num: {
    desc: 'Shippable build number',
    value: '$BUILD_NUMBER'
  },
  branch: {
    desc: 'Git branch which got built',
    value: '$BRANCH'
  }
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
 * @param {Object} queryParams The request query params.
 * @param {Object} triggerParams The trigger config params (see getParamsForm()).
 *
 * @return {Object} Ansible build variables.
 * 
 * @throws Error If any errors occur.
 */
exports.process = function*(queryParams, triggerParams) {
  params = _.extend({}, params);

  if (triggerParams.branch !== params.branch) {
    throw new Error('Can only build ' + triggerParams.branch + ' branch');    
  }

  var artifactsUrl = 'https://api.shippable.com/projects/' + triggerParams.projectId + '/builds/' + params.build_num + '/artifacts';
  
  return {
    shippable_project_id: trigger.projectId,
    shippable_build_branch: triggerParams.branch,
    shippable_build_num: params.build_num,
    shippable_build_artifacts_url: artifactsUrl,
  };
};


