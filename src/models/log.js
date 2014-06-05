"use strict";


var mongoose = require('mongoose');

var waigo = require('waigo'),
  schema = waigo.load('support/db/mongoose/schema');


var logSchema = schema.create({
  job: String,
  trigger: { type: mongoose.Schema.Types.ObjectId, ref: 'Trigger' },
  text: String
}, {
  addTimestampFields: true
});




module.exports = function(dbConn) {
  return dbConn.model('Log', logSchema);
}




