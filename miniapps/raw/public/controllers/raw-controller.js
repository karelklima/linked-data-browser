(function() {

    angular.module('app.miniapps')

        .controller('RawController', ['$scope', 'Miniapp', 'lodash', 'Describe',
            function($scope, Miniapp, _, Describe) {

                Miniapp.decorateScope($scope);

                $scope.mode = null;

                var i = $scope.$instance;
                if (i.special && i.special == '@id') {
                    $scope.mode = 'id';
                } else if (i.special && i.special == '@type') {
                    $scope.mode = 'type';
                } else {
                    $scope.mode = 'property';
                    $scope.submode = null;
                    $scope.property = _.find($scope.$graph.property, $scope.$instance);

                    var sample = $scope.property.data[0];
                    if (!_.isPlainObject(sample)) {
                        $scope.submode = 'literal'
                    } else if (_.has(sample, '@value')) {
                        $scope.submode = 'value';
                    } else {
                        $scope.submode = 'object';
                        $scope.more = false;
                    }
                }

                if ($scope.$instance.property) {
                    $scope.property = _.find($scope.$graph.property, { '@id': $scope.$instance.property, relation: $scope.$instance.relation });
                }

                $scope.showMore = function() {
                    $scope.more = true;
                };

                $scope.results = [];

                $scope.datasource = {
                    get: function(offset, limit, callback) {
                        return Describe.describeProperty($scope.$resource, $scope.$instance, limit, offset)
                            .then(function(data) {
                                return data.data;
                            });
                    }
                };


            }
        ]);

})();