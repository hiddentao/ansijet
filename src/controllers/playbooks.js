var _ = require('lodash'),
  thunkify = require('thunkify'),
  waigo = require('waigo');


var errors = waigo.load('support/errors'),
  Form = waigo.load('support/forms/form').Form;


/**
 * Add template variables common to all routes.
 * @return {Object} Final template variables map.
 */
var _vars = function*(ctx, templateVars) {
  templateVars = templateVars || {};

  templateVars.playbooks = yield ctx.app.models.Playbook.find().exec();

  // currently selected playbook id
  if (ctx.request.params.id) {
    templateVars.selectedPlaybookId = ctx.request.params.id;
  }

  // current playbook
  if (ctx.playbook) {
    templateVars.playbook = ctx.playbook;
  }

  return templateVars;
};



// middleware for this section of routes
exports.loadPlaybook = function*(next) {
  this.playbook = yield this.app.models.Playbook.findOne(
    {name: this.request.params.id}
  ).exec();

  yield next;
}



exports.index = function*() {
  yield this.render('playbooks/index', yield _vars(this));
};


exports.view = function*() {
  var triggers = 
    yield this.app.models.Trigger.find({playbook: this.playbook._id})
            .sort({created_at: 1}).exec();

  var triggerTypes = 
    yield this.app.models.Trigger.find({playbook: this.playbook._id})
            .sort({created_at: 1}).exec();

  yield this.render('playbooks/view', yield _vars(this, {
    code: yield this.playbook.getCode(),
    triggers: triggers
  }));
};





exports.addTrigger_getStep1 = function*() {
  var addTriggerForm = Form.new('addTrigger');

  yield this.render('playbooks/addTrigger', yield _vars(this, {
    form: addTriggerForm
  }));
};



exports.addTrigger_submitStep1 = function*() {
  try {
    var addTriggerForm = Form.new('addTrigger');
    yield addTriggerForm.setValues(this.request.body);
    yield addTriggerForm.validate();    

    // put state into session and show next form
    this.session.createTriggerFormState = addTriggerForm.state;

    this.response.redirect(this.playbook.viewUrl + '/addTrigger/step2')
  } catch (err) {
    this.response.status = 400;

    yield this.render('playbooks/addTrigger', yield _vars(this, {
      form: addTriggerForm,
      error: err
    }));
  }

};




exports.addTrigger_getStep2 = function*() {
  // ensure we do step 1 first
  if (!this.session.createTriggerFormState) {
    this.response.redirect('/playbooks/' + this.playbook._id + '/addTrigger');
  }

  // get trigger type
  var addTriggerForm = Form.new('addTrigger');
  addTriggerForm.state = this.session.createTriggerFormState;

  var triggerType = new this.app.triggerTypes[addTriggerForm.fields.type.value];

  var paramsForm = triggerType.getConfigParamsForm();

  // show its form
  yield this.render('playbooks/addTriggerStep2', yield _vars(this, {
    form: paramsForm
  }));
};




exports.addTrigger_submitStep2 = function*() {
  // ensure we do step 1 first
  if (!this.session.createTriggerFormState) {
    throw new Error('Need to do step 1 first');
  }

  // get trigger type
  var addTriggerForm = Form.new('addTrigger');
  addTriggerForm.state = this.session.createTriggerFormState;

  var triggerType = new this.app.triggerTypes[addTriggerForm.fields.type.value];

  var paramsForm = triggerType.getConfigParamsForm();

  try {
    // validate
    yield paramsForm.setValues(this.request.body);
    yield paramsForm.validate();

    // param key value pairs
    var paramFields = paramsForm.fields;
    var paramKeyValues = _.mapValues(paramFields, function(field) {
      return field.value;
    });

    // save trigger
    var trigger = new this.app.models.Trigger({
      playbook: this.playbook._id,
      description: addTriggerForm.fields.description.value,
      type: addTriggerForm.fields.type.value,
      configParams: paramKeyValues
    });

    yield thunkify(trigger.save).call(trigger);

    // clear saved session var
    delete this.session.createTriggerFormState;

    this.response.redirect(this.playbook.viewUrl);
  } catch (err) {
    this.response.status = 400;

    yield this.render('playbooks/addTriggerStep2', yield _vars(this, {
      form: paramsForm,
      error: err
    }));
  }
};


