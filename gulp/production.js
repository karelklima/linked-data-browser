var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var path = require('path');
var _ = require('lodash');

var defaultTasks = ['clean', 'build-components-css', 'build-components-js', 'serve:production'];

var components = require('../config/bower-components.js');

console.log(components);

gulp.task('env:production', function (){
    process.env.NODE_ENV = 'production';
});

gulp.task('build-components-css', function () {
  console.log('in build-components-css');
  var config = tokenizeConfig(components.css);

  if (config.srcGlob.length) {
    return gulp.src(config.srcGlob)
      .pipe(plugins.cssmin({keepBreaks: true}))
      .pipe(plugins.concat(config.destFile))
      .pipe(gulp.dest(config.destDir));
  }
});

gulp.task('build-components-js', function () {
  console.log('in build-components-js');
  var config = tokenizeConfig(components.js);

  if (config.srcGlob.length) {
    return gulp.src(config.srcGlob)
      .pipe(plugins.concat(config.destFile))
      .pipe(plugins.uglify({mangle: false}))
      .pipe(gulp.dest(config.destDir));
  }
});

function tokenizeConfig(config) {
  var destTokens = _.keys(config)[0].split('/');

  return {
    srcGlob: _.flatten(_.values(config)),
    destDir: destTokens[destTokens.length - 2],
    destFile: destTokens[destTokens.length - 1]
  };
}

gulp.task('build-components', ['build-components-js', 'build-components-css'], function() {
   console.log("in build-components");
});

gulp.task('build:production', ['clean', 'build-components'], function() {
    console.log("in build:production");
});

gulp.task('serve:production', ['env:production', 'build:production'], function () {
  plugins.nodemon({
    script: 'linked-data-browser.js',
    ext: 'html js',
    env: { 'NODE_ENV': 'production' } ,
    ignore: ['./node_modules/**']
  });
});

gulp.task('production',defaultTasks);
