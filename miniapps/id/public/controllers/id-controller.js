(function() {

    angular.module('app.miniapps')

        .controller('IdController', ['$scope', 'Miniapp',
            function($scope, Miniapp) {

                Miniapp.decorateScope($scope);

            }
        ]);

})();