var _ = require('lodash');

module.exports = {

    description: 'Default rdf:type display',

    matchInstances: function(resourceGraph) {
        var instances = [];
        if (resourceGraph['@type'].length > 0) {
            instances.push({ property: '@type' });
        }
        return instances;
    },

    displayPriority: 200,
    setupPriority: -1000

};