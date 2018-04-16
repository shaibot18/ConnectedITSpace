angular
  .module('app')
  .controller('RoomInfo.ManagerController', ['UserService', 'RoomService', 'FlashService', 'RoomDataService',
    '$stateParams', '$scope', '$log', '$q', Controller]);

function Controller(
  UserService, RoomService, FlashService, RoomDataService,
  $stateParams, $scope, $log, $q,
) {

  const vm = this;
  vm.user = null;
  UserService.GetCurrent().then((user) => {
    vm.user = user;
  });
  const roomId = $stateParams.roomId;
  const period = 3000;
  const delay = 10000;
  const oneMinute = 60 * 1000;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;
  let timeDiff = 0;
  $scope.avgNum = 0;
  $scope.totalNum = 0;
  $scope.curNum = 0;
  $scope.formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const calDate = date.getDate();
    const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    return `${year}/${month}/${calDate} ${weekday}`;
  };

  $scope.exportDate = {
    start: moment().day(-7),
    end: moment()
  };
  $scope.exportToCSV = function () {
    function convertToHours(start, end, list) {
      const result = [];
      while (start.diff(end) < 0) {
        start.add(1, 'h');
        if (start.hour() > 8 && start.hour() < 18) {
          let In = 0;
          let Out = 0;
          const tStart = start.valueOf();
          const tEnd = tStart + oneHour;
          const filteredList = list.filter((ele) => {
            const t = Date.parse(ele.Time);
            return t > tStart && t < tEnd;
          });
          if (filteredList.length > 0) {
            filteredList.forEach((ele) => {
              In += ele.In;
              Out += ele.Out;
            });
          }
          result.push({
            Time: start.format('YYYYMMDD,HH:mm'),
            In,
            Out
          });
        }
      }
      return result;
    }
    if ($scope.exportDate) {
      const { start, end } = $scope.exportDate;
      const startStr = $scope.exportDate.start.format('YYYYMMDD');
      const endStr = $scope.exportDate.end.format('YYYYMMDD');
      RoomDataService.GetByTimeRange(roomId, start.valueOf(), end.valueOf())
        .then((dataList) => {
          if (!dataList.length) { return; }
          let csvContent = 'data:text/csv;charset=utf-8,';
          csvContent += 'Date,Time,In,Out\r\n';
          const dataListInHour = convertToHours(start, end, dataList);
          dataListInHour.forEach((ele) => {
            csvContent += `${ele.Time},${ele.In},${ele.Out} \r\n`;
          });
          const uri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', uri);
          link.setAttribute('download', `DataExport-${startStr}-${endStr}.csv`);
          document.body.appendChild(link); // Required for FF
          link.click();
          document.body.removeChild(link);
        });
    }
  };
  $scope.barPlotDate = moment().hour(0).minute(0).second(0)
    .millisecond(0);
  $scope.renderBarPlot = renderBarPlot;

  const initStyle = function () {
    if (typeof ($.fn.daterangepicker) === 'undefined') { return; }
    $('#single_cal3').daterangepicker({
      locale: {
        format: 'YYYY-MM-DD',
        firstDay: 1
      },
      isInvalidDate: (date) => { return date.day() == 0 || date.day() == 6 },
      startDate: moment(),
      singleDatePicker: true,
      singleClasses: 'picker_3'
    }, (start) => {
      $log.log(start);
      $scope.barPlotDate = start;
    });

    $('#reservation').daterangepicker({
      locale: {
        format: 'YYYY-MM-DD',
        firstDay: 1
      },
      startDate: $scope.exportDate.start.format('YYYY-MM-DD'),
      endDate: $scope.exportDate.end.format('YYYY-MM-DD'),
      ranges: {
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
    }, (start, end) => {
      $scope.exportDate = { start, end };
    });
  };

  const initTime = function () {
    const deferred = $q.defer();
    RoomService.Get(roomId)
      .then((room) => {
        const timeZone = room.timeZone;
        $scope.avgNum = (room.avgNum === undefined) ? -1 : room.avgNum;
        $scope.totalNum = (room.totalNum === undefined) ? -1 : room.totalNum;
        $scope.curNum = (room.curNum === undefined) ? -1 : room.curNum;
        const sign = timeZone.charAt(0);
        if (sign === '+') {
          timeDiff = (parseInt(timeZone.slice(1, 3), 10) * 3600 * 1000
            + parseInt(timeZone.slice(3, 5), 10) * 60 * 1000);
        } else {
          timeDiff = ((parseInt(timeZone.slice(1, 3), 10) * 3600 * 1000
          + parseInt(timeZone.slice(3, 5), 10) * 60 * 1000) * (-1));
        }
        deferred.resolve(timeDiff);
      })
      .catch((err) => {
        $log.error(err);
        deferred.reject();
      });
    return deferred.promise;
  };

  const initCount = function (startTime, endTime) {
    const deferred = $q.defer();
    let total = 0;
    RoomDataService.GetByTimeRange(roomId, startTime, endTime)
      .then((dataList) => {
        let lastTime = '';
        $.each(dataList, (index, element) => {
          if (element.Time !== lastTime) {
            total = total + element.In - element.Out;
          }
          lastTime = element.Time;
        });
        deferred.resolve(total);
      })
      .catch((err) => {
        FlashService.Error(`${err.name}:${err.message} ${err.stack}`);
        console.error(err);
        deferred.reject(err);
      });
    return deferred.promise;
  };

  initStyle();
  initTime()
    .then((t) => {
      timeDiff = t;
      const now = moment().valueOf();
      const zeroTime = moment()
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .valueOf();
      renderBarPlot(zeroTime);
      renderTable(zeroTime);
      return initCount(zeroTime, now - period);
    });

  // TODO: wrap graph into a isolated directive
  function renderBarPlot(zeroTime) {
    const histoX = [];
    const inData = [];
    const outData = [];
    const totalData = [];
    const promArr = [];
    for (let i = 8; i < 19; i++) {
      histoX.push(`${i}:00 - ${i + 1}:00`);
      promArr[i - 8] = RoomDataService.GetByTimeRange(
        roomId,
        zeroTime + (i * oneHour), zeroTime + ((i + 1) * oneHour)
      )
        .then((dataList) => {
          let inSum = 0;
          let outSum = 0;
          let lastTime = '';
          $.each(dataList, (index, element) => {
            if (element.Time !== lastTime) {
              inSum += element.In;
              outSum += element.Out;
            }
            lastTime = element.Time;
          });
          inData[i - 8] = inSum;
          outData[i - 8] = outSum;
          totalData[i - 8] = inSum - outSum;
        })
        .catch((err) => {
          FlashService.Error(`${err.name}:${err.message} ${err.stack}`);
          console.error(err);
        });
    }
    const historyOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
        },
      },
      legend: {
        data: ['In', 'Out', 'Total'],
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
    const history = echarts.init(document.getElementById('history'));
    Promise.all(promArr).then(() => {
      history.setOption(historyOption);
      history.setOption({
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
    });
  }

  function renderTable(zeroTime) {
    const startTime = zeroTime - 7 * oneDay;
    const resultData = [];
    const promArr = [];
    for (let i = 0; i < 7; i++) {
      promArr[i] = RoomDataService.GetByTimeRange(
        roomId,
        startTime + (i * oneDay), startTime + ((i + 1) * oneDay)
      )
        .then((dataList) => {
          let inSum = 0;
          let outSum = 0;
          let lastTime = '';
          $.each(dataList, (index, element) => {
            if (element.Time !== lastTime) {
              inSum += element.In;
              outSum += element.Out;
            }
            lastTime = element.Time;
          });
          resultData.push({
            date: new Date(startTime + (i * oneDay) - timeDiff),
            in: inSum,
            out: outSum,
            total: inSum - outSum,
          });
        })
        .catch((err) => {
          $log.error(err);
          FlashService.Error(`${err.name}:${err.message} ${err.stack}`);
        });
    }
    Promise.all(promArr).then(() => {
      resultData.sort((prev, next) => (prev.date - next.date));
      $scope.historyData = resultData;
    });
  }

  // function allStats() {
    // const allstats = echarts.init(document.getElementById('allstats'));
    // const app = {};
    // option = null;
    // app.title = '笛卡尔坐标系上的热力图';
    // const hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a',
    //   '7a', '8a', '9a', '10a', '11a',
    //   '12p', '1p', '2p', '3p', '4p', '5p',
    //   '6p', '7p', '8p', '9p', '10p', '11p'];
    // const days = ['Saturday', 'Friday', 'Thursday',
    //   'Wednesday', 'Tuesday', 'Monday', 'Sunday'];

    // let data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]];

    // data = data.map(function (item) {
    //   return [item[1], item[0], item[2] || '-'];
    // });

    // option = {
    //   tooltip: {
    //     position: 'top'
    //   },
    //   animation: false,
    //   grid: {
    //     height: '50%',
    //     y: '10%'
    //   },
    //   xAxis: {
    //     type: 'category',
    //     data: hours,
    //     splitArea: {
    //       show: true
    //     }
    //   },
    //   yAxis: {
    //     type: 'category',
    //     data: days,
    //     splitArea: {
    //       show: true
    //     }
    //   },
    //   visualMap: {
    //     min: 0,
    //     max: 10,
    //     calculable: true,
    //     orient: 'horizontal',
    //     left: 'center',
    //     bottom: '15%'
    //   },
    //   series: [{
    //     name: 'Punch Card',
    //     type: 'heatmap',
    //     data: data,
    //     label: {
    //       normal: {
    //         show: true
    //       }
    //     },
    //     itemStyle: {
    //       emphasis: {
    //         shadowBlur: 10,
    //         shadowColor: 'rgba(0, 0, 0, 0.5)'
    //       }
    //     }
    //   }]
    // };
  // }
  
}
