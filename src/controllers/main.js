"use strict";



exports.index = function*(next) {
  yield this.render('index', {
    title: 'Welcome to Ansibot!'
  });
};




exports.setup = function*(next) {
  yield this.render('setup', {
    title: 'Hello Waigo!'
  });
};
