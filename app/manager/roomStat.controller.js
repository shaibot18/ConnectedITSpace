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

  const wds = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hrs = ['12a', '1a', '2a', '3a', '4a', '5a', '6a',
    '7a', '8a', '9a', '10a', '11a',
    '12p', '1p', '2p', '3p', '4p', '5p',
    '6p', '7p', '8p', '9p', '10p', '11p'];
  const hrs_sec = ['12a-8am', '8am-12pm', '12pm-13pm', '13pm-18pm', '18pm-24pm'];

  // daily stat chart options
  vm.dailyStatsOptionBase = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['In', 'Out'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [{ type: 'category', axisTick: { show: false }, data: _.range(24) }],
    yAxis: [{ type: 'value' }]
  };

  // weekly stack line chart options
  vm.weeklyStatsOptionBase = {
    title: { text: 'Inbound & Outbound visitors summary by day' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['In', 'Out', 'Delta'] },
    toolbox: { show: true, feature: { magicType: { show: true, type: ['stack', 'tiled'] }, saveAsImage: { show: true } } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [ { type: 'category', boundaryGap: false, data: wds } ],
    yAxis: [{ type: 'value' }]
  };

  // weekly punch chart options
  vm.weeklyPunchChartOptionBase = {
    title: { text: 'Outbound visitor' },
    legend: { data: ['Onbound visitors'], left: 'top' },
    tooltip: {
      position: 'top', formatter: params => `${params.value[0]} visitors at ${hrs[params.value[1]]}`,
    },
    grid: { left: 2, bottom: 10, right: 10, containLabel: true },
    xAxis: { type: 'category', data: hrs, boundaryGap: false, splitLine: { show: true, lineStyle: { color: '#999', type: 'dashed' }}, axisLine: { show: false } },
    yAxis: { type: 'category', data: wds, axisLine: { show: false } }
  };

  // weekly visitor heatmap chart options
  vm.weeklyHeatMapChartOptionBase = {
    title: { text: 'Inbound visitor heatmap' },
    tooltip: { position: 'top' },
    animation: false,
    grid: { height: '50%', y: '10%' },
    xAxis: { type: 'category', data: hrs, splitArea: { show: true } },
    yAxis: { type: 'category', data: wds, splitArea: { show: true } }
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

    $scope.weeklyHeatMapStats = echarts.init(document.getElementById('weeklyHeatMapChart'));
    $scope.weeklyHeatMapStats.setOption(vm.weeklyHeatMapChartOptionBase);

    $scope.weeklyPunchStats = echarts.init(document.getElementById('weeklyPunchChart'));
    $scope.weeklyPunchStats.setOption(vm.weeklyPunchChartOptionBase);

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
    const rawData = []; // raw data to store clean data, format as [[in,out,d,h],[],...]
    const dailySumData = []; // summed data (summarized to one day) [in, out, delta, d]
    let maxInHour = 0; // max in hour during the week
    let maxOutHour = 0; // max out hour during the week

    // seriesData.push({ name: i, type: 'line', stack: '总量', label: { normal: { show: true, position: 'center' } }, areaStyle: { normal: {} }, data: [0, 0, 0, 0, 0] });
    
    // generate empty rawdata matrix, [in,out,d,h]
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 24; j++) {
        rawData.push([0, 0, i, j]);
      }
    }

    result.forEach((e) => {
      // iso weekday as the index in data array, need to reduce by 1
      const wd = moment(e.recordDate).isoWeekday() - 1;
      let dIn = 0;
      let dOut = 0;
      e.stats.forEach((ele) => {
        rawData[_.findIndex(rawData, (item) => {
          return item[2] === wd && item[3] === ele.hourRange;
        })] = [ele.in, ele.out, wd, ele.hourRange];
        if (ele.in > maxInHour) maxInHour = ele.in;
        if (ele.out > maxOutHour) maxOutHour = ele.out;
        dIn += ele.in;
        dOut += ele.out;
      });
      dailySumData.push([dIn, dOut, dIn - dOut, wd]);
    });

    // Inbound & outbound visitor
    $scope.weeklyStats.setOption({
      series: [
        { name: 'Inbound', type: 'line', smooth: true, data: dailySumData.map( item => item[0] ) },
        { name: 'Outbound', type: 'line', smooth: true, data: dailySumData.map(item => item[1]) },
        { name: 'Delta', type: 'line', smooth: true, data: dailySumData.map(item => item[2]) },
      ]
    });

    $scope.weeklyHeatMapStats.setOption({
      visualMap: { min: 0, max: maxInHour, calculable: true, orient: 'horizontal', left: 'center', bottom: '15%' },
      series: [{
        name: 'Inbound',
        type: 'heatmap',
        data: rawData.map(item => [item[3], item[2], item[0]]), // [d, h, in]
        label: { normal: { show: true } },
        itemStyle: { emphasis: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
      }]
    });

    $scope.weeklyPunchStats.setOption({
      series: [{
        name: 'Outbound',
        type: 'scatter',
        symbolSize: val => val[2] * 3,
        data: rawData.map(item => [item[3], item[2], item[1]]), // [d, h, out]
        animationDelay: idx => idx * 10
      }]
    });
  }
}
