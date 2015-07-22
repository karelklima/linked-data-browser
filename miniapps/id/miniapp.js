var _ = require('lodash');

module.exports = {

    name: 'Resource URI display',

    matchInstances: function(resourceGraph) {
        var instances = [];
        instances.push({ special: '@id' });
        return instances;
    },

    inhibitInstances: function(resourceGraph) {
        return [{
            miniapp: 'default',
            instances: [{ special: '@id' }]
        }];
    }

};