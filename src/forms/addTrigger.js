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
        var values = _.keys(waigo.load('application').app.triggerTypes);

        return _.zipObject(values, values);
      }
    }
  ]
};
