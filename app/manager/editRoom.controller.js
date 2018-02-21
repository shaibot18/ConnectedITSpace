(function () {
    'use strict';

    angular
        .module('app')
        .controller('EditRoom.ManagerController', Controller);

    function Controller(UserService,RoomService,FlashService) {
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