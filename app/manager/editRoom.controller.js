(function () {
  angular
    .module('app')
    .controller('EditRoom.ManagerController', Controller);
  function Controller(UserService, RoomService, FlashService, $stateParams, $state, $scope, $log) {
    const vm = this;
    const roomId = $stateParams.roomId;
    vm.room = null;
    RoomService.Get(roomId)
      .then((room) => {
        vm.room = room;
      });
    vm.editRoom = () => {
      RoomService.Update(roomId, vm.room)
        .then((room) => {
          $log.log(room);
          FlashService.Success('Room has created successfully');
          setTimeout(() => {
            $state.go('home');
          }, 2000);
        })
        .catch((err) => { FlashService.Error(err); });
    };
    initController();
    function initController() {
      UserService.GetCurrent().then((user) => {
        vm.user = user;
      });
    }
  }
}());
