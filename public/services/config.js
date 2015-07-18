(function() {

    'use strict';

    angular.module('app.services')

        .factory('Config', ['$rootScope', '$http', '$state', 'store', '$q', 'toastr', 'lodash',
            function ($rootScope, $http, $state, store, $q, toastr, _) {

                function Config() {

                    var self = this;

                    var config = null;

                    this.configLoadedPromise = load();

                    function load() {
                        var deferred = $q.defer();
                        $http.get('/api/config')
                            .success(function(data) {
                                config = data;
                                $rootScope.$broadcast('config-loaded', data);
                                deferred.resolve(data);
                            }).error(function(error) {
                                $rootScope.$broadcast('config-load-failed');
                                deferred.reject();
                            });
                        return deferred.promise;
                    }

                    this.reload = function() {
                        return load();
                    };

                    this.get = function() {
                        return config;
                    };

                    this.getDefaultEndpoint = function() {
                        return _.find(config.endpoints, { default: true });
                    };

                    this.getEndpointProfile = function(alias) {
                        return _.find(config.endpoints, { alias: alias });
                    };

                    this.getDefaultLanguage = function() {
                        return _.find(config.languages, { default: true });
                    };

                    this.getLanguageProfile = function(alias) {
                        return _.find(config.languages, { alias: alias });
                    };

                    this.getLayoutProfile = function(id) {
                        return _.find(config.layouts, { id: id });
                    };

                    this.getMiniappProfile = function(id) {
                        return _.find(config.miniapps, { id: id });
                    };

                }

                return new Config();
            }
        ]);

})();