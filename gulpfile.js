var gulp = require('gulp'),
  path = require('path');

// require('gulp-grunt')(gulp); // add all the gruntfile tasks to gulp

var clean = require('gulp-clean');
var concat = require('gulp-concat');
var nib = require('nib');
var stylus = require('gulp-stylus');
var jshint = require('gulp-jshint');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');
var expect = require('gulp-expect-file');
var mocha = require('gulp-mocha');



var paths = {
  buildFolder: './frontend/build',

  stylusSrcFiles: './frontend/src/stylus/style.styl',
  stylusSrcFilesWatch: './frontend/src/stylus/*.styl',
  cssBuildFolder: './frontend/build/css',

  jsServerFiles: [
    './src/**/*.js',
  ],
  jsLibFiles: [
    './frontend/src/bower/minified/dist/minified-web-src.js',
  ],
  jsAppFiles: [
    './frontend/src/js/**/*.js',
  ],
  jsAppFilesWatch: './frontend/src/js/**/*.js',
  jsBuildFolder: './frontend/build/js',

  testFiles: './test/integration/*.test.js'
};


var logErrors = function() {
  console.log(arguments);
}


gulp.task('clean', function() {
  return gulp.src([ paths.buildFolder], {read: false})
    .pipe(clean());
});


gulp.task('css', function () {
  return gulp.src( paths.stylusSrcFiles )
    .pipe( stylus({
      use: [ nib() ],
      errors: true
    }) )
    .pipe( minifyCSS({
      keepSpecialComments: 0,
      noAdvanced: true
    }) )
    .pipe( gulp.dest( paths.cssBuildFolder ) )
    .pipe( gzip({ gzipOptions: { level: 9 } }) ) 
    .pipe( gulp.dest(paths.cssBuildFolder) )
    ;
});


gulp.task('jshint-backend', function() {
  return gulp.src(paths.jsServerFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
  ;
});


gulp.task('jshint-frontend', function() {
  return gulp.src(paths.jsAppFiles)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'))
  ;
});


gulp.task('js', ['jshint-frontend'], function() {
  return gulp.src( [].concat(paths.jsLibFiles, paths.jsAppFiles) )
    .pipe( concat('app.js') )
    .pipe( uglify() )
    .pipe( gulp.dest(paths.jsBuildFolder) )
    .pipe( gzip({ gzipOptions: { level: 9 } }) ) 
    .pipe( gulp.dest(paths.jsBuildFolder) )
    ;
})




// Rerun the task when a file changes
gulp.task('watch', ['css', 'js'], function() {
  gulp.watch(paths.stylusSrcFilesWatch, ['css']); // watch the same files in our scripts task
  gulp.watch(paths.jsAppFilesWatch, ['js']); // watch the same files in our scripts task
});



gulp.task('test', ['jshint-backend'], function () {
  return gulp.src(paths.testFiles, { read: false })
      .pipe(mocha({
        ui: 'exports',
        reporter: 'spec'
      }))
    ;
});



gulp.task('build', ['css', 'jshint-backend', 'js']);


gulp.task('verify_build', function() {
  return gulp.src(
      [].concat(
        path.join(paths.cssBuildFolder, '**', '*.*'),
        path.join(paths.jsBuildFolder, '**', '*.*')
      )
    )
    .pipe( expect([
      'frontend/build/css/style.css',
      'frontend/build/css/style.css.gz',
      'frontend/build/js/app.js',
      'frontend/build/js/app.js.gz',
    ]) )
  ;
})




// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build']);



