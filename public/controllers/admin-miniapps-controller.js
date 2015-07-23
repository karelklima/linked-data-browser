(function() {

    angular.module('app.controllers')

        .controller('AdminMiniappsController', ['$scope', 'Config',
            function($scope, Config) {

                var miniapps = Config.getMiniapps();
                $scope.miniapps = miniapps;
                $scope.displayedMiniapps = miniapps;


            }
        ]);

})();