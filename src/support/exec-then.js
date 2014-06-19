"use strict";

var _ = require('lodash'),
  spawn = require('child_process').spawn,
  Q = require('bluebird'),
  waigo = require('waigo');

var Writable = require('stream').Writable;

var timers = waigo.load('support/timers');




/**
 * @constructor
 * @param {String} cmd Command to execute.
 * @param {Object} [options] Additional options to pass to child_process.spawn().
 * @param {Number} [options.outputTimeout] Timeout for output in seconds. If no output recieved within this time period then the call is terminated. If not set or if 0 then 300 seconds is assumed.
 */
var Exec = function(cmd, options) {
  var cmdArgs = cmd.split(' ');
  this._cmd = cmdArgs[0];
  this._args = cmdArgs.slice(1);
  this._options = options || {};

  this._outputTimeoutTimer = timers.new(
    this._outputTimeoutHandler,
    (this._options.outputTimeout || 300) * 1000,
    {
      this: this,
      repeat: true
    }
  );
};




/**
 * Run this command.
 *
 * This will execute the command as a 'detached' process with 'stdin' set to 
 * /dev/nul (see node.js child_process docs).
 *
 * If successful the result will be of the form `{stdout: ..., stderr: ...}`.
 * 
 * If failed then the result will be an `Error` with the `exitCode` set to exit  
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

  self._outputTimeoutTimer.start();

  self._child.stdout.on('data', function(data){
    self._stdout += data;
    self._outputTimeoutTimer.synchronize();
  });

  self._child.stderr.on('data', function(data){
    self._stderr += data;
    self._outputTimeoutTimer.synchronize();
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
    self._outputTimeoutTimer.stop();

    self._childKilled = true;

    if (0 !== code) {
      var err = new Error(self._stdout + "\n" + self._stderr);
      err.exitCode = code;
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
    self._outputTimeoutTimer.stop();

    self._childKilled = true;

    if (self._killReason) {
      err.exitCode = null;
      err.message = 'Killed by Ansibot: ' + self._killReason;
    } else {
      err.exitCode = err.code || -1;
    }

    err.stdout = self._stdout;
    err.stderr = self._stderr;

    defer.reject(err);
  };
};




/** 
 * Handle an output timeout timer tick.
 *
 * If this gets called then it means no output has been received for the 
 * configured timeout period, and so we have a problem.
 * 
 * @private
 */
Exec.prototype._outputTimeoutHandler = function() {
  // if not already exited
  if (!this._childKilled) {
    // note that we're killing it manually
    this._killReason = 'Output timed out';
    // kill it
    this._child.kill();
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


