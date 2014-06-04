"use strict";


var mongoose = require('mongoose'),
  waigo = require('waigo');


var waigoMixins = waigo.load('support/mixins'),
  viewObjectMethodName = Object.keys(waigoMixins.HasViewObject).pop();


var schema = new mongoose.Schema({
  name: {
    type: String,
    index: {
      unique: true
    }
  },
  path: String
});


schema.method(viewObjectMethodName, function*() {
  return {
    id: this._id.toString(),
    name: this.key
  }
});


module.exports = function(dbConn) {
  return dbConn.model('Playbook', schema);
}




