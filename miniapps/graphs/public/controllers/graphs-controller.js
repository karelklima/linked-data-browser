(function() {

    angular.module('app.miniapps')

        .controller('GraphsController', ['$scope', 'Miniapp', 'lodash', 'Describe',
            function($scope, Miniapp, _, Describe) {

                Miniapp.decorateScope($scope);

                $scope.loading = true;
                $scope.error = false;
                $scope.graphs = undefined;

                Miniapp.request('/api/graphs')
                    .then(function(data) {
                        $scope.graphs = data['@graph'][0]['graph'];
                    }, function(error) {
                        $scope.error = true;
                    })
                    .finally(function() {
                        $scope.loading = false;

                    });


            }
        ]);

})();