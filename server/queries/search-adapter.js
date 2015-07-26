var _ = require('lodash');
var config = require('../../config');

module.exports = function(query) {

    query.prepareParams = function(params) {

        params.labels = config.searchQuery.labels;

        params.valuesType = "";
        if (_.isArray(params.types) && params.types.length > 0) {
            var types = _.map(params.types, function(type) {
                if (_.startsWith(type, 'http://')) {
                    return '<' + type + '>';
                }
                return type;
            });
            params.valuesType = "VALUES ?type { " + types.join(' ') + " }\n";
        }

        params.valuesProperty = "";
        if (_.isArray(params.properties) && params.properties.length > 0) {
            var properties = _.map(params.properties, function(property) {
                if (_.startsWith(property, 'http://')) {
                    return '<' + property + '>';
                }
                return property;
            });
            params.valuesProperty = "VALUES ?property { " + properties.join(' ') + " }\n";
        }

        return params;
    };

    query.getContext = function() {
        return {
            "text" : "http://my/text",
            "label" : "http://my/label",
            "graph" : "http://my/graph",
            "score" : "http://my/score"
        }
    };

    query.prepareResponse = function(response) {
        if (_.isArray(response['@graph'])) {
            _.forEach(response['@graph'], function(result) {
                result['score'] = result['score'][0];
            });
            response['@graph'] = _(response['@graph']).sortBy('score').reverse().value();
        }
        return response;
    }

};