(function() {

    angular.module('app.controllers')

        .controller('AdminController', ['$scope', '$state', 'Identity', 'store',
            function($scope, $state, Identity, store) {
                var self = this;

                $scope.state = $state;

            }
        ]);

})();