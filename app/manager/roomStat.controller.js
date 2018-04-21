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
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow', label: { backgroundColor: '#6a7985' } } },
    toolbox: { feature: { saveAsImage: {} } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [ { type: 'category', boundaryGap: false, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] } ],
    yAxis: [{ type: 'value' }]
  };

  // weekly bar negative chart options
  vm.weeklyBarNegativeChartOptionBase = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Delta', 'In', 'Out'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    yAxis: [ { type: 'value' } ],
    xAxis: [{ type: 'category', axisTick: { show: false }, data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }]
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

    $scope.weeklyBarNegativeStats = echarts.init(document.getElementById('weeklyBarNegativeChart'));
    $scope.weeklyBarNegativeStats.setOption(vm.weeklyBarNegativeChartOptionBase);

    $scope.renderDailyBarPlot($scope.dailyPlotDate);
    $scope.renderWeeklyPlot($scope.weekPlotDate); // renders both stack and bar negative charts
  };

  $scope.renderDailyBarPlot = function (dailyPlotDate) {
    const startDate = dailyPlotDate.format('YYYY-MM-DD');
    _getStats(startDate, null)
      .then((result) => {
        _updateDailyBarPlot(result);
      })
      .catch((err) => {
        console.log(err); // eslint-disable-line no-console
      });
  };

  $scope.renderWeeklyPlot = function () {
    const startDate = $scope.weekPlotDate.start.format('YYYY-MM-DD');
    const endDate = $scope.weekPlotDate.end.format('YYYY-MM-DD');

    _getStats(startDate, endDate)
      .then((result) => {
        _updateWeeklyPlot(result);
      })
      .catch((err) => {
        console.log(err); // eslint-disable-line no-console
      });
  };

  $scope.init();

  // get query result
  function _getStats(startDate, endDate) {
    const deferred = $q.defer();

    // query data object
    const reqData = {
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

  function _updateWeeklyPlot(result) {
    const seriesData = [];
    for (let i = 0; i < 24; i++) {
      seriesData.push({ name: i, type: 'line', stack: '总量', label: { normal: { show: true, position: 'center' } }, areaStyle: { normal: {} }, data: [0, 0, 0, 0, 0] });
    }

    const barNegativeSeries = [];
    const barNegativeSeriesData = {
      'In': [],
      'Out': [],
      'delta': []
    };
    const barNegativeIndexes = ['delta', 'In', 'Out'];

    result.forEach((e) => {
      // iso weekday as the index in data array, need to reduce by 1
      const wd = moment(e.recordDate).isoWeekday() - 1;
      e.stats.forEach((ele) => {
        seriesData[ele.hourRange].data[wd] = ele.in;
        barNegativeSeriesData.In[wd] = ele.in;
        barNegativeSeriesData.Out[wd] = ele.out * -1; // switch to negative
        barNegativeSeriesData.delta[wd] = ele.in - ele.out;
      });
    });
    $scope.weeklyStats.setOption({
      series: seriesData
    });

    barNegativeIndexes.forEach((e) => {
      barNegativeSeries.push({ name: e, type: 'bar', label: { normal: { show: true, position: 'inside' } }, data: barNegativeSeriesData[e] });
    });
    $scope.weeklyBarNegativeStats.setOption({
      series: barNegativeSeries
    });
  }
}
