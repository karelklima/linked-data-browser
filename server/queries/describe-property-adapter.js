var _ = require('lodash');
var config = require('../../config');

module.exports = function(query) {

    query.prepareParams = function(params) {
        params['requested-properties'] = config.describeQuery.properties;
        params['limit'] = params['limit'] || config.describeQuery.sampleCount;
        return params;
    };


};