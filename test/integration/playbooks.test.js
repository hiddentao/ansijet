var Q = require('bluebird'),
  request = require('supertest');


var utils = require('../utils'),
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should;



test['playbooks'] = {
  beforeEach: function(done) {
    var self = this;

    utils.startAnsibot()
      .then(function(Application) {
        self.app = Application.app;

        self.request = request(self.app.config.baseURL);
      })
      .nodeify(done);
  },


  'view playbooks': {
    'index': function(done) {
      self.request.get('/playbooks?format=json')
        .expect('hello')
        .end(done);        
    }
  }
};


