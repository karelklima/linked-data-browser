var _ = require('lodash');

module.exports = {

    name: 'Raw display',
    raw: true,

    matchInstances: function(resourceGraph) {
        var instances = [];

        instances.push({ special: '@id' });

        if (_.has(resourceGraph, '@type') && resourceGraph['@type'].length > 0) {
            instances.push({special: '@type'});
        }

        _.forEach(resourceGraph.property, function(property) {
            instances.push(_.pick(property, ['@id', 'relation']));
        });

        return instances;
    },

    displayPriority: -100,
    setupPriority: -100

};