(function() {

    angular.module('app.controllers')

        .controller('DescribeFormattedController', ['$scope', '$rootScope', '$state', '$stateParams', 'Config', 'lodash', 'Describe', 'View', 'State', 'PrefixesReplacer',
            function($scope, $rootScope, $state, $stateParams, Config, _, Describe, View, State, PrefixesReplacer) {

                var requestedResource = $stateParams.resource;
                if (!requestedResource || _.isEmpty(requestedResource)) {
                    $state.go('404');
                    return;
                }

                var expanded = PrefixesReplacer.expand(requestedResource);
                if (!_.isEqual(requestedResource, expanded)) {
                    $state.go($state.$current, { resource: expanded });
                    return;
                }

                State.setEndpoint($stateParams.endpoint, 'describe-endpoint-changed');
                $scope.endpoint = State.getEndpoint();

                State.setLanguage($stateParams.language, 'describe-language-changed');
                $scope.language = State.getLanguage();

                $scope.resource = $stateParams.resource;

                $scope.$graph = null;
                $scope.$view = null;
                $scope.resourceGraphLoading = true;

                Describe.describeFormatted($scope.resource)
                    .then(function(resourceGraph) {
                        //View.init(resourceGraph, resourceGraph.viewFormatted);
                        $scope.$graph = resourceGraph;
                        $scope.$view = View.expand(resourceGraph.viewFormatted);
                    })
                    .finally(function() {
                        $scope.resourceGraphLoading = false;
                    });


            }
        ]);

})();