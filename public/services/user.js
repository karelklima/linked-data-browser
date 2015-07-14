(function() {

'use strict';

    angular.module('app.services')

        .service('User', ['$rootScope', '$http', '$state', '$q', 'store', 'jwtHelper', 'Identity',
            function($rootScope, $http, $state, $q, store, jwtHelper, Identity) {

                this.login = function(userData) {
                    var deferred = $q.defer();
                    $http.post('/api/login', userData)
                        .success(function(data) {
                            Identity.set(data.token);
                            $rootScope.$broadcast('login-completed');
                            deferred.resolve();
                        }).error(function(error) {
                            $rootScope.$broadcast('login-failed');
                            deferred.reject();
                        });
                    return deferred.promise;
                };

                this.logout = function(){
                    Identity.destroy();

                    $rootScope.$broadcast('logout-completed');
                    $rootScope.$emit('toast', {
                        type: 'success',
                        message: 'Logout successful'
                    });

                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                };

                this.register = function(userData) {
                    var deferred = $q.defer();
                    $http.post('/api/register', userData)
                        .success(function(data) {
                            Identity.set(data.token);
                            $rootScope.$broadcast('registration-completed');
                            deferred.resolve();
                        })
                        .error(function() {
                            $rootScope.$broadcast('registration-failed');
                            deferred.reject();
                        });

                    return deferred.promise;
                };

                this.remove = function(userData) {
                    var deferred = $q.defer();
                    $http.delete('/api/users', { params: userData })
                        .success(function(data, a, b, c) {
                            $rootScope.$broadcast('user-removed', userData);
                            deferred.resolve();
                        })
                        .error(function() {
                            $rootScope.$broadcast('user-removal-failed', userData);
                            deferred.reject();
                        });

                    return deferred.promise;
                };

                this.update = function(userData) {
                    var deferred = $q.defer();
                    $http.put('/api/users', { params: userData })
                        .success(function(data) {
                            $rootScope.$broadcast('user-updated', userData);
                            deferred.resolve();
                        })
                        .error(function() {
                            $rootScope.$broadcast('user-update-failed', userData);
                            deferred.reject();
                        });

                    return deferred.promise;
                };

                this.getAll = function() {
                    var deferred = $q.defer();
                    $http.get('/api/users')
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