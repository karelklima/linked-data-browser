(function() {

    'use strict';

    angular.module('app.services')

        .service('Describe', ['$rootScope', '$http', '$q', 'CurrentStateHelper',
            function Describe($rootScope, $http, $q, CurrentStateHelper) {

                this.describeGraphs = function(resource) {
                    return $http.get('/api/describe-graphs', { params: {
                        endpoint: CurrentStateHelper.getCurrentEndpoint().alias,
                        resource: resource
                    }}).then(function(response) {
                        return response.data;
                    });
                };

                this.describeRaw = function(resource, graphs) {
                    graphs = graphs || [];
                    return $http.get('/api/describe-raw', { params: {
                        endpoint: CurrentStateHelper.getCurrentEndpoint().alias,
                        resource: resource,
                        "default-graph-uri[]": graphs
                    }}).then(function(response) {
                            return response.data['@graph'][0];
                        });
                }

            }
        ]);

})();