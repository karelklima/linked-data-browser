(function() {

    'use strict';

    angular.module('app.services')

        .factory('Environment', ['$rootScope', '$http', '$state', 'store',
            function ($rootScope, $http, $state, store) {

                function Environment() {

                    var self = this;

                    var defaultEndpoint = null;
                    var currentEndpoint = null;
                    var defaultLanguage = null;
                    var currentLanguage = null;

                    this.setDefaultEndpoint = function(endpointAlias) {
                        defaultEndpoint = endpointAlias;
                    };

                    this.setCurrentEndpoint = function(endpointAlias) {
                        if (!endpointAlias != currentEndpoint) {}
                    };

                    this.setDefaultLanguage = function(languageAlias) {
                        defaultLanguage = languageAlias;
                    };



                    reset();
                    // initial update notification
                    $rootScope.$emit('identity-updated', data());

                    function reset() {
                        self.profile = {};
                        self.isGuest = true;
                        self.isUser = false;
                        self.isAdmin = false;
                        self.expires = 0;
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

                        self.expires = userProfile.exp;

                        $rootScope.$emit('identity-updated', data());
                    };

                    this.destroy = function() {
                        reset();
                        $rootScope.$emit('identity-updated', data());
                        $rootScope.$emit('identity-destroyed');
                    };

                    this.isValid = function() {
                        return self.expires != 0 && Math.floor(Date.now() / 1000) <= self.expires;
                    };

                    this.isExpired = function() {
                        return self.expires != 0 && Math.floor(Date.now() / 1000) > self.expires;
                    };
                }

                return new Identity();
            }
        ]);

})();