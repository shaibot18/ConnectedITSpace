
(function () {
    'use strict';

    angular
        .module('app')
        .controller('AddRoom.ManagerController', Controller);

    function Controller(UserService,RoomService,FlashService) {
        var vm = this;

        vm.user = null;
        vm.newRoom = null; 
        vm.createRoom = createRoom;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }

        function createRoom() {
            vm.newRoom._userID = vm.user.sub;
            RoomService.Create(vm.newRoom)
                .then(function () {
                    FlashService.Success('Room created');
                    console.log('Room created successfully');
                    window.open('#/manager','_self');//todo modify condition
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }
    }
})();