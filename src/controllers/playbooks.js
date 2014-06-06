var thunkify = require('thunkify'),
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
            .sort({updated_at: 1}).exec();

  var triggerTypes = 
    yield this.app.models.Trigger.find({playbook: this.playbook._id})
            .sort({updated_at: 1}).exec();

  yield this.render('playbooks/view', yield _vars(this, {
    triggers: triggers
  }));
};


exports.newTrigger = function*() {
  var f = Form.new('addTrigger');

  yield this.render('playbooks/addTrigger', yield _vars(this, {
    form: f
  }));
};


exports.createTrigger = function*() {
  try {
    var f = Form.new('addTrigger');
    yield f.setValues(this.request.body);
    yield f.validate();    

    // save trigger
    var trigger = new this.app.models.Trigger({
      playbook: this.playbook._id,
      description: f.fields.description.value,
      type: f.fields.type.value
    });

    yield thunkify(trigger.save).call(trigger);

    this.response.redirect('/playbooks/' + this.request.params.id);

  } catch (err) {
    this.response.status = 400;

    yield this.render('playbooks/addTrigger', yield _vars(this, {
      form: f,
      error: err
    }));
  }

};



