(function() {

    angular.module('app.controllers')

        .controller('ProfileController', ['$scope', '$rootScope', 'Identity',
            function($scope, $rootScope, Identity) {
                var self = this;

                self.identity = Identity.getData();

                self.logout = function() {
                    User.logout();
                };

            }
        ]);

})();