(function () {
    'use strict';

    angular
        .module('app')
        .controller('Index.AdminController', Controller);

    function Controller($scope, $window, UserService, FlashService, RoomService, RoomDataService) {
        var vm = this;

        vm.user = null;
        vm.saveUser = saveUser;
        vm.deleteUser = deleteUser;
        

        initController();

         $scope.renderTable = function(){
            $('#datatable').DataTable();                                        
         }      

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            }); 
           
            // RoomService.GetAll()
            //     .then(function(roomList){
            //         $scope.roomList = roomList;
            //     })
            //     .catch(function(err){
            //        console.log(err); 
            //     });

            var up = UserService.GetAll();
            var rp = RoomService.GetAll();
            Promise.all([up,rp]).then(function(values){
                $scope.userList = values[0];
                $scope.roomList = values[1];
                $.each($scope.roomList,function(ind1,Room){
                    $.each($scope.userList,function(ind2,User){
                        if(User._id == Room._userID){
                            $scope.roomList[ind1]["username"] = User.firstName + ' ' + User.lastName;
                        }
                    })
                });
                $scope.$apply();
                console.log($scope.roomList);
            })    
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