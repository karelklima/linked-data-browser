(function() {

    angular.module('app.controllers')

        .controller('HeaderController', ['$scope', '$rootScope', '$state', '$stateParams', 'User', 'Identity',  'Config', 'lodash', 'State', 'SearchQueryParser',
            function($scope, $rootScope, $state, $stateParams, User, Identity, Config, _, State, SearchQueryParser) {

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

                    var parsed = SearchQueryParser.parse($scope.query);
                    if (!_.isEmpty(parsed.resource)) {
                        // forward URI only requests to describe component
                        $state.go('root.describe.formatted', {
                            resource: parsed.resource,
                            endpoint: $scope.endpoint.alias,
                            language: $scope.language.alias
                        });
                    } else {
                        $state.go('root.search', {
                            query: $scope.query,
                            endpoint: $scope.endpoint.alias,
                            language: $scope.language.alias
                        });
                    }
                };

                $scope.updateEndpoint = function() {
                    State.setEndpoint($scope.endpoint, 'header-endpoint-changed');
                };

                $scope.updateLanguage = function() {
                    State.setLanguage($scope.language, 'header-language-changed');
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

                $scope.$on('describe-endpoint-changed', function(e, endpoint) {
                    $scope.endpoint = endpoint;
                });

                $scope.$on('describe-language-changed', function(e, language) {
                    $scope.language = language;
                });

            }
        ]);

})();