(function() {

    angular.module('app.miniapps')

        .controller('DefaultObjectRelationController', ['$scope', 'Miniapp', 'Describe',
            function($scope, Miniapp, Describe) {

                // init basic $scope properties like $graph, $instance or $property
                Miniapp.decorateScope($scope);

                $scope.more = false;
                $scope.showMore = function() {
                    $scope.more = true;
                };

                $scope.results = [];

                $scope.datasource = {
                    get: function(offset, limit) {
                        return Describe.describeProperty($scope.$resource, $scope.$instance, limit, offset)
                            .then(function(data) {
                                return data.data;
                            });
                    }
                };


            }
        ]);

})();