(function () {
  angular
    .module('app')
    .controller('Index.ManagerController', Controller);

  function Controller($scope, $compile, UserService, RoomService, FlashService, $state) {
    const vm = this;

    vm.user = null;
    initController();


    $scope.deleteRoom = function (_RoomId) {
      console.log(`Delete function called${_RoomId}`);
      RoomService.Delete(_RoomId)
        .then((data) => {
          $state.reload();
        })
        .catch((err) => {
          FlashService.Error(err);
        });
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
          console.log(roomList);
          $scope.roomList = roomList;
        });
      });
    }

    function renderRoomList(roomList) {
      $.each(roomList, (index, element) => {
        const $HTML = $compile($('#newRoom').html())($scope);
        $HTML.find('h3').text(`${element.country}, ${element.city}, ${element.building}`);
        // $HTML.find('.x_panel').attr('id',element._id);
        $HTML.find('.triangle_display').attr('name', element._id);
        $HTML.find('a').attr('href', `#/manager/roomInfo/${element._id}`);
        $('#content').prepend($HTML);
      });
    }
  }
}());
