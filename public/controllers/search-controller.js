(function() {

    angular.module('app.controllers')

        .controller('SearchController', ['$scope', '$rootScope', '$state', '$stateParams', 'Config', 'lodash', 'SearchQueryParser', 'Search', 'State',
            function($scope, $rootScope, $state, $stateParams, Config, _, SearchQueryParser, Search, State) {

                $scope.$on('header-endpoint-changed', function(e, endpoint) {
                    $state.go($state.$current, { endpoint: endpoint.alias });
                });

                $scope.$on('header-language-changed', function(e, language) {
                    $state.go($state.$current, { language: language.alias });
                });

                var requestedQuery = $stateParams.query;

                if (!requestedQuery || _.isEmpty(requestedQuery)) {
                    $state.go('404');
                    return;
                }
                $scope.query = SearchQueryParser.parse(requestedQuery);
                if (!_.isEmpty($scope.query.resource)) {
                    // forward URI only requests to describe component
                    $state.go('root.describe.formatted', {
                        resource: $scope.query.resource,
                        endpoint: State.getEndpoint().alias,
                        language: State.getLanguage().alias
                    });
                    return;
                }
                $rootScope.$broadcast('search-query-changed', requestedQuery);

                State.setEndpoint($stateParams.endpoint, 'search-endpoint-changed');
                $scope.endpoint = State.getEndpoint();

                State.setLanguage($stateParams.language, 'search-language-changed');
                $scope.language = State.getLanguage();

                $scope.results = [];
                $scope.resultsLimit = "10";
                $scope.resultsOffset = 0;

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