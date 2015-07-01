(function() {

    angular.module('ldApp', ['ui.router', 'ngMdIcons'])

        .run(function ($rootScope,   $state,   $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        })

        .config(function($stateProvider, $urlRouterProvider){
            // For any unmatched url, send to /route1
            $urlRouterProvider.otherwise("/home");

            $stateProvider
                .state('root', {
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

        });

})();