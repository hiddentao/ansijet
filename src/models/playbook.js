"use strict";


var mongoose = require('mongoose'),
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




module.exports = function(dbConn) {
  return dbConn.model('Playbook', playbookSchema);
}






