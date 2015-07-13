(function() {

    'use strict';

    angular.module('app.services')

        .service('Endpoint', ['$rootScope', '$http', '$state', '$q',
            function($rootScope, $http, $state, $q) {

                /**
                 * Creates a new SPARQL endpoint
                 * @param endpointData
                 * @returns {IPromise<T>}
                 */
                this.create = function(endpointData) {
                    var deferred = $q.defer();
                    $http.post('/api/endpoints', endpointData)
                        .success(function(data) {
                            $rootScope.$emit('endpoint-created');
                            deferred.resolve(data);
                        })
                        .error(function() {
                            $rootScope.$emit('endpoint-creation-failed');
                            deferred.reject();
                        });

                    return deferred.promise;
                };

                this.remove = function(endpointData) {
                    var deferred = $q.defer();
                    $http.delete('/api/endpoints', { params: endpointData })
                        .success(function(data) {
                            $rootScope.$emit('endpoint-removed', endpointData);
                            deferred.resolve();
                        })
                        .error(function() {
                            $rootScope.$emit('endpoint-removal-failed', endpointData);
                            deferred.reject();
                        });

                    return deferred.promise;
                };

                this.update = function(endpointData) {
                    var deferred = $q.defer();
                    $http.put('/api/endpoints', endpointData)
                        .success(function(data) {
                            $rootScope.$emit('endpoint-updated', endpointData);
                            deferred.resolve();
                        })
                        .error(function() {
                            $rootScope.$emit('endpoint-update-failed', endpointData);
                            deferred.reject();
                        });

                    return deferred.promise;
                };

                this.getAll = function() {
                    var deferred = $q.defer();
                    $http.get('/api/endpoints')
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function() {
                            deferred.reject();
                        });
                    return deferred.promise;
                }

            }
        ]);

})();