(function () {
    'use strict';

    angular
        .module('app')
        .controller('RoomInfo.ManagerController', Controller);

    function Controller(UserService,RoomService) {
        var vm = this;

        vm.user = null;
        vm.createRoom = createRoom;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }

        function createRoom() {
            
        }
    }
})();