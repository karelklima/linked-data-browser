'use strict';

var _ = require('lodash');
var low = require('lowdb');
var underscoreDb = require('underscore-db');

var config = require('../../config');

function Prefixes() {
    var prefixesDatabase = low(config.datastore + '/prefixes.json');
    prefixesDatabase._.mixin(underscoreDb);
    var prefixes = prefixesDatabase('prefixes');

    function findOne(spec) {
        var record = prefixes.find(spec);
        if (_.isObject(record)) {
            return _.clone(record);
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

    this.createPrefixes = function(alias, prefixesList) {
        prefixes.insert({
            alias: alias,
            prefixes: prefixesList
        });
        return findOne({
            alias: alias
        });
    };

    this.getAll = function() {
        return prefixes.value();
    };

    this.removeById = function(id) {
        return prefixes.removeById(id);
    };

    this.updateById = function(id, data) {
        return prefixes.updateById(id, data);
    };

}

var prefixes = new Prefixes();
module.exports = prefixes;