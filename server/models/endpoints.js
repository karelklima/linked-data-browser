'use strict';

var _ = require('lodash');
var low = require('lowdb');
var underscoreDb = require('underscore-db');

var config = require('../../config');

function Endpoints() {
    var usersDatabase = low(config.datastore + '/endpoints.json');
    usersDatabase._.mixin(underscoreDb);
    var endpoints = usersDatabase('endpoints');

    if (endpoints.size() < 1) {
        createDefaultEndpoint();
    }

    function createDefaultEndpoint() {
        var endpoint = config.defaultEndpoint;
        endpoints.insert({
            name: endpoint.name,
            alias: endpoint.alias,
            url: endpoint.url,
            default: true
        });
    }

    function findOne(spec) {
        var endpoint = endpoints.find(spec);
        if (_.isObject(endpoint)) {
            return _.clone(endpoint);
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

    this.createEndpoint = function(name, alias, url) {
        endpoints.insert({
            name: name,
            alias: alias,
            url: url,
            default: false
        });
        return findOne({
            alias: alias
        });
    };

    this.getAll = function() {
        return endpoints.value();
    };

    this.getDefault = function() {
        return findOne({
            default: true
        });
    };

    this.removeById = function(id) {
        return endpoints.removeById(id);
    };

    this.updateById = function(id, data) {
        return endpoints.updateById(id, data);
    };

}

var endpoints = new Endpoints();
module.exports = endpoints;