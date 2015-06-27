// Gulp Utils

'use strict';

var gulp = require('gulp');
var del = require('del');
var plugins = require('gulp-load-plugins');

gulp.task('help', plugins.taskListing);

gulp.task('clean', function(callback) {
    return del(['build'], callback);
});