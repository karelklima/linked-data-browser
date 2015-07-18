'use strict';

var ToasterError = require('./toaster-error');

var endpoints = require('../models/endpoints');

module.exports.resolve = function(alias) {

    if (!alias) {
        throw new ToasterError("SPARQL endpoint not specified");
    }
    else {
        var resolved = endpoints.findByAlias(alias);
        if (!resolved) {
            throw new ToasterError("Requested SPARQL endpoint does not exist");
        }
        return resolved;
    }

};