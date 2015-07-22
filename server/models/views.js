'use strict';

var _ = require('lodash');
var low = require('lowdb');
var underscoreDb = require('underscore-db');

var config = require('../../config');

function Views() {
    var usersDatabase = low(config.datastore + '/views.json');
    usersDatabase._.mixin(underscoreDb);
    var views = usersDatabase('views');

    function findOne(spec) {
        var view = views.find(spec);
        if (_.isObject(view)) {
            return _.clone(view);
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

    this.createView = function(viewData) {
        views.insert(viewData);
        return findOne(viewData);
    };

    this.removeById = function(id) {
        return views.removeById(id);
    };

    this.updateById = function(id, data) {
        return views.updateById(id, data);
    };

    this.getAll = function() {
        return views.value();
    };

}

var views = new Views();
module.exports = views;