'use strict';

var gulp = require('gulp');

var env = process.env.NODE_ENV || 'development';

require('require-dir')('./gulp');

console.log('Invoking gulp, env: ', env);

gulp.task('default', ['clean'], function(defaultTasks) {
    gulp.start(env);
});