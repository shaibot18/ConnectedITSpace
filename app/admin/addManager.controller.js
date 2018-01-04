(function () {
    'use strict';

    angular
        .module('app')
        .controller('AddManager.AdminController', Controller);

    function Controller($window, UserService, FlashService) {
        var vm = this;

        vm.user = null;
        vm.newUser = null;
        vm.saveUser = saveUser;
        vm.createUser = createUser;

        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }

        function createUser() {
            console.log('Function called');
            console.log(vm.newUser);
            vm.newUser.role = "2";
            UserService.Create(vm.newUser)
                .then(function () {
                    FlashService.Success('User created');
                    // console.log('User created successfully');
                    window.open('#/admin/userManagement','_self');//todo modify condition
                })
                .catch(function (error) {
                    FlashService.Error(error);
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
    }

})();