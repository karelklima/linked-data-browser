'use strict';

var domain = require('domain');

var _ = require('lodash');
var jwt = require('jsonwebtoken');

var config = require('../../config');
var endpoints = require('../models/endpoints');
var Toaster = require('../lib/toaster');
var prefixesManager = require('../lib/prefixes-manager');

/**
 * Creates a new endpoint
 * @param req
 * @param res
 * @returns {Response|*|{}}
 */
exports.create = function(req, res) {

    req.checkBody('name', 'Endpoint name must not be empty').notEmpty();
    req.checkBody('alias', 'Endpoint alias must contain only alphanumeric characters').isAlphanumeric();
    req.checkBody('url', 'You must provide a valid URL address').isURL();

    var errors = req.validationErrors();

    if (!errors) {
        errors = [];
    }

    if (!_(errors).find({ param: 'alias' })) {
        if (endpoints.findByAlias(req.body.alias) !== false) {
            errors = _([{
                param: 'alias',
                msg: 'This alias is already in use'
            }]).concat(errors).value();
        }
    }

    var toastr = new Toaster();
    toastr.importValidationErrors(errors);

    if (toastr.size() > 0) {
        return res.status(400).json(toastr.toJSON());
    }

    var endpointProfile = endpoints.createEndpoint(req.body.name, req.body.alias, req.body.url);
    toastr.success("Endpoint created successfully");
    return res.status(201).send({
        toasts: toastr.getToasts(),
        endpoint: endpointProfile
    });

};

/**
 * List all endpoints
 */
exports.getAll = function(req, res) {

    var endpointsData = endpoints.getAll();

    return res.status(200).json(endpointsData);

};

/**
 * Removes an endpoint
 */
exports.remove = function(req, res) {

    req.checkQuery('id', 'Endpoint ID not provided').notEmpty();

    var toaster = new Toaster();

    toaster.importValidationErrors(req.validationErrors());
    if (toaster.size() > 0) {
        return res.status(400).json(toaster.toJSON());
    }

    var endpointData = endpoints.findById(req.query.id);
    if (!endpointData) {
        toaster.error('Endpoint with given ID not found');
        return res.status(400).json(toaster.toJSON());
    }

    if (endpointData.default) {
        toaster.error('Default endpoint cannot be removed');
        return res.status(400).json(toaster.toJSON());
    }

    endpoints.removeById(req.query.id);
    toaster.success('Endpoint was successfully removed');

    return res.status(200).json(toaster.toJSON());
};

/**
 * Updates an endpoint
 */
exports.update = function(req, res) {

    req.checkBody('id', 'Endpoint ID not provided').notEmpty();
    var toaster = new Toaster();

    toaster.importValidationErrors(req.validationErrors());
    if (toaster.size() > 0) {
        return res.status(400).json(toaster.toJSON());
    }

    var params = req.body.params;

    var endpointData = endpoints.findById(params.id);
    if (!endpointData) {
        toaster.error('Endpoint with given ID not found');
        return res.status(400).json(toaster.toJSON());
    }

    if (params.default != true && endpointData.default == true) {
        toaster.error('The default attribute cannot be removed');
        return res.status(400).json(toaster.toJSON());
    }

    // Only one default endpoint allowed
    if (params.default == true) {
        var currentDefault = endpoints.getDefault();
        if (!currentDefault) {
            toaster.error('Default endpoint is missing');
            return res.status(400).json(toaster.toJSON());
        }
        endpoints.updateById(currentDefault.id, {
            default: false
        });
    }

    var id = params.id;
    var data = _.clone(params);
    delete data.id;
    endpoints.updateById(id, data);
    toaster.success('Endpoint was successfully updated');

    return res.status(200).json(toaster.toJSON());

};

/**
 * Fetches built-in SPARQL prefixes from desired endpoint
 * @param req
 * @param res
 */
exports.prefixes = function(req, res) {

    req.checkQuery('endpoint', 'Endpoint alias not provided').notEmpty();

    var toaster = new Toaster();

    toaster.importValidationErrors(req.validationErrors());
    if (toaster.size() > 0) {
        return res.status(400).json(toaster.toJSON());
    }

    var endpointData = endpoints.findByAlias(req.query.endpoint);
    if (!endpointData) {
        toaster.error("Endpoint not found");
        return res.status(400).json(toaster.toJSON());
    }

    var d = domain.create();
    d.on('error', function(error) {
        console.error(error.message);
        console.error(error.stack);
        toaster.error("Unable to retrieve endpoint namespace prefixes");
        return res.status(400).json(toaster.toJSON());
    });

    d.run(function() {
        prefixesManager.getPrefixes(endpointData)
            .then(function(prefixes) {
                return res.status(200).json({ prefixes: prefixes });
            })
            .done();
    });

};
