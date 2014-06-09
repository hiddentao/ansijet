var gulp = require('gulp'),
  path = require('path');

// require('gulp-grunt')(gulp); // add all the gruntfile tasks to gulp

var clean = require('gulp-clean');
var concat = require('gulp-concat');
var nib = require('nib');
var stylus = require('gulp-stylus');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var gzip = require('gulp-gzip');
var expect = require('gulp-expect-file');



var paths = {
  buildFolder: './frontend/build',
  cssBuildFolder: './frontend/build/css',
  cssSrcFiles: './frontend/src/stylus/style.styl',
  cssSrcFilesWatch: './frontend/src/stylus/*.styl',

  jsSrcFiles: [
    './frontend/src/bower/minified/dist/minified-web-src.js',
    './frontend/src/js/**/*.js',
  ],
  jsSrcFilesWatch: './frontend/src/js/**/*.js',
  jsBuildFolder: './frontend/build/js',
};


var logErrors = function() {
  console.log(arguments);
}


gulp.task('clean', function() {
  return gulp.src([ paths.buildFolder], {read: false})
    .pipe(clean());
});


gulp.task('css', function () {
  return gulp.src( paths.cssSrcFiles )
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



gulp.task('js', function() {
  return gulp.src( paths.jsSrcFiles )
    .pipe( concat('all.js') )
    .pipe( uglify() )
    .pipe( gulp.dest(paths.jsBuildFolder) )
    .pipe( gzip({ gzipOptions: { level: 9 } }) ) 
    .pipe( gulp.dest(paths.jsBuildFolder) )
    ;
})



// Rerun the task when a file changes
gulp.task('watch', ['css', 'js'], function() {
  gulp.watch(paths.cssSrcFilesWatch, ['css']); // watch the same files in our scripts task
  gulp.watch(paths.jsSrcFilesWatch, ['js']); // watch the same files in our scripts task
});



gulp.task('build', ['clean', 'css', 'js']);


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
      'frontend/build/js/all.js',
      'frontend/build/js/all.js.gz',
    ]) )
  ;
})



// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build']);



