(function () {
  angular
    .module('app')
    .controller('AddManager.AdminController', Controller);

  function Controller($window, UserService, FlashService) {
    const vm = this;

    vm.user = null;
    vm.newUser = null;
    vm.saveUser = saveUser;
    vm.createUser = createUser;

    initController();

    function initController() {
      // get current user
      UserService.GetCurrent().then((user) => {
        vm.user = user;
      });
    }

    function createUser() {
      console.log('Function called');
      console.log(vm.newUser);
      vm.newUser.role = '2';
      UserService.Create(vm.newUser)
        .then(() => {
          FlashService.Success('User created');
          // console.log('User created successfully');
          window.open('#/admin/userManagement', '_self');// todo modify condition
        })
        .catch((error) => {
          FlashService.Error(error);
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
  }
}());
