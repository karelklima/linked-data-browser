(function() {

    angular.module('app.controllers')

        .controller('AdminEndpointsController', ['$scope', '$rootScope', '$http', 'Endpoint', 'lodash',
            function($scope, $rootScope, $http, Endpoint, _) {

                $scope.endpointForm = {};
                $scope.endpoints = null;
                $scope.displayedEndpoints = null;

                Endpoint.getAll().then(function (endpoints) {
                    $scope.endpoints = endpoints;
                    $scope.displayedEndpoints = endpoints;
                });

                $scope.create = function() {
                    Endpoint.create({
                        name: $scope.endpointForm.name,
                        alias: $scope.endpointForm.alias,
                        url: $scope.endpointForm.url
                    })
                        .then(function(data) {
                            $scope.endpoints.push(data.endpoint);
                            $scope.endpointForm = {}; // clear form model
                        })


                };

                $scope.makeDefault = function(endpoint) {

                    Endpoint.update({
                        id: endpoint.id,
                        default: true
                    })
                        .then(function() {
                            _.forEach($scope.endpoints, function(ep) {
                               ep.default = false;
                            });
                            endpoint.default = true;
                        });

                };

                $scope.remove = function(endpoint) {
                    Endpoint.remove({
                        id: endpoint.id
                    })
                        .then(function() {
                            _.remove($scope.endpoints, {id: endpoint.id});
                        });
                }

            }
        ]);

})();