(function() {

    'use strict';

    angular.module('app.services')

        .factory('CurrentStateHelper', ['$rootScope', 'Config',
            function ($rootScope, Config) {

                function CurrentStateHelper() {

                    var currentEndpoint = Config.getDefaultEndpoint();
                    var currentLanguage = Config.getDefaultLanguage();

                    $rootScope.$on('search-endpoint-changed', function(e, endpoint) {
                        currentEndpoint = endpoint;
                    });

                    $rootScope.$on('search-language-changed', function(e, language) {
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

                return new CurrentStateHelper();
            }
        ]);

})();