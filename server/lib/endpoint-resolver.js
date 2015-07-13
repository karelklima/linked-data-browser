'use strict';

var endpoints = require('../models/endpoints');

module.exports.resolve = function(alias) {

    if (!alias) {
        var resolvedDefault = endpoints.getDefault();
        if (!resolvedDefault) {
            throw new Error("Default endpoint not specified");
        }
        return resolvedDefault;
    }
    else {
        var resolved = endpoints.findByAlias(alias);
        if (!resolved) {
            throw new Error("Requested endpoint does not exist");
        }
        return resolved;
    }

};