(function () {
    'use strict';

    angular
        .module('app')
        .controller('Admin-home.IndexController', Controller);

    function Controller($window, UserService, FlashService, RoomdataService) {
        var vm = this;

        vm.user = null;
        vm.saveUser = saveUser;
        vm.deleteUser = deleteUser;

        // initController();
        getRoomdata();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }

        function getRoomdata() {
            RoomdataService.GetAll().then(function (roomdataList) {
                vm.roomdataList = roomdataList;
                console.log(roomdataList);
            });
        }

        function saveUser() {
            UserService.Update(vm.user)
                .then(function () {
                    FlashService.Success('User updated');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }

        function deleteUser() {
            UserService.Delete(vm.user._id)
                .then(function () {
                    // log user out
                    $window.location = '/login';
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }
    }

})();