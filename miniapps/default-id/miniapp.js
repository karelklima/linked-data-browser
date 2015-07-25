var _ = require('lodash');

module.exports = {

    description: 'Default URI display',

    matchInstances: function(resourceGraph) {
        return [{ property: '@id' }];
    },

    displayPriority: 300,
    setupPriority: -1000

};