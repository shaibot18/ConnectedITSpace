(function () {
    'use strict';

    angular
        .module('app')
        .controller('Index.ManagerController', Controller);

    function Controller(UserService,RoomService) {
        var vm = this;

        vm.user = null;

        initController();


        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                RoomService.GetRoomList(vm.user.sub).then(function (roomList) {
                    console.log(roomList);
                    renderRoomList(roomList);
                });
            });
        }

        function renderRoomList(roomList) {
            return;
        }

    }
})();