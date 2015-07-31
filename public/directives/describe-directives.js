(function() {

    angular.module('app.directives')

        .directive('describe', ['State', function(State) {
            return {
                restrict: 'AE',
                scope: {
                    describe: '=',
                    resource: '@',
                    endpoint: '@',
                    language: '@',
                    describeMode: '@'
                },
                controller: ['$scope', function($scope) {
                    if (!$scope.resource) {
                        $scope.resource = $scope.describe;
                    }
                    if (!$scope.endpoint) {
                        $scope.endpoint = State.getEndpoint().alias;
                    }
                    if (!$scope.language) {
                        $scope.language = State.getLanguage().alias;
                    }
                    if (!$scope.describeMode || ($scope.describeMode != 'formatted' && $scope.describeMode != 'raw')) {
                        $scope.describeMode = 'formatted';
                    }
                }],
                transclude: true,
                replace: true,
                template: '<a ui-sref="root.describe.{{ describeMode }}({ resource: \'{{ resource }}\', endpoint: \'{{ endpoint }}\', language: \'{{ language }}\' })" class="word-wrap" ng-transclude></a>'
            };
        }])

        .directive('describeList', ['lodash', function(_) {
            return {
                restrict: 'AE',
                scope: {
                    describeList: '=',
                    describeMode: '@',
                    filter: '@'
                },
                controller: ['$scope', '$filter', function($scope, $filter) {
                    $scope. filterFunction = function(v) { return v };
                    if (angular.isDefined($scope.filter)) {
                        $scope.filterFunction = $filter($scope.filter);
                    }
                    $scope.list = _.map($scope.describeList, function(item) {
                        if (_.has(item, '@id')) {
                            item = item['@id'];
                        }
                        return {
                            resource: item,
                            filtered: $scope.filterFunction(item),
                            describeMode: $scope.describeMode
                        }
                    })
                }],
                transclude: true,
                replace: true,
                template: '<span ng-repeat="item in list track by item.resource"><a describe describe-mode="{{ item.describeMode }}" resource="{{ item.resource }}">{{ item.filtered }}</a>{{$last ? "" : ", "}}</span>'
            };
        }])

        .directive('list', function() {
            return {
                restrict: 'AE',
                scope: {
                    list: '='
                },
                transclude: true,
                replace: true,
                template: '<div ng-repeat="value in list">{{ value }}</div>'
            };
        })

        .directive('list-inline', function() {
            return {
                restrict: 'AE',
                scope: {
                    listInline: '='
                },
                transclude: true,
                replace: true,
                template: '<span ng-repeat="value in printValues">{{ value }}{{$last ? "" : ", "}}</span>'
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
                template: '<div ng-repeat="value in printValues">{{ value | value }} <span class="text-muted" ng-if="value[\'@language\']">@{{ value["@language"] }}</span><span class="text-muted" ng-if="value[\'@type\']">@{{ value["@type"] | contract }}</span></div>'
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