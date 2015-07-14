(function() {

    angular.module('app.controllers')

        .controller('SearchController', ['$scope', '$rootScope', '$state', '$stateParams', 'Config', 'lodash', 'SearchQueryParser', 'Search',
            function($scope, $rootScope, $state, $stateParams, Config, _, SearchQueryParser, Search) {

                $scope.$on('header-endpoint-changed', function(e, endpoint) {
                    $state.go('root.search', { endpoint: endpoint.alias });
                });

                $scope.$on('header-language-changed', function(e, language) {
                    $state.go('root.search', { language: language.alias });
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

                $rootScope.$broadcast('search-endpoint-changed', $scope.endpoint);
                $rootScope.$broadcast('search-language-changed', $scope.language);
                $rootScope.$broadcast('search-query-changed', $stateParams.query);

                $scope.query = SearchQueryParser.parse($stateParams.query);

                Search.search($scope.query.query, $scope.query.types, $scope.query.properties, $scope.query.graphs);

                $scope.results = [];
                $scope.resultsLimit = "10";
                $scope.resultsOffset = 0;
                $scope.isLoading = false;

                $scope.isEmpty = function() {
                    return !$scope.isLoading && angular.isDefined($scope.results) && $scope.results.length == 0;
                };

                $scope.datasource = {
                    get: function(offset, limit, callback) {
                        $scope.isLoading = true;
                        Search.search($scope.query.query, $scope.query.types, $scope.query.properties, $scope.query.graphs, limit, offset)
                            .then(function(data) {
                                $scope.isLoading = false;
                                callback(angular.isArray(data["@graph"]) ? data["@graph"] : []);
                            }, function(error) {
                                $scope.isLoading = false;
                                callback([]);
                            });

                    },
                    revision: 0
                };


            }
        ]);

})();