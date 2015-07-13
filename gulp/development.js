'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var defaultTasks = ['clean', 'devServe'];

gulp.task('env:development', function () {
  process.env.NODE_ENV = 'development';
});

gulp.task('serve:development', ['env:development'], function () {
  plugins.nodemon({
    script: 'bootstrap.js',
    ext: 'html js',
    env: { 'NODE_ENV': 'development' } ,
    ignore: ['node_modules/'],
    nodeArgs: ['--debug']
  });
});

gulp.task('development', defaultTasks);
