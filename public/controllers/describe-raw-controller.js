(function() {

    angular.module('app.controllers')

        .controller('DescribeRawController', ['$scope', '$rootScope', '$state', '$stateParams', 'Config', 'lodash', 'Describe', 'View', 'State', 'PrefixesReplacer',
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

                $scope.graphsDisplayToggle = false;
                $scope.toggleCheckboxesModel = false;
                $scope.graphsInitialized = false;

                $scope.graphs = null;
                $scope.resourceGraph = null;
                $scope.viewRaw = null;

                $scope.graphsLoading = true;
                $scope.resourceGraphLoading = true;

                updateResourceGraph();

                $scope.displayGraphs = function() {
                    if (!$scope.graphsInitialized) {
                        $scope.graphsLoading = true;
                        Describe.describeGraphs($scope.resource)
                            .then(function(data) {
                                if (_.isArray(data['@graph'])) {
                                    $scope.graphs = data['@graph'];
                                }
                            })
                            .finally(function() {
                                $scope.graphsLoading = false;
                            });
                        $scope.graphsInitialized = true;
                    }
                    $scope.graphsDisplayToggle = true;
                };

                $scope.hideGraphs = function() {
                    $scope.graphsDisplayToggle = false;
                };

                $scope.toggleCheckboxes = function() {
                    $scope.toggleCheckboxesModel = !$scope.toggleCheckboxesModel;
                    _.forEach($scope.graphs, function(graph) {
                        graph.active = $scope.toggleCheckboxesModel;
                    })
                };

                $scope.constrainResult = function() {
                    var graphs = getIncludedGraphs();
                    if (graphs.length < 1) {
                        $scope.$emit('toast', {
                            message: 'At least one graph must be selected',
                            type: 'warning'
                        });
                        return;
                    }
                    updateResourceGraph();
                };

                $scope.reset = function() {
                    _.forEach($scope.graphs, function(graph) {
                        graph.active = false;
                    });
                    $scope.toggleCheckboxesModel = false;
                    updateResourceGraph();
                };

                function getIncludedGraphs() {
                    return _.map(_.filter($scope.graphs, { active: true }), function(graph) {
                        return graph['@id'];
                    });
                }

                function updateResourceGraph() {
                    $scope.resourceGraphLoading = true;
                    $scope.resourceGraph = null;
                    $scope.view = null;
                    var graphs = getIncludedGraphs();
                    Describe.describeRaw($scope.resource, graphs)
                        .then(function(resourceGraph) {
                            $scope.resourceGraph = resourceGraph;
                            $scope.viewRaw = View.expand(resourceGraph.viewRaw);
                        })
                        .finally(function() {
                            $scope.resourceGraphLoading = false;
                        })

                }

            }
        ]);

})();