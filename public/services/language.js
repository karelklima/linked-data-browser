(function() {

    'use strict';

    angular.module('app.services')

        .service('Language', ['$rootScope', '$http', '$state', '$q',
            function($rootScope, $http, $state, $q) {

                /**
                 * Creates a new language
                 * @param languageData
                 * @returns {IPromise<T>}
                 */
                this.create = function(languageData) {
                    var deferred = $q.defer();
                    $http.post('/api/languages', languageData)
                        .success(function(data) {
                            $rootScope.$emit('language-created');
                            deferred.resolve(data);
                        })
                        .error(function() {
                            $rootScope.$emit('language-creation-failed');
                            deferred.reject();
                        });

                    return deferred.promise;
                };

                this.remove = function(languageData) {
                    var deferred = $q.defer();
                    $http.delete('/api/languages', { params: languageData })
                        .success(function(data) {
                            $rootScope.$emit('language-removed', languageData);
                            deferred.resolve();
                        })
                        .error(function() {
                            $rootScope.$emit('language-removal-failed', languageData);
                            deferred.reject();
                        });

                    return deferred.promise;
                };

                this.update = function(languageData) {
                    var deferred = $q.defer();
                    $http.put('/api/languages', languageData)
                        .success(function(data) {
                            $rootScope.$emit('language-updated', languageData);
                            deferred.resolve();
                        })
                        .error(function() {
                            $rootScope.$emit('language-update-failed', languageData);
                            deferred.reject();
                        });

                    return deferred.promise;
                };

                this.getAll = function() {
                    var deferred = $q.defer();
                    $http.get('/api/languages')
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