'use strict';

var bowerComponents = require('bower-files')();

module.exports = {
    css: bowerComponents.ext('css').files,
    js: bowerComponents.ext('js').files
};