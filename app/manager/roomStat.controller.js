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
  $scope.weekPlotDate = {
    start: moment().startOf('week'),
    end: moment().endOf('week')
  };

  // daily stat chart options
  vm.dailyStatsOptionBase = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['In', 'Out'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', axisTick: { show: false }, data: _.range(24) }],
    yAxis: [{ type: 'value' }]
  };

  // weekly stack chart options
  vm.weeklyStatsOptionBase = {
    // title: { text: '堆叠区域图' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } } },
    legend: { data: ['邮件营销', '联盟广告', '视频广告', '直接访问', '搜索引擎'] },
    toolbox: { feature: { saveAsImage: {} } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [ { type: 'category', boundaryGap: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] } ],
    yAxis: [ { type: 'value' }]
  };
  
  // daily picker options
  vm.dailyPickerOptions = {
    locale: { format: 'YYYY-MM-DD', firstDay: 1 },
    isInvalidDate: date => (date.day() === 0 || date.day() === 6),
    startDate: moment(),
    singleDatePicker: true,
    singleClasses: 'picker_3'
  };

  // week picker options
  vm.weekPickerOptions = {
    locale: { format: 'YYYY-MM-DD', firstDay: 1 },
    isInvalidDate: date => (date.day() === 0 || date.day() === 6),
    startDate: moment().day(1), // Monday
    singleDatePicker: true,
    singleClasses: 'picker_3'
  };

  // stage setup
  $scope.init = function () {
    if (typeof ($.fn.daterangepicker) === 'undefined') { console.log('Date picker not loaded'); return; }
    $('#singledaypicker').daterangepicker(vm.dailyPickerOptions, (start) => {
      $scope.dailyPlotDate = start;
    });

    $('#weekpicker').daterangepicker(vm.weekPickerOptions, (_start) => {
      $scope.weekPlotDate = {
        start: moment(_start).day(1), // Monday
        end: moment(_start).day(5) // Friday
      };
    });

    $scope.dailyStats = echarts.init(document.getElementById('dailyStatsChart'));
    $scope.dailyStats.setOption(vm.dailyStatsOptionBase);

    $scope.weeklyStats = echarts.init(document.getElementById('weeklyStackChart'));
    $scope.weeklyStats.setOption(vm.weeklyStatsOptionBase);

    $scope.renderDailyBarPlot($scope.dailyPlotDate);
    $scope.renderWeeklyStackPlot($scope.weekPlotDate);
  };

  $scope.renderDailyBarPlot = function (dailyPlotDate) {
    const startDate = dailyPlotDate.format('YYYY-MM-DD');
    _getStats(startDate, null)
      .then((result) => {
        _updateDailyBarPlot(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  $scope.renderWeeklyStackPlot = function () {
    const startDate = $scope.weekPlotDate.start.format('YYYY-MM-DD');
    const endDate = $scope.weekPlotDate.end.format('YYYY-MM-DD');

    _getStats(startDate, endDate)
      .then((result) => {
        _updateWeeklyStackPlot(result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  $scope.init();

  // get query result
  function _getStats(startDate, endDate) {

    const deferred = $q.defer();

    // query data object
    let reqData = {
      cmd: 'query',
      roomId: vm._roomId
    };

    reqData.startDate = startDate;
    if (endDate && (typeof endDate !== 'undefined')) {
      reqData.endDate = endDate;
    }
    RoomStatService.obtainStats(reqData)
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

  function _updateWeeklyStackPlot(result) {
    console.log(result);

    $scope.weeklyStats.setOption({
      series:[
        { name: '0-1', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [120, 132, 101, 134, 90, 230, 210] },
        { name: '1-2', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [220, 182, 191, 234, 290, 330, 310] },
        { name: '2-3', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [150, 232, 201, 154, 190, 330, 410] },
        { name: '3-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '4-5', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '5-6', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '7-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '8-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '9-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '10-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '11-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '12-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '13-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '14-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '15-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '16-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '17-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '18-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '19-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '20-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '21-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '22-4', type: 'line', stack: '总量', areaStyle: { normal: {} }, data: [320, 332, 301, 334, 390, 330, 320] },
        { name: '23-24', type: 'line', stack: '总量', label: { normal: { show: true, position: 'top' } }, areaStyle: { normal: {} }, data: [820, 932, 901, 934, 1290, 1330, 1320] }
      ],
    });
  }
}
