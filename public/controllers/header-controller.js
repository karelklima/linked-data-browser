(function() {

    angular.module('app.controllers')

        .controller('HeaderController', ['$scope', '$rootScope', '$state', '$stateParams', 'User', 'Identity',  'Config', 'lodash',
            function($scope, $rootScope, $state, $stateParams, User, Identity, Config, _) {

                $scope.navCollapsed = true;

                $scope.identity = Identity.getData();

                $scope.logout = function() {
                    User.logout().then(function() {
                        $state.go($state.current, {}, { reload: true, inherit: true });
                    });
                };

                $scope.$on('identity-updated', function(event, data) {
                    $scope.identity = data;
                });

                $scope.options = undefined;
                $scope.endpoint = undefined;
                $scope.language = undefined;

                function loadConfigData() {
                    $scope.endpoint = Config.getDefaultEndpoint();
                    $scope.language = Config.getDefaultLanguage();
                    $scope.options = Config.get();
                }

                loadConfigData(); // initial load

                $scope.$on('config-loaded', function(event, data) {
                    loadConfigData();
                });

                $scope.search = function() {
                    var searchParams = {
                        query: $scope.query,
                        endpoint: $scope.endpoint.alias,
                        language: $scope.language.alias
                    };

                    $state.go('root.search', searchParams);
                };

                $scope.updateEndpoint = function() {
                    $rootScope.$broadcast('header-endpoint-changed', $scope.endpoint);
                };

                $scope.updateLanguage = function() {
                    $rootScope.$broadcast('header-language-changed', $scope.language);
                };

                $scope.$on('search-endpoint-changed', function(e, endpoint) {
                    $scope.endpoint = endpoint;
                });

                $scope.$on('search-language-changed', function(e, language) {
                    $scope.language = language;
                });

                $scope.$on('search-query-changed', function(e, query) {
                    $scope.query = query;
                });

            }
        ]);

})();