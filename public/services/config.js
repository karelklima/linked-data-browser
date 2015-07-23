(function() {

    'use strict';

    angular.module('app.services')

        .service('Config', ['$rootScope', '$http', '$q', 'lodash',
            function Config($rootScope, $http, $q, _) {

                var config = null;

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

                this.getDefaultLayout = function() {
                    return _.find(config.layouts, { default: true });
                };

                this.getLayoutProfile = function(id) {
                    return _.find(config.layouts, { id: id });
                };

                this.getLayouts = function() {
                    return config.layouts;
                };

                this.getMiniappProfile = function(id) {
                    return _.find(config.miniapps, { id: id });
                };

                this.getMiniapps = function() {
                    return _.cloneDeep(config.miniapps);
                };

                this.getPrefixes = function() {
                    return config.prefixes;
                }

            }
        ]);

})();