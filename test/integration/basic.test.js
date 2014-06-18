var _ = require('lodash'),
  fs = require('fs'),
  Q = require('bluebird'),
  request = require('supertest-as-promised');


var utils = require('../utils'),
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should;


var test = module.exports = {};


var _testSetup = function(customConfig, done) {
  if (1 === arguments.length) {
    done = customConfig;
    customConfig = null;
  }

  var self = this;

  utils.startAnsibot(customConfig)
    .then(function(Application) {
      self.app = Application.app;

      console.log('Test server: ' + self.app.config.baseURL);

      self.request = request.agent(self.app.config.baseURL);
    })
    .nodeify(done);
};



var _testShutdown = function(done) {
  utils.stopAnsibot()
    .then(function() {
      return utils.closeAllDbConnections();
    })
    .nodeify(done);
};




test['view playbooks'] = {
  before: _testSetup,
  after: _testShutdown,

  'index': function(done) {
    var self = this;

    self.request.get('/playbooks?format=json')
      .expect(200)
      .then(function(res) {
        var json = res.body;

        expect(json.playbook_path).to.eql(self.app.config.ansiblePlaybooks);
        expect(json.playbooks.length).to.eql(2);

        var item1 = json.playbooks[0];
        expect(item1._id).to.exist;
        expect(item1.name).to.eql('normal');
        expect(item1.path).to.eql(self.app.config.ansiblePlaybooks + '/normal.yml');
        expect(item1.viewUrl).to.eql('/playbooks/' + item1.name);

        var item2 = json.playbooks[1];
        expect(item2._id).to.exist;
        expect(item2.name).to.eql('pause');
        expect(item2.path).to.eql(self.app.config.ansiblePlaybooks + '/pause.yml');
        expect(item2.viewUrl).to.eql('/playbooks/' + item2.name);
      })
      .nodeify(done);        
  },

  'single': function(done) {
    var self = this;

    self.request.get('/playbooks/normal?format=json')
      .expect(200)
      .then(function(res) {
        var json = res.body;

        expect(json.selectedPlaybookId).to.eql('normal');
        expect(json.triggers).to.eql([]);
        expect(json.code).to.eql(fs.readFileSync(self.app.config.ansiblePlaybooks + '/normal.yml', {
          encoding: 'utf8'
        }));

        json.playbook = json.playbook || {};
        expect(json.playbook._id).to.exist;
        expect(json.playbook.name).to.eql('normal');
        expect(json.playbook.path).to.eql(self.app.config.ansiblePlaybooks + '/normal.yml');
        expect(json.playbook.viewUrl).to.eql('/playbooks/normal');

        json.playbooks = json.playbooks || [];
        expect(json.playbooks.length).to.eql(2);
        expect(json.playbooks[0]).to.eql(json.playbook);
      })
      .nodeify(done);        
  }
};



test['simple trigger'] = {
  before: _testSetup,
  after: _testShutdown,

  'get step1': function(done) {
    var self = this;

    self.request.get('/playbooks/normal/addTrigger?format=json')
      .expect(200)
      .then(function(res) {
        var json = res.body;

        var form = json.form || {};
        expect(form.id).to.eql('addTrigger');
        expect(form.fields).to.exist;
        expect(form.order).to.eql(['description', 'type']);
      })
      .nodeify(done);        
  },
  'post step1': {
    'description required': function(done) {
      var self = this;

      self.request.post('/playbooks/normal/addTrigger?format=json')
        .send({
          type: 'simple'
        })
        .expect(400)
        .end(done);
    },
    'trigger type required': function(done) {
      var self = this;

      self.request.post('/playbooks/normal/addTrigger?format=json')
        .send({
          description: 'test'
        })
        .expect(400)
        .end(done);
    },
    'redirect to step2': function(done) {
      var self = this;

      self.request.post('/playbooks/normal/addTrigger?format=json')
        .send({
          description: 'test',
          type: 'simple'
        })
        .expect('location', '/playbooks/normal/addTrigger/step2')
        .then(function(res) {
          expect(res.body).to.eql({});
          expect(res.headers['set-cookie']).to.exist;
        })
        .nodeify(done);
    }
  },
  'post step 2 - created': {
    'simple trigger': function(done) {
      var self = this;

      self.request.post('/playbooks/normal/addTrigger?format=json')
        .send({
          description: 'test',
          type: 'simple'
        })
        .expect(302)
        .then(function(res){
          return self.request
            .post('/playbooks/normal/addTrigger/step2?format=json')
            .send({})
            .expect(302);
        })
        .then(function(res) {
          return self.request
            .get('/playbooks/normal?format=json')
            .expect(200);
        })
        .then(function(res) {
          var json = res.body;

          var triggers = json.triggers || [];
          expect(triggers.length).to.eql(1);

          expect(triggers[0].viewUrl).to.eql('/triggers/' + triggers[0]._id);
          expect(triggers[0].description).to.eql('test');
          expect(triggers[0].type).to.eql('simple');
          expect(triggers[0].configParams).to.eql({});
          expect(triggers[0].ansibleVars).to.eql({});
        })
        .nodeify(done);
    }      
  },
};



test['invoke trigger'] = {
  before: _testSetup,
  after: _testShutdown,

  'simple trigger': {

    before: function(done) {
      var self = this;

      // create the trigger
      Q.resolve(self.app.models.Playbook.getByName('normal'))
        .then(function(playbook) {
          self.playbook = playbook;

          self.trigger = new self.app.models.Trigger({
            playbook: self.playbook._id,
            description: 'test',
            type: 'simple',
            configParams: {}
          });

          return Q.promisify(self.trigger.save).call(self.trigger);
        })
        .nodeify(done);
    },

    'bad trigger id': function(done) {
      var self = this;

      self.request.get('/invoke/' + self.playbook._id)
        .expect(500)
        .then(function(res) {
          expect(res.body.msg).to.eql('Trigger not found');
        })
        .nodeify(done);
    },

    'bad token': function(done) {
      var self = this;

      self.request.get('/invoke/' + self.trigger._id + '?token=blah')
        .expect(200)
        .then(function() {
          return utils.waitFor(1000);
        })
        .then(function() {
          return Q.resolve(self.app.models.Job.getForTrigger(self.trigger._id))
        })
        .then(function(jobs) {
          if (!jobs || 0 === jobs.length) throw new Error('Jobs not found');

          var job = jobs[0];
          job.status.should.eql('failed');

          return Q.resolve(self.app.models.Log.getForJob(job._id));
        })
        .then(function(logs) {
          var log = _.find(logs, function(log) {
            return 'Incorrect auth token' === log.text;
          });

          expect(log).to.exist;
        })
        .nodeify(done);
    },

    'success': function(done) {
      var self = this;

      self.timeout(9000);

      self.request.get('/invoke/' + self.trigger._id + '?token=' + self.trigger.token)
        .expect(200)
        .then(function(err) {
          return utils.waitFor(1000);
        })
        .then(function() {
          return Q.resolve(self.app.models.Job.getForTrigger(self.trigger._id));
        })        
        .then(function(jobs) {
          if (!jobs || 0 === jobs.length) throw new Error('Jobs not found');

          var job = jobs[0];
          job.status.should.eql('completed');
        })
        .nodeify(done);              
    },
  }
};


test['no. of jobs in parallel'] = {
  beforeEach: function(done) {
    var self = this;

    _testSetup.call(self, {
      jobsInParallel: 2
    }, function(err) {
      if (err) return done(err);

      // create triggers
      Q.all([
        Q.resolve(self.app.models.Playbook.getByName('normal')),
        Q.resolve(self.app.models.Playbook.getByName('pause')),
      ])
        .spread(function(playbookA, playbookB) {
          self.playbookA = playbookA;
          self.playbookB = playbookB;

          self.triggerA1 = new self.app.models.Trigger({
            playbook: self.playbookA._id,
            description: 'test p1 t2',
            type: 'simple',
            configParams: {}
          });

          self.triggerA2 = new self.app.models.Trigger({
            playbook: self.playbookA._id,
            description: 'test p1 t2',
            type: 'simple',
            configParams: {}
          });

          self.triggerB1 = new self.app.models.Trigger({
            playbook: self.playbookB._id,
            description: 'test p2 t1',
            type: 'simple',
            configParams: {}
          });

          self.triggerB2 = new self.app.models.Trigger({
            playbook: self.playbookB._id,
            description: 'test p2 t2',
            type: 'simple',
            configParams: {}
          });

          return Q.all([
            Q.promisify(self.triggerA1.save).call(self.triggerA1),
            Q.promisify(self.triggerA2.save).call(self.triggerA2),
            Q.promisify(self.playbookB.save).call(self.playbookB),
            Q.promisify(self.triggerB1.save).call(self.triggerB1),
            Q.promisify(self.triggerB2.save).call(self.triggerB2),
          ]);
        })
        .nodeify(done);      
    });
  },

  afterEach: _testShutdown,

  
  'respects the limit': function(done) {
    var self = this;

    Q.all(
      (function() {
        var ret = [];

        for (var i=0; i<3; ++i) {
          ret.push(
            self.request.get('/invoke/' + self.triggerA1._id 
              + '?token=' + self.triggerA1.token).expect(200)
          );
          ret.push(
            self.request.get('/invoke/' + self.triggerB1._id 
              + '?token=' + self.triggerB1.token).expect(200)
          );
        }

        return ret;
      })()
    )
      .then(function() {
        return utils.waitFor(1000);
      })
      .then(function() {
        return Q.resolve(
          self.app.models.Job.find().exec()
        );
      })        
      .then(function(jobs) {
        if (!jobs || 0 === jobs.length) throw new Error('Jobs not found');

        var processing = _.filter(jobs, function(j) {
          return 'processing' === j.status || 'completed' === j.status;
        });

        expect(processing.length).to.eql(2);
      })
      .nodeify(done);              
  },


  'max. 1 job per playbook': function(done) {
    var self = this;

    Q.all(
      (function() {
        var ret = [];

        for (var i=0; i<3; ++i) {
          ret.push(
            self.request.get('/invoke/' + self.triggerB1._id 
              + '?token=' + self.triggerB1.token).expect(200)
          );
          ret.push(
            self.request.get('/invoke/' + self.triggerB2._id 
              + '?token=' + self.triggerB2.token).expect(200)
          );
        }

        return ret;
      })()
    )
      .then(function() {
        return utils.waitFor(1000);
      })
      .then(function() {
        return Q.resolve(
          self.app.models.Job.find().exec()
        );
      })        
      .then(function(jobs) {
        if (!jobs || 0 === jobs.length) throw new Error('Jobs not found');

        var processing = _.filter(jobs, function(j) {
          return 'processing' === j.status;
        });

        expect(processing.length).to.eql(1);
      })
      .nodeify(done);              
  }
};



test['job output timeout'] = {
  before: function(done) {
    var self = this;

    _testSetup.call(self, {
      outputTimeout: 5
    }, function(err) {
      if (err) return done(err);

      // create triggers
      Q.resolve(self.app.models.Playbook.getByName('pause'))
        .then(function(playbook) {
          self.playbookA = playbook;

          self.triggerA1 = new self.app.models.Trigger({
            playbook: self.playbookA._id,
            description: 'test p1 t2',
            type: 'simple',
            configParams: {}
          });

          return Q.all([
            Q.promisify(self.triggerA1.save).call(self.triggerA1),
          ]);
        })
        .nodeify(done);      
    });
  },

  after: _testShutdown,


  afterEach: function(done) {
    this.app.models.Job.remove(done);
  },

  
  'stops job if takes too long': function(done) {
    var self = this;

    self.timeout(8000);

    self.request.get('/invoke/' + self.triggerA1._id + '?token=' + self.triggerA1.token)
      .expect(200)
      .then(function() {
        return utils.waitFor(6000);
      })
      .then(function() {
        return Q.resolve(
          self.app.models.Job.getForTrigger(self.triggerA1._id)
        );
      })        
      .then(function(jobs) {
        if (!jobs || 0 === jobs.length) throw new Error('Jobs not found');

        var job = jobs[0];

        expect(job.status).to.eql('failed');

        return Q.resolve(self.app.models.Log.getForJob(job._id));
      })
      .then(function(logs) {
        var log = _.find(logs, function(log) {
          return 'Killed by Ansibot: Output timed out' === log.text;
        });

        expect(log).to.exist;
      })
      .nodeify(done);              
  },
};



