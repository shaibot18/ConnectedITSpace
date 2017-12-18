
(function () {
    'use strict';

    var user;

    angular
        .module('app', ['ui.router'])
        .config(config)
        .run(run);

    function config($stateProvider, $urlRouterProvider) {
        // default route
        console.log("Config function run");
        
        $urlRouterProvider.otherwise("/");        

        if (window.user.role == 1) {
            $urlRouterProvider.when("/","/admin-home");
        }
        else if (window.user.role == 2) {
            $urlRouterProvider.when("/","/manager-all-rooms");
        }


        $stateProvider
            .state('manager-all-rooms', {
                url: '/manager-all-rooms',
                templateUrl: 'manager-all-rooms/index.html',
                controller: 'Manager-all-rooms.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'manager-all-rooms' }
            })
            .state('manager-one-room', {
                url: '/manager-one-room',
                templateUrl: 'manager-one-room/index.html',
                controller: 'Manager-one-room.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'manager-one-room' }
            })
            .state('admin-home', {
                url: '/admin-home',
                templateUrl: 'admin-home/index.html',
                controller: 'Admin-home.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'admin-home' }
            })
            .state('admin-manage', {
                url: '/admin-manage',
                templateUrl: 'admin-manage/index.html',
                controller: 'Admin-manage.IndexController',
                controllerAs: 'vm',
                data: { activeTab: 'admin-manage' }
            });
    }

    function run($http, $rootScope, $window) {
        // add JWT token as default auth header
        console.log("Run function run");
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.activeTab = toState.data.activeTab;
        });
        $rootScope.user = $window.user;            
    }

    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        console.log("Manual function run");
        $.get('/app/user',function(user){
            window.user = user;
            console.log(user.role);
            $('#userName').html(user.firstName);            
        })
        $.get('/app/token', function (token) {
            window.jwtToken = token;
            angular.bootstrap(document, ['app']);
        });
    });
})();