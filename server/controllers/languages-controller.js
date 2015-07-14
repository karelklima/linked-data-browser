'use strict';

var domain = require('domain');

var _ = require('lodash');
var jwt = require('jsonwebtoken');

var config = require('../../config');
var languages = require('../models/languages');
var Toaster = require('../lib/toaster');
var prefixesManager = require('../lib/prefixes-manager');

/**
 * Creates a new language
 * @param req
 * @param res
 * @returns {Response|*|{}}
 */
exports.create = function(req, res) {

    req.checkBody('label', 'Language label must not be empty').notEmpty();
    req.checkBody('alias', 'Language alias must contain only alphanumeric characters').isAlphanumeric();

    var errors = req.validationErrors();

    if (!errors) {
        errors = [];
    }

    if (!_(errors).find({ param: 'alias' })) {
        if (languages.findByAlias(req.body.alias) !== false) {
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

    var languageProfile = languages.createLanguage(req.body.label, req.body.alias);
    toastr.success("Language created successfully");
    return res.status(201).send({
        toasts: toastr.getToasts(),
        language: languageProfile
    });

};

/**
 * List all languages
 */
exports.getAll = function(req, res) {

    var languagesData = languages.getAll();

    return res.status(200).json(languagesData);

};

/**
 * Removes an endpoint
 */
exports.remove = function(req, res) {

    req.checkQuery('id', 'Language ID not provided').notEmpty();

    var toaster = new Toaster();

    toaster.importValidationErrors(req.validationErrors());
    if (toaster.size() > 0) {
        return res.status(400).json(toaster.toJSON());
    }

    var languageData = languages.findById(req.query.id);
    if (!languageData) {
        toaster.error('Language with given ID not found');
        return res.status(400).json(toaster.toJSON());
    }

    if (languageData.default) {
        toaster.error('Default language cannot be removed');
        return res.status(400).json(toaster.toJSON());
    }

    languages.removeById(req.query.id);
    toaster.success('Language was successfully removed');

    return res.status(200).json(toaster.toJSON());
};

/**
 * Updates a language
 */
exports.update = function(req, res) {

    req.checkBody('id', 'Language ID not provided').notEmpty();
    var toaster = new Toaster();

    toaster.importValidationErrors(req.validationErrors());
    if (toaster.size() > 0) {
        return res.status(400).json(toaster.toJSON());
    }

    var params = req.body;

    var languageData = languages.findById(params.id);
    if (!languageData) {
        toaster.error('Language with given ID not found');
        return res.status(400).json(toaster.toJSON());
    }

    if (params.default != true && languageData.default == true) {
        toaster.error('The default attribute cannot be removed');
        return res.status(400).json(toaster.toJSON());
    }

    // Only one default language allowed
    if (params.default == true) {
        var currentDefault = languages.getDefault();
        if (!currentDefault) {
            toaster.error('Default language is missing');
            return res.status(400).json(toaster.toJSON());
        }
        languages.updateById(currentDefault.id, {
            default: false
        });
    }

    var id = params.id;
    var data = _.clone(params);
    delete data.id;
    languages.updateById(id, data);
    toaster.success('Language was successfully updated');

    return res.status(200).json(toaster.toJSON());

};
