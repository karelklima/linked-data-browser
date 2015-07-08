(function() {

    'use strict';

    angular.module('app.services')

        .factory('Identity', ['$rootScope', '$http', '$state', 'store',
            function ($rootScope, $http, $state, store) {

                function Identity() {

                    var self = this;
                    reset();
                    // initial update notification
                    $rootScope.$emit('identity-updated', data());

                    function reset() {
                        self.profile = {};
                        self.isGuest = true;
                        self.isUser = false;
                        self.isAdmin = false;
                    }

                    function data() {
                        return {
                            profile: self.profile,
                            isGuest: self.isGuest,
                            isUser: self.isUser,
                            isAdmin: self.isAdmin
                        }
                    }

                    this.getData = function() {
                        return data();
                    };

                    this.update = function(userProfile) {
                        self.profile = {
                            email: userProfile.email,
                            id: userProfile.id,
                            roles: userProfile.roles
                        };
                        self.isGuest = false;
                        self.isUser = userProfile.roles.indexOf('user') !== -1;
                        self.isAdmin = userProfile.roles.indexOf('admin') !== -1;

                        $rootScope.$emit('identity-updated', data());
                    };

                    this.destroy = function() {
                        reset();
                        $rootScope.$emit('identity-updated', data());
                        $rootScope.$emit('identity-destroyed');
                    };
                }

                return new Identity();
            }
        ]);

})();