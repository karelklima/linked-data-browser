(function() {

    angular.module('app.controllers')

        .controller('DescribeRawController', ['$scope', '$rootScope', '$state', '$stateParams', 'Config', 'lodash', 'Describe', 'View',
            function($scope, $rootScope, $state, $stateParams, Config, _, Describe, View) {

                $scope.resource = $stateParams.resource;

                $scope.toggleCheckboxesModel = false;

                $scope.graphs = null;
                $scope.resourceGraph = null;
                $scope.view = null;

                $scope.graphsLoading = true;
                $scope.resourceGraphLoading = false;

                Describe.describeGraphs($scope.resource)
                    .then(function(data) {
                        if (_.isArray(data['@graph'])) {
                            $scope.graphs = data['@graph'];
                            updateResourceGraph();
                        }
                    })
                    .finally(function() {
                        $scope.graphsLoading = false;
                    });

                $scope.toggleCheckboxes = function() {
                    _.forEach($scope.graphs, function(graph) {
                        graph.active = $scope.toggleCheckboxesModel;
                    })
                };

                $scope.constrainResult = function() {
                    var graphs = getIncludedGraphs();
                    if (graphs.length < 1) {
                        $scope.emit('warning', 'At least one graph must be selected');
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
                    return _.filter($scope.graphs, { active: true });
                }

                function updateResourceGraph() {
                    $scope.resourceGraphLoading = true;
                    $scope.resourceGraph = null;
                    $scope.view = null;
                    var graphs = getIncludedGraphs();
                    Describe.describeRaw($scope.resource, graphs)
                        .then(function(resourceGraph) {
                            $scope.resourceGraph = resourceGraph;
                            $scope.view = resourceGraph.view;
                            View.init(resourceGraph, resourceGraph.view);
                            $scope.$emit('resource-graph-loaded');
                        })
                        .finally(function() {
                            $scope.resourceGraphLoading = false;
                        })

                }

            }
        ]);

})();