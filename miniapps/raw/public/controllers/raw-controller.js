(function() {

    angular.module('app.miniapps')

        .controller('RawController', ['$scope', '$state', 'View',
            function($scope, $state, View) {

                console.log(View.getInstance($scope));

            }
        ]);

})();