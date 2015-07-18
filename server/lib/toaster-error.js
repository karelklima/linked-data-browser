'use strict';

var Toaster = require('./toaster');

module.exports = function ToasterError(message, code, log) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.code = code || 400;
    var toaster = new Toaster();
    toaster.error(message);
    this.json = toaster.toJSON();
    this.log = log;
};

require('util').inherits(module.exports, Error);