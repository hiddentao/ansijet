"use strict";


var fs = require('then-fs'),
  mongoose = require('mongoose'),
  path = require('path');

var waigo = require('waigo'),
  schema = waigo.load('support/db/mongoose/schema');


var playbookSchema = schema.create({
  name: {
    type: String,
    index: {
      unique: true
    }
  },
  path: String
});



playbookSchema.virtual('viewUrl').get(function() {
  return '/playbooks/' + this.name;
});




/**
 * Get the code for this playbook.
 */
playbookSchema.method('getCode', function*() {
  return yield fs.readFile(this.path)
    .then(function(contents) {
      return contents.toString();
    });
})



/**
 * Get all triggers
 * @return {Promise} 
 */
playbookSchema.static('getAll', function() {
  return this.find().sort({name: 1}).exec();
});


/**
 * Get a trigger by name
 * @return {Promise} 
 */
playbookSchema.static('getByName', function(name) {
  return this.findOne({name: name}).exec();
});


/**
 * Get a trigger
 * @return {Promise} 
 */
playbookSchema.static('getOne', function(id) {
  return this.findById(id).exec();
});



/**
 * @override
 */
playbookSchema.method('viewObjectKeys', function(ctx) {
  return ['_id', 'name', 'path', 'viewUrl'];
});




module.exports = function(dbConn) {
  return dbConn.model('Playbook', playbookSchema);
}






