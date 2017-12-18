(function () {
    'use strict';

    angular
        .module('app')
        .controller('Admin-manage.IndexController', Controller);

    function Controller($window, UserService, FlashService) {
        var vm = this;

        vm.user = null;
        vm.saveUser = saveUser;
        vm.deleteUser = deleteUser;
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
            console.log(vm.user);
            UserService.Create(vm.user)
                .then(function () {
                    FlashService.Success('User created');
                    window.history.go(-1);//todo modify condition
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