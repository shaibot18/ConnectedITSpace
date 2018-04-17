angular
  .module('app')
  .controller('RoomStatController', ['UserService', 'RoomService', 'FlashService', 'RoomStatService',
    '$stateParams', '$scope', '$log', '$q', Controller]);

function Controller(
  UserService, RoomService, FlashService, RoomStatService, $stateParams, $scope, $log, $q,
) {

  const vm = this;
  vm.user = null;
  UserService.GetCurrent().then((user) => {
    vm.user = user;
  });

  const roomId = $stateParams.roomId;
  $scope.avgNum = 0;
  $scope.totalNum = 0;

  const getStats = function (startTime, endTime) {
    startTime = moment('20180312').format('YYYYMMDD');
    endTime = moment('20180318').format('YYYYMMDD');
    const deferred = $q.defer();
    let total = 0;
    RoomStatService.GetAllStatsByRange(roomId, startTime, endTime)
      .then((dataList) => {
        console.log(dataList);
      })
      .catch((err) => {
        FlashService.Error(`${err.name}:${err.message} ${err.stack}`);
        console.error(err);
        deferred.reject(err);
      });
    return deferred.promise;
  };


  const inData = [1, 2, 3, 4, 5, 6, 7];
  const outData = [1, 2, 3, 4, 5, 6, 7];
  const histoX = [1, 2, 3, 4, 5, 6, 7];

  const statsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { // 坐标轴指示器，坐标轴触发有效
        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
      },
    },
    legend: {
      data: ['In', 'Out'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: [{
      type: 'category',
      axisTick: { show: false },
      data: histoX
    }],
    yAxis: [{ type: 'value' }],
  };

  

  const allstats = echarts.init(document.getElementById('allstats'));

  allstats.setOption(statsOption);
  allstats.setOption({
    series: [{
      name: 'In',
      type: 'bar',
      stack: '总量',
      label: {
        normal: {
          show: true,
        },
      },
      data: inData,
    },
    {
      name: 'Out',
      type: 'bar',
      stack: '总量',
      label: {
        normal: {
          show: true,
          position: 'bottom',
        },
      },
      data: outData,
    }
    ],
  });
}
