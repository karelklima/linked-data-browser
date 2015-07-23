'use strict';

var _ = require('lodash');

var miniappsModel = require('../models/miniapps');
var PrefixesReplacer = require('./prefixes-replacer');

function MiniappsResolver(graph) {

    var miniapps = [];

    function load() {
        miniapps = _.clone(miniappsModel.getAll());
        miniapps = _.filter(miniapps, function(miniapp) {
            return _.isUndefined(miniapp.raw) || miniapp.raw != true;
        });
    }

    function loadRaw() {
        miniapps = _.clone(miniappsModel.getAll());
        miniapps = _.filter(miniapps,  { raw: true });
    }

    function resolveMatchInstances(miniapp) {
        var matchInstances = miniapp.matchInstances(graph);
        if (matchInstances === true) {
            matchInstances = [{}]; // one default instance
        } else if (matchInstances === false) {
            matchInstances = []; // no instances
        } else if (!_.isArray(matchInstances)) {
            throw new Error("Invalid match instances recieved, an array of objects or boolean expected");
        } else if (!_.every(matchInstances, _.isPlainObject)) {
            throw new Error("Invalid match instances recieved, an array of objects expected");
        }
        miniapp._matchInstances = matchInstances;
    }

    function resolveInhibitInstances(miniapp) {
        var inhibitMiniappInstances = miniapp.inhibitInstances(graph);
        if (inhibitMiniappInstances === false) {
            inhibitMiniappInstances = [];
        } else if (!_.isArray(inhibitMiniappInstances)) {
            throw new Error("Invalid inhibit instances recieved, an array of objects or false expected");
        } else if (!_.every(inhibitMiniappInstances, _.isPlainObject)) {
            throw new Error("Invalid inhibit instances recieved, an array of objects expected");
        }
        _.forEach(inhibitMiniappInstances, function(miniappInstances) {
            if (_.isUndefined(miniappInstances.miniapp) || _.isEmpty(miniappInstances.miniapp)) {
                throw new Error("Invalid inhibit instance - a miniapp field is missing or empty");
            }
            if (_.isUndefined(miniappInstances.instances)) {
                throw new Error("Invalid inhibit instance - an instances field is missing");
            }
            var inhibitInstances = miniappInstances.instances;
            if (inhibitInstances === true) {
                inhibitInstances = [{}]; // match all
            } else if (inhibitInstances === false) {
                inhibitInstances = []; // no instances
            } else if (!_.isArray(inhibitInstances)) {
                throw new Error("Invalid inhibit instances recieved, an array of objects or boolean expected");
            } else if (!_.every(inhibitInstances, _.isPlainObject)) {
                throw new Error("Invalid inhibit instances recieved, an array of objects expected");
            }
            miniappInstances.instances = inhibitInstances;
        });

        miniapp._inhibitInstances = inhibitMiniappInstances;
    }

    function removeInstances(target, instances) {
        _.forEach(instances, function (inhibitedInstance) {
            target._matchInstances = _.filter(target._matchInstances, function(matchInstance) {
                console.log(inhibitedInstance);
                var pick = _.pick(matchInstance, _.keys(inhibitedInstance));
                return !_.isEqual(pick, inhibitedInstance);
            });
        });
    }

    function applyInhibitInstances(miniapp) {
        _.forEach(miniapp._inhibitInstances, function(miniappInhibitInstances) {
            var targets = _.filter(miniapps, function(potentialTarget) {
                if (potentialTarget.setupPriority >= miniapp.setupPriority) {
                    return false;
                }
                else if (potentialTarget.id == miniappInhibitInstances.miniapp || miniappInhibitInstances.miniapp == '*') {
                    return true;
                }
                return false;
            });
            _.forEach(targets, function(target) {
                removeInstances(target, miniappInhibitInstances.instances);
            })
        })
    }

    function getDisplayInstances() {
        miniapps = _(_.sortBy(miniapps, 'displayPriority')).reverse().value();
        var instances = [];
        _.forEach(miniapps, function(miniapp) {
            _.forEach(miniapp._matchInstances, function(instance) {
                instances.push({
                    miniapp: miniapp.id,
                    instance: _.clone(instance)
                })
            })
        });
        return instances;
    }

    function resolve() {
        _.forEach(miniapps, resolveMatchInstances);
        _.forEach(miniapps, resolveInhibitInstances);
        _.forEach(miniapps, applyInhibitInstances);
        return getDisplayInstances();
    }

    this.resolve = function(graph) {
        load();
        return resolve();
    };

    this.resolveRaw = function(graph) {
        loadRaw();
        return resolve();
    }

}

module.exports = MiniappsResolver;