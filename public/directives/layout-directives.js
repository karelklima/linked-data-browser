(function() {

    angular.module('app.directives')

        .directive('viewBuilder', ['View', function(View) {
            return {
                restrict: 'A',
                scope: {
                    viewBuilder: '=',
                    viewBuilderMonitor: '='
                },
                controller: ['$scope', 'Config', 'View', function($scope, Config) {

                    $scope.layout = null;

                    $scope.$watch('viewBuilder', function(current, previous) {
                        if (current == null) {
                            $scope.layout = null;
                        } else {
                            $scope.layout = View.getLayout();
                        }
                    });

                }],
                replace: true,
                template: '<div ng-include="layout.displayTemplate"></div>'
            };
        }])

        .directive('layoutPanel', [function() {
            return {
                restrict: 'A',
                scope: {
                    layoutPanel: '@'
                },
                controller: ['$scope', 'View', function($scope, View) {
                    $scope.miniapps = View.getMiniapps($scope.layoutPanel);
                    console.log($scope.layoutPanel);
                    console.log($scope.miniapps);
                }],
                transclude: true,
                replace: false,
                template: '<div ng-repeat="miniapp in miniapps track by miniapp.tracker" ng-include="miniapp.displayTemplate"></div>'
            };
        }])

})();