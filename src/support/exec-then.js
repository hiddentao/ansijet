"use strict";

var _ = require('lodash'),
  spawn = require('child_process').spawn,
  Q = require('bluebird');

var Writable = require('stream').Writable;




/**
 * @constructor
 * @param {String} cmd Command to execute.
 * @param {Object} [options] Additional options to pass to child_process.spawn().
 * @param {Number} [options.outputTimeout] Timeout for output in seconds. If no output recieved within this time period then the call is terminated.
 */
var Exec = function(cmd, options) {
  var cmdArgs = cmd.split(' ');
  this._cmd = cmdArgs[0];
  this._args = cmdArgs.slice(1);
  this._args.unshift('-vv');
  this._options = options || {};
};




/**
 * Run this command.
 *
 * This will execute the command as a 'detached' process with 'stdin' set to 
 * /dev/nul (see node.js child_process docs).
 *
 * If successful the result will be of the form `{stdout: ..., stderr: ...}`.
 * 
 * If failed then the result will be an `Error` with the `code` set to status 
 * code (-1 if failed to spawn), and `stdout` set to stdout and `stderr` set 
 * to stderr.
 * 
 * @return {Promise}
 */
Exec.prototype.run = function() {
  var self = this;

  var defer = Q.defer();

  self._stdout = '';
  self._stderr = '';

  self._child = spawn(
    self._cmd,
    self._args,
    _.extend({}, self._options, {
      stdio: ['ignore', null, null],
      detached: true
    })
  );
  self._initOutputTimeoutTimer();

  self._child.stdout.on('data', function(data){
    self._stdout += data;
    self._initOutputTimeoutTimer();
  });

  self._child.stderr.on('data', function(data){
    self._stderr += data;
    self._initOutputTimeoutTimer();
  });

  self._child.on('close', self._onClose(defer));
  self._child.on('error', self._onError(defer));

  return defer.promise;
};



/**
 * Return handler for child 'close' event.
 * @param  {Object} defer Deferred object.
 * @return {Function}
 */
Exec.prototype._onClose = function(defer) {
  var self = this;

  return function(code) {
    self._childKilled = true;

    if (0 !== code) {
      var err = new Error(self._stdout + "\n" + self._stderr);
      err.code = code;
      (self._onError(defer))(err);
    } else {
      defer.resolve({
        stdout: self._stdout,
        stderr: self._stderr
      });
    }
  };
};





/**
 * Return handler for child 'error' event.
 * @param  {Object} defer Deferred object.
 * @return {Function}
 */
Exec.prototype._onError = function(defer) {
  var self = this;

  return function(err) {
    self._childKilled = true;

    if (undefined === err.code) {
      err.code = -1;
    }

    if (self._killReason) {
      err.message = 'Manually killed: ' + self._killReason;
    }

    err.stdout = self._stdout;
    err.stderr = self._stderr;

    defer.reject(err);
  };
};




/** 
 * Initialise output timeout timer.
 *
 * This initialises a timer which executes if no output is obtained within a 
 * given time period. The time period is obtained from the initial options 
 * passed to the instance constructor. If no timer period was set then this 
 * method does nothing.
 * 
 * @private
 */
Exec.prototype._initOutputTimeoutTimer = function() {
  var self = this;

  if (self._options.outputTimeout) {
    if (self._currentOutputTimeoutTimer) {
      clearTimeout(self._currentOutputTimeoutTimer);
    }

    self._currentOutputTimeoutTimer = setTimeout(function() {
      // if not already exited
      if (!self._childKilled) {
        // note that we're killing it manually
        self._killReason = 'Output timed out';
        // kill it
        self._child.kill();
      }
    }, self._options.outputTimeout * 1000);
  }
};






/**
 * Execute a shell command.
 *
 * @param {String} cmd Command to execute.
 * @param {Object} [options] Additional options to pass to child_process.spawn().
 * @param {Number} [options.outputTimeout] Timeout for output in seconds. If no output recieved within this time period then the call is terminated.
 * 
 * @return {Promise}
 */
module.exports = function(cmd, options) {
  return new Exec(cmd, options).run();
};


