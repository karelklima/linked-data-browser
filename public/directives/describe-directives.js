(function() {

    angular.module('app.directives')

        .directive('describe', ['CurrentStateHelper', function(CurrentStateHelper) {
            return {
                restrict: 'AE',
                scope: {
                    describe: '=',
                    resource: '@',
                    endpoint: '@',
                    language: '@'
                },
                controller: ['$scope', function($scope) {
                    if (!$scope.resource) {
                        $scope.resource = $scope.describe;
                    }
                    if (!$scope.endpoint) {
                        $scope.endpoint = CurrentStateHelper.getCurrentEndpoint().alias;
                    }
                    if (!$scope.language) {
                        $scope.language = CurrentStateHelper.getCurrentLanguage().alias;
                    }
                }],
                transclude: true,
                replace: true,
                template: '<a ui-sref="root.describe.formatted({ resource: \'{{resource}}\', endpoint: \'{{endpoint}}\', language: \'{{language}}\' })" ng-transclude></a>'
            };
        }])

        .directive('describeList', function() {
            return {
                restrict: 'AE',
                scope: {
                    describeList: '='
                },
                transclude: true,
                replace: true,
                template: '<span ng-repeat="resource in describeList"><a describe resource="{{ resource }}">{{ resource }}</a>{{$last ? "" : ", "}}</span>'
            };
        })

        .directive('printValues', function() {
            return {
                restrict: 'AE',
                scope: {
                    printValues: '='
                },
                transclude: true,
                replace: true,
                template: '<div ng-repeat="value in printValues">{{ value["@value"] }}</div>'
            };
        })

        .directive('printIds', function() {
            return {
                restrict: 'AE',
                scope: {
                    printIds: '='
                },
                transclude: true,
                replace: true,
                template: '<div ng-repeat="id in printIds"><a describe resource="{{ id[\'@id\'] }}">{{ id[\'@id\'] | truncateUri }}</a></div>'
            };
        })



})();