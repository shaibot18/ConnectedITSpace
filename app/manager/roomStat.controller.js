angular
  .module('app')
  .controller('RoomStatController', ['UserService', 'RoomService', 'FlashService', 'RoomStatService', 'RoomDataService',
    '$stateParams', '$scope', '$log', '$q', Controller]);

function Controller(
  UserService, RoomService, FlashService, RoomStatService, RoomDataService, $stateParams, $scope, $log, $q,
) {

  const vm = this;
  vm.user = null;
  UserService.GetCurrent().then((user) => {
    vm.user = user;
  });

  const roomId = $stateParams.roomId;
  $scope.avgNum = 0;
  $scope.totalNum = 0;

  
}
