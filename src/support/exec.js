"use strict";

var spawn = require('child_process').spawn,
  Q = require('bluebird');




/**
 * Execute a shell command.
 *
 * If successful the result will contain the stdout output. If not 
 * successful then the result will be an `Error` with the `stdout` and 
 * `exitCode` member variables set.
 *
 * @param {String} cmd Command to execute.
 * 
 * @return {Promise}
 */
module.exports = function(cmd) {
  var defer = Q.defer();

  var data = {
    stdout: '',
    stderr: '',
    code: 0
  }

  var proc = spawn(cmd);

  proc.stdout.on('data', function(data) {
    data.stdout += data;
  });

  proc.stderr.on('data', function(data) {
    data.stderr += data;
  });

  proc.on('close', function(code) {
    data.code = code;

    if (0 !== code) {
      var e = new Error('Command failed');
      e.data = data;

      defer.reject(e);
    } else {
      defer.resolve(data);
    }
  });

  proc.on('error', function(err) {
    err.data = data;
    err.data.code = -1;

    defer.reject(err);
  });

  return defer.promise;
};


