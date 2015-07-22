'use strict';

var domain = require('domain');

var _ = require('lodash');
var jwt = require('jsonwebtoken');

var config = require('../../config');
var views = require('../models/views');
var Toaster = require('../lib/toaster');

/**
 * Creates a new view
 * @param req
 * @param res
 * @returns {Response|*|{}}
 */
exports.create = function(req, res) {

    var toastr = new Toaster();
    var viewProfile = views.createView(req.body);
    toastr.success("View created successfully");
    return res.status(201).send({
        toasts: toastr.getToasts(),
        view: viewProfile
    });

};

/**
 * List all views
 */
exports.getAll = function(req, res) {

    var viewsData = views.getAll();

    return res.status(200).json(viewsData);

};

/**
 * Removes a view
 */
exports.remove = function(req, res) {

    req.checkQuery('id', 'View ID not provided').notEmpty();

    var toaster = new Toaster();

    toaster.importValidationErrors(req.validationErrors());
    if (toaster.size() > 0) {
        return res.status(400).json(toaster.toJSON());
    }

    var viewData = views.findById(req.query.id);
    if (!viewData) {
        toaster.error('View with given ID not found');
        return res.status(400).json(toaster.toJSON());
    }

    views.removeById(req.query.id);
    toaster.success('View was successfully removed');

    return res.status(200).json(toaster.toJSON());
};

/**
 * Updates a view
 */
exports.update = function(req, res) {

    req.checkBody('id', 'View ID not provided').notEmpty();
    var toaster = new Toaster();

    toaster.importValidationErrors(req.validationErrors());
    if (toaster.size() > 0) {
        return res.status(400).json(toaster.toJSON());
    }

    var params = req.body;

    var viewData = views.findById(params.id);
    if (!viewData) {
        toaster.error('View with given ID not found');
        return res.status(400).json(toaster.toJSON());
    }

    var id = params.id;
    var data = _.clone(params);
    delete data.id;
    views.updateById(id, data);
    toaster.success('View was successfully updated');

    return res.status(200).json(toaster.toJSON());

};
