(function() {

    angular.module('app.controllers')

        .controller('LoginController', ['$rootScope', '$http', '$state', 'User',
            function($rootScope, $http, $state, User) {
                var self = this;

                // Login form data binding object
                self.profile = {};

                // Register the login() function
                self.login = function() {
                    User.login({
                        email: self.profile.email,
                        password: self.profile.password
                    })
                        .then(function() {
                            self.loginError = null;
                            $state.go('root.home', {}, { reload: true });
                        });
                };

            }
        ]);

})();