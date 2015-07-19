(function() {

    angular.module('app.miniapps')

        .controller('RawController', ['$scope', 'Miniapp', 'lodash',
            function($scope, Miniapp, _) {

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
                    }
                }

                if ($scope.$instance.property) {
                    $scope.property = _.find($scope.$graph.property, { '@id': $scope.$instance.property, relation: $scope.$instance.relation });
                }


            }
        ]);

})();