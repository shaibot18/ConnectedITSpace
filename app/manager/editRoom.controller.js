(function () {
  angular
    .module('app')
    .controller('EditRoom.ManagerController', Controller);

  function Controller(UserService, RoomService, FlashService) {
    const vm = this;


    initController();

    function initController() {
      // get current user
      UserService.GetCurrent().then((user) => {
        vm.user = user;
      });
    }
  }
}());
