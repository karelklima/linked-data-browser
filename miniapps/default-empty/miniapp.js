var _ = require('lodash');

module.exports = {

    description: 'Empty resource information',

    matchInstances: function(resourceGraph) {
        return resourceGraph['@type'].length < 1 && resourceGraph['property'].length < 1;
    },

    displayPriority: -100,
    setupPriority: -100

};