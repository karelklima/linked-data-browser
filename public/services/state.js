(function() {

    'use strict';

    angular.module('app.services')

        .service('State', ['$rootScope', 'Config', 'lodash',
            function State($rootScope, Config, _) {

                var currentEndpoint = Config.getDefaultEndpoint();
                var currentLanguage = Config.getDefaultLanguage();

                $rootScope.$on('search-endpoint-changed', function(e, endpoint) {
                    currentEndpoint = endpoint;
                });

                $rootScope.$on('search-language-changed', function(e, language) {
                    currentLanguage = language;
                });

                $rootScope.$on('describe-endpoint-changed', function(e, endpoint) {
                    currentEndpoint = endpoint;
                });

                $rootScope.$on('describe-language-changed', function(e, language) {
                    currentLanguage = language;
                });

                this.setEndpoint = function(endpoint, eventToEmit) {
                    if (_.isPlainObject(endpoint)) {
                        currentEndpoint = endpoint;
                    } else if (_.isString(endpoint) && endpoint.length > 0) {
                        var requestedEndpoint = Config.getEndpointProfile(endpoint);
                        if (requestedEndpoint) {
                            currentEndpoint = requestedEndpoint;
                        } else {
                            $rootScope.$emit('toast', {
                                message: 'Invalid endpoint provided, using the default one',
                                type: 'warning'
                            });
                            currentEndpoint = Config.getDefaultEndpoint();
                        }
                    } else {
                        currentEndpoint = Config.getDefaultEndpoint();
                    }
                    $rootScope.$broadcast(eventToEmit, currentEndpoint);
                };

                this.setLanguage = function(language, eventToEmit) {
                    if (_.isPlainObject(language)) {
                        currentLanguage = language;
                    } else if (_.isString(language) && language.length > 0) {
                        var requestedLanguage = Config.getLanguageProfile(language);
                        if (requestedLanguage) {
                            currentLanguage = requestedLanguage;
                        } else {
                            $rootScope.$emit('toast', {
                                message: 'Invalid language provided, using the default one',
                                type: 'warning'
                            });
                            currentLanguage = Config.getDefaultLanguage();
                        }
                    } else {
                        currentLanguage = Config.getDefaultLanguage();
                    }
                    $rootScope.$broadcast(eventToEmit, currentLanguage);
                };

                this.getEndpoint = function() {
                    return currentEndpoint;
                };

                this.getLanguage = function() {
                    return currentLanguage;
                };

            }
        ]);

})();