'use strict';

var _ = require('lodash');
var low = require('lowdb');
var underscoreDb = require('underscore-db');

var config = require('../../config');

function Languages() {
    var usersDatabase = low(config.datastore + '/languages.json');
    usersDatabase._.mixin(underscoreDb);
    var languages = usersDatabase('languages');

    if (languages.size() < 1) {
        createDefaultLanguage();
    }

    function createDefaultLanguage() {
        var language = config.defaultLanguage;
        languages.insert({
            label: language.label,
            alias: language.alias,
            default: true
        });
    }

    function findOne(spec) {
        var language = languages.find(spec);
        if (_.isObject(language)) {
            return _.clone(language);
        }
        return false;
    }

    this.findByAlias = function(alias) {
        return findOne({
            alias: alias
        });
    };

    this.findById = function(id) {
        return findOne({
            id: id
        });
    };

    this.createLanguage = function(label, alias) {
        languages.insert({
            label: label,
            alias: alias,
            default: false
        });
        return findOne({
            alias: alias
        });
    };

    this.getAll = function() {
        return languages.value();
    };

    this.getDefault = function() {
        return findOne({
            default: true
        });
    };

    this.removeById = function(id) {
        return languages.removeById(id);
    };

    this.updateById = function(id, data) {
        return languages.updateById(id, data);
    };

}

var languages = new Languages();
module.exports = languages;