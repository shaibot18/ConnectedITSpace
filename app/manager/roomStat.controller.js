angular
  .module('app')
  .controller('RoomStatController', ['UserService', 'RoomService', 'FlashService', 'RoomStatService', '_',
    '$stateParams', '$scope', '$log', '$q', RoomStatController]);

function RoomStatController(UserService, RoomService, FlashService, RoomStatService, _, $stateParams, $scope, $log, $q) {
  const vm = this;
  vm.user = null;
  UserService.GetCurrent().then((user) => {
    vm.user = user;
  });
  vm._roomId = $stateParams.roomId;
  $scope.avgNum = 0;
  $scope.totalNum = 0;
  $scope.dailyPlotDate = moment();

  // daily stat chart options
  vm.dailyStatsOptionBase = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['In', 'Out'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', axisTick: { show: false }, data: _.range(24) }],
    yAxis: [{ type: 'value' }]
  };

  // daily picker options
  vm.dailyPickerOptions = {
    locale: { format: 'YYYY-MM-DD', firstDay: 1 },
    isInvalidDate: date => (date.day() === 0 || date.day() === 6),
    startDate: moment(),
    singleDatePicker: true,
    singleClasses: 'picker_3'
  };

  // query data base object
  vm.reqData = {
    cmd: 'query',
    roomId: vm._roomId
  };

  // stage setup
  $scope.init = function () {
    if (typeof ($.fn.daterangepicker) === 'undefined') { return; }
    $('#singledaypicker').daterangepicker(vm.dailyPickerOptions, (start) => {
      $scope.dailyPlotDate = start;
    });

    $scope.dailyStats = echarts.init(document.getElementById('dailyStatsChart'));
    $scope.dailyStats.setOption(vm.dailyStatsOptionBase);

    $scope.renderDailyBarPlot($scope.dailyPlotDate);
  };

  $scope.renderDailyBarPlot = function (dailyPlotDate) {
    const startDate = dailyPlotDate.format('YYYY-MM-DD');
    _getStats(startDate)
      .then((result) => {
        _updateDailyBarPlot(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  $scope.init();

  // get query result
  function _getStats(startDate, endDate) {
    const deferred = $q.defer();
    vm.reqData.startDate = startDate;
    if (endDate && typeof endDate !== 'undefined') {
      vm.reqData.startDate = endDate;
    }
    RoomStatService.obtainStats(vm.reqData)
      .then((queryResult) => {
        deferred.resolve(queryResult);
      })
      .catch((err) => {
        FlashService.Error(`${err.name}:${err.message} ${err.stack}`);
        deferred.reject(err);
      });
    return deferred.promise;
  }

  function _updateDailyBarPlot(result) {
    const dailyData = result.stats;
    const inData = [];
    const outData = [];
    const totalData = [];
    if (dailyData && dailyData.length > 0) {
      dailyData.forEach((e) => {
        inData[e.hourRange] = e.in;
        outData[e.hourRange] = e.out;
      });
    }
    $scope.dailyStats.setOption({
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
      },
      {
        name: 'Total',
        type: 'line',
        data: totalData,
      },
      ],
    });
  }
}
