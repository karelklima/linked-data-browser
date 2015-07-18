(function() {

    angular.module('app.controllers')

        .controller('DescribeController', ['$scope', '$rootScope', '$state', '$stateParams', 'Config', 'lodash',
            function($scope, $rootScope, $state, $stateParams, Config, _) {

                $scope.$on('header-endpoint-changed', function(e, endpoint) {
                    $state.go($state.$current, { endpoint: endpoint.alias }, { reload: true });
                });

                $scope.$on('header-language-changed', function(e, language) {
                    $state.go($state.$current, { language: language.alias }, { reload: true });
                });

                var endpointAlias = $stateParams.endpoint;
                if (_.isString(endpointAlias) && endpointAlias.length > 0) {
                    $scope.endpoint = Config.getEndpointProfile(endpointAlias);
                    if (!$scope.endpoint) {
                        $scope.$emit('toast', "Invalid endpoint provided, using the default one");
                        $scope.endpoint = Config.getDefaultEndpoint();
                    }
                } else {
                    $scope.endpoint = Config.getDefaultEndpoint();
                }

                var languageAlias = $stateParams.language;
                if (_.isString(languageAlias) && languageAlias.length > 0) {
                    $scope.language = Config.getLanguageProfile(languageAlias);
                    if (!$scope.language) {
                        $scope.$emit('toast', "Invalid language provided, using the default one");
                        $scope.language = Config.getDefaultLanguage();
                    }
                } else {
                    $scope.language = Config.getDefaultLanguage();
                }

                $scope.resource = $stateParams.resource;

                $rootScope.$broadcast('describe-endpoint-changed', $scope.endpoint);
                $rootScope.$broadcast('describe-language-changed', $scope.language);
                $rootScope.$broadcast('describe-resource-changed', $scope.resource);

                $scope.state = $state;

            }
        ]);

})();