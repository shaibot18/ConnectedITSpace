(function () {
  angular
    .module('app')
    .controller('EditManager.AdminController', Controller);

  function Controller($window, UserService, FlashService) {
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
