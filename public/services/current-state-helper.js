(function() {

    'use strict';

    angular.module('app.services')

        .factory('State', ['$rootScope', 'Config',
            function ($rootScope, Config) {

                function State() {

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

                    $rootScope.$on('header-endpoint-changed', function(e, endpoint) {
                        currentEndpoint = endpoint;
                    });

                    $rootScope.$on('header-language-changed', function(e, language) {
                        currentLanguage = language;
                    });

                    this.getCurrentEndpoint = function() {
                        return currentEndpoint;
                    };

                    this.getCurrentLanguage = function() {
                        return currentLanguage;
                    };

                }

                return new State();
            }
        ]);

})();