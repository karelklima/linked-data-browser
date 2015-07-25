(function() {

    angular.module('app.miniapps')

        .controller('DefaultSubjectRelationController', ['$scope', 'Miniapp', 'lodash', 'Describe',
            function($scope, Miniapp, _, Describe) {

                Miniapp.decorateScope($scope);

                $scope.submode = null;

                var sample = $scope.$property.data[0];
                if (!_.isPlainObject(sample)) {
                    $scope.submode = 'literal'
                } else if (_.has(sample, '@value')) {
                    $scope.submode = 'value';
                } else {
                    $scope.submode = 'object';
                    $scope.more = false;
                }

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