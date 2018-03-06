(function () {
    'use strict';

    angular
        .module('app')
        .controller('EditManager.AdminController', Controller);

    function Controller($window, UserService, FlashService) {
        var vm = this;

       

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }

    }

})();