"use strict";


var _ = require('lodash'),
  mongoose = require('mongoose'),
  path = require('path'),
  thunkify = require('thunkify');

var waigo = require('waigo'),
  schema = waigo.load('support/db/mongoose/schema'),
  exec = waigo.load('support/exec-then');


var triggerSchema = schema.create({
  description: String,
  type: String,
  playbook: { type: mongoose.Schema.Types.ObjectId, ref: 'Playbook' },
  configParams: { type: mongoose.Schema.Types.Mixed, default: {} },
  token: String,
  created_at: { type: Date, default: Date.now }
});



triggerSchema.pre('save', function(next){
  if (!this.token) {
    this.token = (Math.random() + 1).toString(36).substr(2,11);
  }
});



/**
 * The URL template for building a URL to invoke this trigger.
 */
triggerSchema.virtual('invokeUrlTemplate').get(function() {
  var app = waigo.load('application').app;

  var triggerType = new app.triggerTypes[this.type]; 

  var urlParams = triggerType.getQueryParams();
  // add token to url params list
  urlParams.token = this.token;

  return {
    path: '/invoke/' + this._id,
    queryParams: urlParams
  };
});



/**
 * The URL to view this trigger.
 */
triggerSchema.virtual('viewUrl').get(function() {
  return '/triggers/' + this._id;
});




/**
 * The ansible variables available with this trigger.
 */
triggerSchema.virtual('ansibleVars').get(function() {
  var self = this;

  var app = waigo.load('application').app;

  var triggerType = new app.triggerTypes[this.type]; 

  var ret = {};

  _.each(triggerType.ansibleVariables(), function(v, k) {
    ret[k] = v;

    if (self.configParams[k]) {
      ret[k].value = self.configParams[k];
    }
  });

  return ret;
});



/**
 * @override
 */
triggerSchema.method('viewObjectKeys', function(ctx) {
  return ['_id', 'description', 'type', 'playbook', 
  'configParams', 'ansibleVars', 'invokeUrlTemplate', 'viewUrl'];
});



/**
 * Get all triggers
 * @return {Promise} 
 */
triggerSchema.static('getAll', function() {
  return this.find().sort({created_at: -1}).populate('playbook').exec();
});



/**
 * Get for playbook
 * @return {Promise} 
 */
triggerSchema.static('getForPlaybook', function(playbookId) {
  return this.find({
    playbook: playbookId
  }).sort({created_at: -1}).populate('playbook').exec();
});



/**
 * Get a triggers
 * @return {Promise} 
 */
triggerSchema.static('getOne', function(id) {
  return this.findById(id).populate('playbook').exec();
});




module.exports = function(dbConn) {
  return dbConn.model('Trigger', triggerSchema);
}

