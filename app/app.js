
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
            $urlRouterProvider.when("/","/admin");
            $stateProvider
                .state('home', {
                    url: '/admin',
                    templateUrl: 'admin/index.html',
                    controller: 'Index.AdminController',
                    controllerAs: 'vm',
                    data: { activeTab: 'home' }
                })
                .state('addManager', {
                    url: '/admin/addManager',
                    templateUrl: 'admin/addManager.html',
                    controller: 'AddManager.AdminController',
                    controllerAs: 'vm',
                    data: { activeTab: 'addManager' }
                })
                .state('userManagement', {
                    url: '/admin/userManagement',
                    templateUrl: 'admin/userManagement.html',
                    controller: 'UserManagement.AdminController',
                    controllerAs: 'vm',
                    data: { activeTab: 'userManagement' }
                })      
        }
        else if (window.user.role == 2) {
            $urlRouterProvider.when("/","/manager");
            $stateProvider
                .state('home', {
                    url: '/manager',
                    templateUrl: 'manager/index.html',
                    controller: 'Index.ManagerController',
                    controllerAs: 'vm',
                    data: { activeTab: 'home' }
                })
                .state('roomInfo',{
                    url: '/manager/roomInfo/:roomId',
                    templateUrl: 'manager/roomInfo.html',
                    controller: 'RoomInfo.ManagerController',
                    data:{ activeTab: 'roomInfo'}
                })
                .state('addRoom', {
                    url: '/manager/addRoom',
                    templateUrl: 'manager/addRoom.html',
                    controller: 'AddRoom.ManagerController',
                    controllerAs: 'vm',
                    data: { activeTab: 'addRoom' }
                });
        }


        
    }

    function run($http, $rootScope, $window) {
        // add JWT token as default auth header
        console.log("Run function run");
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.jwtToken;

        // update active tab on state change
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $rootScope.activeTab = toState.data.activeTab;
        });
        $http.user = $window.user;
        $rootScope.user = $window.user;            
    }

    // manually bootstrap angular after the JWT token is retrieved from the server
    $(function () {
        // get JWT token from server
        console.log("Manual function run");
        $.get('/app/user',function(user){
            window.user = user;
            console.log("window.user is ")
            console.log(user);
            $('#userName').html(user.firstName);            
        })
        $.get('/app/token', function (token) {
            window.jwtToken = token;
            angular.bootstrap(document, ['app']);
        });
    });
})();