var _ = require('lodash'),
  co = require('co'),
  path = require('path'),
  Q = require('bluebird');


var utils = require('../../../utils'),
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should,
  sinon = utils.sinon;


var HipChatter = require('hipchatter'),
  HipChat = require(path.join(utils.appFolder, 'support', 'notifications', 'hipChat'));



var mocker;

var test = module.exports = {
  beforeEach: function() {
    mocker = sinon.sandbox.create();
  },
  afterEach: function() {
    mocker.restore();
  }
};




test['notify'] = function(done) {
  var notifyStub = mocker.stub(HipChatter.prototype, 'notify', function() {
    _.last(arguments)();
  });

  var h = new HipChat({
    roomId: 'test1',
    authToken: 'test2'
  });

  var notifyFn = _.bind(Q.promisify(co(h.notify)), h);

  notifyFn('msg1')
    .then(function() {
      notifyStub.should.have.been.calledWith('test1', {
        message: 'msg1',
        color: 'yellow',
        token: 'test2'
      });

      return notifyFn('msg2', 'success');
    })
    .then(function() {
      notifyStub.should.have.been.calledWith('test1', {
        message: 'msg2',
        color: 'green',
        token: 'test2'
      });

      return notifyFn('msg3', 'error');
    })
    .then(function() {
      notifyStub.should.have.been.calledWith('test1', {
        message: 'msg3',
        color: 'red',
        token: 'test2'
      });
    })
    .nodeify(done);
};


