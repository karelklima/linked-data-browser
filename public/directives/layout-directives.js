(function() {

    angular.module('app.directives')

        .directive('viewBuilder', [function() {
            return {
                restrict: 'A',
                scope: {
                    $view: '=viewBuilder',
                    $graph: '=viewGraph'
                },
                replace: true,
                controller: ['$scope', function($scope) {
                    this.$scope = $scope;
                }],
                template: '<div ng-include="$view.layout.displayTemplate"></div>'
            };
        }])

        .directive('viewBuilderSetup', [function() {
            return {
                restrict: 'A',
                scope: {
                    $view: '=viewBuilderSetup',
                    $graph: '=viewGraph'
                },
                replace: true,
                controller: ['$scope', function($scope) {
                    this.$scope = $scope;
                }],
                template:
                    '<div>' +
                    '   <div ng-include="$view.layout.setupTemplate"></div>' +
                    '   <div layout-panel-setup="inactive"></div>' +
                    '</div>'
            };
        }])

        .directive('layoutPanel', [function() {
            return {
                restrict: 'A',
                scope: {
                    layoutPanel: '@'
                },
                require: '^viewBuilder',
                link: function(scope, element, attrs, viewBuilder) {
                    scope.$builder = viewBuilder.$scope;
                    console.log(viewBuilder.$scope);
                },
                transclude: true,
                replace: false,
                template: '<div ng-repeat="$miniapp in $builder.$view.panels[layoutPanel] track by $index" ng-include="$miniapp.miniapp.displayTemplate" ng-init="$viewDefinition = $builder"></div>'
            };
        }])

        .directive('layoutPanelSetup', [function() {
            return {
                restrict: 'A',
                scope: {
                    layoutPanelSetup: '@'
                },
                require: '^viewBuilderSetup',
                link: function(scope, element, attrs, viewBuilder) {
                    scope.$builder = viewBuilder.$scope;
                    scope.sortableOptions = {

                    }
                },
                transclude: true,
                replace: false,
                template:
                '<div ng-class="{ panel: true, \'panel-primary\': layoutPanelSetup != \'inactive\', \'panel-danger\': layoutPanelSetup == \'inactive\' }">' +
                '   <div class="panel-heading">' +
                '       <h3 ng-if="layoutPanelSetup != \'inactive\'" class="panel-title">{{layoutPanelSetup}} panel</h3>' +
                '       <h3 ng-if="layoutPanelSetup == \'inactive\'" class="panel-title">Inactive applications</h3>' +
                '   </div>' +
                '   <div class="panel-body">'+
                '<div as-sortable="sortableOptions" ng-model="$builder.$view.panels[layoutPanelSetup]" class="sortable-panel">' +
                '   <div as-sortable-item ng-repeat="$miniapp in $builder.$view.panels[layoutPanelSetup]" ng-init="$viewDefinition = $builder">' +
                '       <div as-sortable-item-handle>' +
                '       <div ng-include="$miniapp.miniapp.setupTemplate">' +
                '       </div>' +
                '       </div>' +
                '   </div>' +
                '</div>' +
                '   </div>' +
                '</div>'
            };
        }])

})();