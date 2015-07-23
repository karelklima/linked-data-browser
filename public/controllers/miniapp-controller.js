(function() {

    angular.module('app.controllers')

        .controller('MiniappController', ['$scope', 'Miniapp', 'lodash', 'Describe',
            function($scope, Miniapp, _, Describe) {

                Miniapp.decorateScope($scope);

                $scope.mode = null;

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