(function () {
  angular
    .module('app')
    .controller('Index.ManagerController', Controller);

  function Controller($scope, $compile, UserService, RoomService, FlashService, $state, $log) {
    const vm = this;

    vm.user = null;
    initController();
    $scope.deleteRoom = function (_RoomId) {
      $log.log(`Delete function called${_RoomId}`);
      RoomService.Delete(_RoomId)
        .then(() => { $state.reload(); })
        .catch((err) => { FlashService.Error(err); });
    };

    $(document).ready(() => {
      $('.middleadd2').click(() => {
        if ($('.triangle_display').css('display') == 'none') {
          $('.triangle_display').show();
        } else {
          $('.triangle_display').hide();
        }
      });
    });

    function initController() {
      // get current user
      UserService.GetCurrent().then((user) => {
        vm.user = user;
        RoomService.GetRoomList(vm.user.sub).then((roomList) => {
          $log.log(roomList);
          $scope.roomList = roomList;
        });
      });
    }
  }
}());
