(function() {

    'use strict';

    angular.module('app.services')

        .service('Describe', ['$rootScope', '$http', '$q', 'State',
            function Describe($rootScope, $http, $q, State) {

                this.describeGraphs = function(resource) {
                    return $http.get('/api/describe-graphs', { params: {
                        endpoint: State.getCurrentEndpoint().alias,
                        resource: resource
                    }}).then(function(response) {
                        return response.data;
                    });
                };

                this.describeRaw = function(resource, graphs) {
                    graphs = graphs || [];
                    return $http.get('/api/describe-raw', { params: {
                        endpoint: State.getCurrentEndpoint().alias,
                        resource: resource,
                        "endpoint-param-default-graph-uri[]": graphs
                    }}).then(function(response) {
                            return response.data['@graph'][0];
                        });
                }

            }
        ]);

})();