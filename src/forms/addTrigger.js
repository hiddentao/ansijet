"use strict";


var _ = require('lodash'),
  path = require('path'),
  waigo = require('waigo');


module.exports = {
  fields: [
    {
      name: 'description',
      type: 'text',
      label: 'Description',
      sanitizers: [ 'trim' ],
      validators: [ 'notEmpty' ],
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      options: function*() {
        var values = _.mapValues(
          waigo.load('application').app.triggerTypes, function(Type, key) {
            return key + ' - ' + new Type().description;
          }
        );

        return values;
      }
    }
  ]
};
