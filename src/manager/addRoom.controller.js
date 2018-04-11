angular
  .module('app')
  .controller('AddRoom.ManagerController', Controller);

function Controller(UserService, RoomService, FlashService, $log) {
  const vm = this;
  vm.user = null;
  vm.newRoom = null;
  vm.createRoom = createRoom;
  initController();
  function initController() {
    // get current user
    UserService.GetCurrent().then((user) => {
      vm.user = user;
    });
  }
  function createRoom() {
    vm.newRoom._userID = vm.user.sub;
    RoomService.Create(vm.newRoom)
      .then(() => {
        FlashService.Success('Room created');
        $log.log('Room created successfully');
        window.open('#/manager', '_self');// todo modify condition
      })
      .catch((error) => {
        FlashService.Error(error);
      });
  }
}
