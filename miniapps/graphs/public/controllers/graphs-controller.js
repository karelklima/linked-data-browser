(function() {

    angular.module('app.miniapps')

        .controller('GraphsController', ['$scope', 'Miniapp', 'lodash', 'Describe',
            function($scope, Miniapp, _, Describe) {

                Miniapp.decorateScope($scope);

                $scope.loading = true;
                $scope.graphs = undefined;

                Miniapp.request('/api/graphs')
                    .then(function(data) {
                        $scope.loading = false;
                        console.log(data);
                        $scope.graphs = data['@graph'][0]['graph'];
                    });

            }
        ]);

})();