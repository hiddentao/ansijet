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



var paths = {
  buildFolder: './frontend/build',
  cssBuildFolder: './frontend/build/css',
  cssSrcFiles: './frontend/src/stylus/style.styl',
  cssSrcFilesWatch: './frontend/src/stylus/*.styl',

  // jsSrcFiles: [
  //   './frontend/src/js/**/*.js',
  //   './frontend/src/bower_components/**/*.js',
  // ],
  // jsBuildFolder: './frontend/build/js',
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



// gulp.task('js', function() {
//   return gulp.src( paths.jsSrcFiles )
//     .pipe( concat() )
//     .pipe( uglify() )
//     .pipe( gulp.dest(paths.jsBuildFolder) )
//     .pipe( gzip({ gzipOptions: { level: 9 } }) ) 
//     .pipe( gulp.dest(paths.jsBuildFolder) )
//     ;
// })



// Rerun the task when a file changes
gulp.task('watch', ['css'], function() {
  gulp.watch(paths.cssSrcFilesWatch, ['css']); // watch the same files in our scripts task
  // gulp.watch(paths.jsSrcFiles, ['js']); // watch the same files in our scripts task
});



// The default task (called when you run `gulp` from cli)
gulp.task('default', ['clean', 'css', 'js']);



