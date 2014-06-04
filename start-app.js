#!/usr/bin/env node --harmony
"use strict";


/**
 * @fileOverview The main entry point for your Waigo application.
 */


var co = require('co'),
  waigo = require('waigo');


co(function*() {
  /*
  Initialise the Waigo framework.

  If you need to override the application source folder and/or plugins to 
  be loaded then this is the place to do it.

   */
  yield waigo.init();

  /*
  Start the application.

  This loads in application configuration, runs all startup steps, sets up 
  the middleware and kicks off the HTTP listener.
   */
  yield waigo.load('application').start();

})(function(err) {
  if (err) {
    console.error(err.stack);
  }
});


