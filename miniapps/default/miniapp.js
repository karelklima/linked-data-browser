var _ = require('lodash');

module.exports = {

    description: 'Default display',

    matchInstances: function(resourceGraph) {
        var instances = [];

        instances.push({ property: '@id' });

        if (_.has(resourceGraph, '@type') && resourceGraph['@type'].length > 0) {
            instances.push({ property: '@type' });
        }

        if (_.has(resourceGraph, 'property') && resourceGraph['property'].length > 0) {
            _.forEach(resourceGraph.property, function (property) {
                instances.push({
                    property: property['@id'],
                    relation: property['relation']
                });
            });
        }

        return instances;
    },

    displayPriority: -100,
    setupPriority: -100

};