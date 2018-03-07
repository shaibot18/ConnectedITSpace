(function () {
  angular
    .module('app')
    .controller('UserManagement.AdminController', Controller);

  function Controller($scope, $state, $window, UserService, FlashService) {
    const vm = this;

    vm.user = null;
    $scope.deleteUser = function (_UserId) {
      UserService.Delete(_UserId)
        .then(() => {
          $state.reload();
        })
        .catch((error) => {
          FlashService.Error(error);
        });
    };

    initController();

    $scope.renderTable = function () {
      $('#datatable').DataTable();
    };

    function initController() {
      // get current user
      UserService.GetCurrent().then((user) => {
        vm.user = user;
      });
      UserService.GetAll()
        .then((userList) => {
          $scope.userList = userList;
        })
        .catch((err) => {
          FlashService.Error(err);
        });
    }
  }
}());
