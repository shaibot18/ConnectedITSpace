'use strict';

const gulp = require('gulp');
const usemin = require('gulp-usemin');
const wrap = require('gulp-wrap');
const connect = require('gulp-connect');
const watch = require('gulp-watch');
const minifyCss = require('gulp-cssnano');
const minifyJs = require('gulp-uglify');
const concat = require('gulp-concat');
const less = require('gulp-less');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const minifyHTML = require('gulp-htmlmin');
const gls = require('gulp-live-server');

const paths = {
  scripts: ['app/**/*.js'],
  html: 'app/**/*.html',
  index: 'app/index.html',
  dest: 'dist/'
};

/**
 * Handle bower components from index
 */
gulp.task('usemin', () => {
  return gulp.src(paths.index)
    .pipe(usemin({
      js: [minifyJs(), 'concat'],
      css: [minifyCss({ keepSpecialComments: 0 }), 'concat'],
    }))
    .pipe(gulp.dest(paths.dest));
});

gulp.task('scripts', () => {
  return gulp.src(paths.scripts)
    .pipe(minifyJs())
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('dist/js'));
});

/**
 * Handle custom files
 */
gulp.task('build', ['custom-js', 'custom-templates']);



gulp.task('custom-templates', function () {
  return gulp.src(paths.html)
    .pipe(minifyHTML())
    .pipe(gulp.dest('dist/html'));
});
/**
 * Watch custom files
 */
// gulp.task('watch', function () {
//   gulp.watch([paths.images], ['custom-images']);
//   gulp.watch([paths.styles], ['custom-less']);
//   gulp.watch([paths.scripts], ['custom-js']);
//   gulp.watch([paths.templates], ['custom-templates']);
//   gulp.watch([paths.index], ['usemin']);
// });

/**
 * Live reload server
 */
/*gulp.task('webserver', function() {
    connect.server({
        root: 'dist',
        livereload: true,
        port: 8888
    });
});*/
// gulp.task('webserver', function () {
//   var server = gls.new('bin/www');
//   server.start();
// });


// gulp.task('livereload', function () {
//   gulp.src(['public/**/*.*'])
//     .pipe(watch(['public/**/*.*']))
//     .pipe(connect.reload());
// });

/**
 * Gulp tasks
 */
// gulp.task('default', ['build', 'webserver', 'livereload', 'watch']);
gulp.task('default', ['build']);
