(function() {

    angular.module('app.controllers', []);

    angular.module('app.services', []);

    angular.module('app', ['app.controllers', 'app.services', 'ui.router', 'ui.bootstrap',
        'ngMdIcons', 'angular-jwt', 'angular-storage', 'ngCookies', 'ngAnimate', 'ngLodash',
        'angular-loading-bar', 'toastr'])

        .run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
            //$rootScope.$state = $state;
            //$rootScope.$stateParams = $stateParams;
        }])

        // Routing
        .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
            // For any unmatched url, send to /route1
            $urlRouterProvider.otherwise("/home");

            $stateProvider
                .state('root', {
                    abstract: true,
                    templateUrl: '/public/views/root.html',
                    controller: 'RootController'
                })
                .state('root.home', {
                    url: '/home',
                    templateUrl: '/public/views/home.html'
                })
                .state('root.login', {
                    url: '/login',
                    templateUrl: '/public/views/login.html'
                })
                .state('root.register', {
                    url: '/register',
                    templateUrl: '/public/views/register.html'
                })
                .state('root.profile', {
                    url: '/profile',
                    templateUrl: '/public/views/profile.html',
                    data: {
                        requiresLogin: true
                    }
                })
                .state('root.admin', {
                    abstract: true,
                    url: '/admin',
                    templateUrl: '/public/views/admin.html',
                    data: {
                        requiresAdmin: true
                    }
                })
                .state('root.admin.endpoints', {
                    url: '/endpoints',
                    templateUrl: '/public/views/admin-endpoints.html',
                    data: {
                        requiresAdmin: true
                    }
                })
                .state('root.admin.users', {
                    url: '/users',
                    templateUrl: '/public/views/admin-users.html',
                    data: {
                        requiresAdmin: true
                    }
                });

        }])

        // All events logger
        // TODO remove in the end
        .config(['$provide', function ($provide) {
            $provide.decorator('$rootScope', ['$delegate', function ($delegate) {
                var _emit = $delegate.$emit;

                $delegate.$emit = function () {
                    console.log.apply(console, arguments);
                    _emit.apply(this, arguments);
                };

                return $delegate;
            }]);
        }])

        .config(['jwtInterceptorProvider', '$httpProvider', function(jwtInterceptorProvider, $httpProvider) {
            jwtInterceptorProvider.tokenGetter = ['store', function(store) {
                return store.get('jwt');
            }];
            $httpProvider.interceptors.push('jwtInterceptor');
        }])

        // notifications setup
        .config(['toastrConfig', function(toastrConfig) {
            angular.extend(toastrConfig, {
                extendedTimeOut: 1000,
                positionClass: '',
                timeOut: 1500,
                closeButton: false,
                closeHtml: '<button>&times;</button>',
                containerId: 'toasts-container',
                iconClasses: {
                    error: 'alert-danger',
                    info: 'alert-info',
                    success: 'alert-success',
                    warning: 'alert-warning'
                },
                maxOpened: 0,
                messageClass: 'toast-message',
                newestOnTop: true,
                tapToDismiss: true,
                titleClass: 'toast-title',
                toastClass: 'toast alert'
            });
        }])

        .config(['$httpProvider', function($httpProvider) {
            $httpProvider.interceptors.push('ToastrInterceptor');
        }])

        .run(['$rootScope', 'toastr', function($rootScope, toastr) {
            $rootScope.$on('toast', function(e, data) {
               switch (data.type) {
                   case 'error':
                       toastr.error(data.message);
                       break;
                   case 'info':
                       toastr.info(data.message);
                       break;
                   case 'success':
                       toastr.success(data.message);
                       break;
                   case 'warning':
                       toastr.warning(data.message);
                       break;
                   default:
                       toastr.error('Unidentified toast type detected');
                       break;
               }
            });
        }])

        .run(['$rootScope', '$state', 'store', 'jwtHelper', function($rootScope, $state, store, jwtHelper) {
            $rootScope.$on('$stateChangeStart', function(e, to) {
                if (to.data && to.data.requiresLogin) {
                    if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {
                        e.preventDefault();
                        $state.go('root.login');
                    }
                }
            });
        }])

        .run(['Identity', 'store', 'jwtHelper', function(Identity, store, jwtHelper) {

            if (store.get('jwt')) {
                Identity.update(jwtHelper.decodeToken(store.get('jwt')));
            }

        }]);

})();