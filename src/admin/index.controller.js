(function () {
  angular
    .module('app')
    .controller('Index.AdminController', Controller);

  function Controller($scope, $window, UserService, FlashService, RoomService) {
    const vm = this;

    vm.user = null;
    vm.saveUser = saveUser;
    vm.deleteUser = deleteUser;


    initController();

    $scope.renderTable = function () {
      $('#datatable').DataTable();
    };

    function initController() {
      // get current user
      UserService.GetCurrent().then((user) => {
        vm.user = user;
      });

      const up = UserService.GetAll();
      const rp = RoomService.GetAll();
      Promise.all([up, rp]).then((values) => {
        $scope.userList = values[0];
        $scope.roomList = values[1];
        $.each($scope.roomList, (ind1, Room) => {
          $.each($scope.userList, (ind2, User) => {
            if (User._id === Room._userID) {
              $scope.roomList[ind1].username = `${User.firstName} ${User.lastName}`;
            }
          });
        });
        $scope.$apply();
        console.log($scope.roomList);
      });
    }

    function saveUser() {
      UserService.Update(vm.user)
        .then(() => {
          FlashService.Success('User updated');
        })
        .catch((error) => {
          FlashService.Error(error);
        });
    }

    function deleteUser() {
      UserService.Delete(vm.user._id)
        .then(() => {
          // log user out
          $window.location = '/login';
        })
        .catch((error) => {
          FlashService.Error(error);
        });
    }
  }
}());
