angular
  .module('app')
  .controller('Dbc.ManagerController', Controller);

function Controller(RoomDataService, $scope) {
  $scope.removeDuplicates = () => {
    console.log('remove function run');
    RoomDataService.RemoveDuplicates()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  $scope.adjustTimeZone = () => {
    console.log('adjust function run');
    RoomDataService.AdjustTimeZone()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
}
