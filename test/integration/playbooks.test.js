var Q = require('bluebird'),
  request = require('supertest');


var utils = require('../utils'),
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should;



exports['playbooks'] = {
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
      var self = this;

      self.request.get('/playbooks?format=json')
        .expect(200)
        .expect(function(res) {
          var json = res.body;

          expect(json.playbook_path).to.eql(self.app.config.ansiblePlaybooks);
          expect(json.playbooks.length).to.eql(1);

          var item1 = json.playbooks[0];
          expect(item1._id).to.not.be.undefined;
          expect(item1.name).to.eql('normal');
          expect(item1.path).to.eql(self.app.config.ansiblePlaybooks + '/normal.yml');
          expect(item1.viewUrl).to.eql('/playbooks/normal');
        })
        .end(done);        
    }
  },


  'view playbook': {
    'index': function(done) {
      var self = this;

      self.request.get('/playbooks/normal?format=json')
        .expect(200)
        .expect(function(res) {
          var json = res.body;
          // TODO
        })
        .end(done);        
    }
  }

};


