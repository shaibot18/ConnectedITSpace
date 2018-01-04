(function () {
    'use strict';

    angular
        .module('app')
        .controller('UserManagement.AdminController', Controller);

    function Controller($scope,$state,$window, UserService, FlashService) {
        var vm = this;

        vm.user = null;
        $scope.deleteUser = function(_UserId) {
            UserService.Delete(_UserId)
                .then(function () {
                    $state.reload();
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }

        initController();

        $scope.renderTable = function(){
            $('#datatable').DataTable();                                        
         }

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            UserService.GetAll()
                .then(function(userList){
                    $scope.userList = userList;
                })
                .catch(function(err){
                    FlashService.Error(err);
                });
        }    


        
    }

})();