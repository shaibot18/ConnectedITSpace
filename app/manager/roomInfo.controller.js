(function () {
  angular
    .module('app')
    .controller('RoomInfo.ManagerController', Controller);

  function Controller(UserService, RoomService, FlashService, RoomDataService, $stateParams, $scope, $log, $q) {
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
    const initTime = function () {
      const deferred = $q.defer();
      RoomService.Get(roomId)
        .then((room) => {
          const timeZone = room.timeZone;
          const sign = timeZone.charAt(0);
          if (sign == "+") {
            timeDiff = parseInt(timeZone.slice(1, 3)) * 3600 * 1000 + parseInt(timeZone.slice(3, 5)) * 60 * 1000
          }
          else {
            timeDiff = (parseInt(timeZone.slice(1, 3)) * 3600 * 1000 + parseInt(timeZone.slice(3, 5)) * 60 * 1000) * (-1);
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
          $log.log('Init data list');
          $log.log(dataList);
          let lastTime = '';
          $.each(dataList, (index, element) => {
            if (element.Time !== lastTime) {
              total = total + element.In - element.Out;
            }
            lastTime = element.Time;
          });
          $log.log(`Init count is ${total}`);
          deferred.resolve(total);
        })
        .catch((err) => {
          FlashService.Error(err);
          deferred.reject(err);
        });
      return deferred.promise;
    };

    initTime()
      .then((t) => {
        timeDiff = t;
        const now = Date.now();
        const today = new Date(now);
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        const zeroTime = Date.parse(today) + timeDiff;
        renderToday(zeroTime);
        renderHistory(zeroTime);
        return initCount(Date.parse(today), now - period);
      })
      .then((total) => {
        renderRealTime(total);
      });

    function renderRealTime(initTotal) {
      let total = initTotal;
      const data = [];
      const realTimeOption = {
        tooltip: {
          trigger: 'axis',
          formatter(params) {
            params = params[0];
            return `${params.value[0].toLocaleTimeString('en-GB')} : ${params.value[1]}`;
          },
          axisPointer: {
            animation: false,
          },
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false,
          },
        },
        series: [{
          name: '模拟数据',
          type: 'line',
          showSymbol: false,
          hoverAnimation: false,
          data,
        }],
      };
      const realTime = echarts.init(document.getElementById('real-time'));
      realTime.setOption(realTimeOption);
      const interval = setInterval(updateRealTime, period);
      $scope.$on('$destroy', () => {
        // Make sure that the interval is destroyed too
        clearInterval(interval);
      });
      function updateRealTime() {
        const curTime = Date.now() + timeDiff;
        RoomDataService.GetByTimeRange(roomId, curTime - period - delay, curTime - delay)
          .then((dataList) => {
            $log.log(dataList);
            let lastTime = '';
            $.each(dataList, (index, element) => {
              if (element.Time !== lastTime) {
                total = total + element.In - element.Out;
              }
              lastTime = element.Time;
            });
          })
          .catch((err) => {
            FlashService.Error(err);
          });
        data.push({
          name: new Date(curTime - delay - timeDiff).toString(),
          value: [new Date(curTime - delay - timeDiff), total],
        });
        $('#totalPeople').text(total.toString());
        realTime.setOption({
          series: [{
            data,
          }],
        });
        $log.log(data);
      }
    }

    function renderToday(zeroTime) {
      const histoX = [];
      const inData = [];
      const outData = [];
      const totalData = [];
      const promArr = [];
      for (let i = 8; i < 18; i++) {
        histoX.push(`${i}:00 - ${i + 1}:00`);
        $log.log(`Start time is ${new Date(zeroTime + (i * oneHour))}`);
        $log.log(`End time is ${new Date(zeroTime + ((i + 1) * oneHour))}`);
        promArr[i - 8] = RoomDataService.GetByTimeRange(roomId, zeroTime + (i * oneHour), zeroTime + ((i + 1) * oneHour))
          .then((dataList) => {
            let inSum = 0;
            let outSum = 0;
            $log.log('Data list is');
            $log.log(dataList);
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
            $log.error(err);
            FlashService.Error(err);
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
        xAxis: [
          {
            type: 'category',
            axisTick: { show: false },
            data: histoX,
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
      };
      const history = echarts.init(document.getElementById('history'));
      Promise.all(promArr).then(() => {
        history.setOption(historyOption);
        history.setOption({
          series: [
            {
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

    function renderHistory(zeroTime) {
      const startTime = zeroTime - 7 * oneDay;
      const resultData = [];
      const promArr = [];
      for (let i = 0; i < 7; i++) {
        $log.log(`Start date is ${new Date(startTime + (i * oneDay) - timeDiff)}`);
        $log.log(`End date is ${new Date(startTime + ((i + 1) * oneDay) - timeDiff)}`);
        promArr[i] = RoomDataService.GetByTimeRange(roomId, startTime + (i * oneDay), startTime + ((i + 1) * oneDay))
          .then((dataList) => {
            let inSum = 0;
            let outSum = 0;
            let lastTime = '';
            $log.log('Data list is');
            $log.log(dataList);
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
            FlashService.Error(err);
          });
      }
      Promise.all(promArr).then(() => {
        $log.log(resultData);
      });
    }
  }
}());
