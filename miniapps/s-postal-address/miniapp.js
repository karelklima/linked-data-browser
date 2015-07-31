var _ = require('lodash');

var matchInstancesFunction = function (resourceGraph) {
    var instances = [];
    _.forEach(resourceGraph.property, function (property) {
        if (_.includes(property.sampleTypes, "http://schema.org/PostalAddress")) {
            instances.push({
                property: property['@id'],
                relation: property['relation']
            });
        }
    });
    return instances;
};

module.exports = {
    description: 'Postal address display',
    matchInstances: matchInstancesFunction,
    inhibitInstances: function (resourceGraph) {
        return [{
            miniapp: '*',
            instances: matchInstancesFunction(resourceGraph)
        }];
    },
    displayPriority: 100,
    setupPriority: 0
};