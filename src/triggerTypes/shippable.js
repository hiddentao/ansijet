var _ = require('lodash'),
  https = require('https');


/**
 * Expected URL parameters for this trigger type.
 */
exports.urlParams = {
  build_id: 'Shippable build ID',
  project_id: 'Shippable project ID',
  branch: 'Git branch which got built',
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
 * @param {Object} params The params for this request.
 *
 * @return {Object} Ansible build variables.
 * 
 * @throws Error If any errors occur.
 */
exports.process = function*(params) {
  params = _.extend({}, params);

  if ('master' !== params.branch) {
    throw new Error('Can only build master branch');
  }

  // TODO: try and get HEAD for the build artifacts
  // 
  
  return {
    shippable_build_artifacts_url: 'https://api.shippable.com/projects/' + params.project_id + '/builds/' + params.build_id + '/artifacts'
  };
};


