(function() {

    'use strict';

    angular.module('app.services')

        .service('Describe', ['$rootScope', '$http', '$q', 'State',
            function Describe($rootScope, $http, $q, State) {

                this.describeGraphs = function(resource) {
                    return $http.get('/api/describe-graphs', { params: {
                        endpoint: State.getEndpoint().alias,
                        resource: resource
                    }}).then(function(response) {
                        return response.data;
                    });
                };

                this.describeRaw = function(resource, graphs) {
                    graphs = graphs || [];
                    return $http.get('/api/describe-raw', { params: {
                        endpoint: State.getEndpoint().alias,
                        resource: resource,
                        "endpoint-param-default-graph-uri[]": graphs
                    }}).then(function(response) {
                            return response.data['@graph'][0];
                        });
                };

                this.describeFormatted = function(resource) {
                    return $http.get('/api/describe-formatted', { params: {
                        endpoint: State.getEndpoint().alias,
                        resource: resource,
                    }}).then(function(response) {
                        return response.data['@graph'][0];
                    });
                };

                this.describeEdit = function(resource) {
                    return $http.get('/api/describe-edit', { params: {
                        endpoint: State.getEndpoint().alias,
                        resource: resource
                    }}).then(function(response) {
                        return response.data['@graph'][0];
                    });
                };

                this.describeProperty = function(resource, property, limit, offset) {
                    var api = property.relation == 'object'
                        ? '/api/describe-property-object'
                        : '/api/describe-property-subject';
                    return $http.get(api, { params: {
                        resource: resource,
                        property: property['property'],
                        endpoint: State.getEndpoint().alias,
                        limit: limit || 10,
                        offset: offset || 0
                    }}).then(function(response) {
                        return response.data['@graph'][0];
                    });
                }

            }
        ]);

})();