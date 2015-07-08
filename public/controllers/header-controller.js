(function() {

    angular.module('app.controllers')

        .controller('HeaderController', ['$scope', '$rootScope', '$state', 'User', 'Identity',
            function($scope, $rootScope, $state, User, Identity) {
                var self = this;

                $scope.navCollapsed = true;

                this.identity = Identity.getData();

                self.logout = function() {
                    User.logout().then(function() {
                        $state.go($state.current, {}, {reload: true});
                    })
                };

                $rootScope.$on('identity-updated', function(event, data) {
                    $rootScope.$emit('identity-updated-receiver');
                    self.identity = data;
                });

            }
        ]);

})();