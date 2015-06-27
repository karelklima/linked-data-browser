'use strict';

var bowerComponents = require('bower-files')();

module.exports = {
    css: {
        "build/components.min.css": bowerComponents.ext('css').files
    },
    js: {
        "build/components.min.js": bowerComponents.ext('js').files
    }
};