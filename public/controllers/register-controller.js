(function() {

    angular.module('app.controllers')

        .controller('RegisterController', ['$rootScope', '$http', '$state', 'User',
            function($rootScope, $http, $state, User) {

                var self = this;

                // User register form data container
                self.profile = {};

                // Register the register() function
                self.register = function() {
                    User.register({
                        email: self.profile.email,
                        password: self.profile.password,
                        passwordConfirm: self.profile.passwordConfirm
                    }).then(function() {
                        $state.go('root.home');
                    });
                };

            }
        ]);

})();