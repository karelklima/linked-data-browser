(function() {

    'use strict';

    angular.module('app.services')

        .service('SearchQueryParser', ['$rootScope', '$q', 'lodash', function ($rootScope, $q, _) {

            var parseRegex = /( |^)(type:|property:|graph:)([a-z]+:[a-zA-Z0-9_-]+(?= |$)|http:\/\/[^ ]+(?= |$))/g;
            var resourceRegex = /^(http:\/\/[^ ]+|[a-z]+:[a-zA-Z0-9_-]+)$/;

            function parseQueryAttributes(query) {
                query = _.trim(query);

                var result = {
                    resource: null,
                    query: null,
                    types: [],
                    properties: [],
                    graphs: []
                };

                if (query.match(resourceRegex)) {
                    result.resource = query;
                    return result;
                }

                var remainder = query.replace(parseRegex, function(m1, m2, m3, m4, m5, m6, m7) {
                    console.log(arguments);
                    if (m3 == "type:") {
                        result.types.push(_.trim(m4));
                    }
                    if (m3 == "property:") {
                        result.properties.push(_.trim(m4));
                    }
                    if (m3 == 'graph:') {
                        result.graphs.push(_.trim(m4));
                    }
                    var x = 1;
                    return " ";
                });

                remainder = _.trim(remainder);
                if (remainder.length > 0) {
                    result.query = remainder;
                }

                return result;
            }

            function parseQueryExpression(query) {
                var output = query;
                if (!_.startsWith(query, '"')) {
                    output = '"' + query + '"';
                }
                return output;
            }

            this.parse = function(query) {

                var output = parseQueryAttributes(query);

                if (output.query != null) {
                    output.query = parseQueryExpression(output.query)
                }

                return output;

            };

        }]);

})();