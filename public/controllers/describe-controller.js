(function() {

    angular.module('app.controllers')

        .controller('DescribeController', ['$scope', '$state',
            function($scope, $state) {

                $scope.$on('header-endpoint-changed', function(e, endpoint) {
                    $scope.endpoint = endpoint;
                    $state.go($state.$current, { endpoint: endpoint.alias });
                });

                $scope.$on('header-language-changed', function(e, language) {
                    $scope.language = language;
                    $state.go($state.$current, { language: language.alias });
                });

            }
        ]);

})();