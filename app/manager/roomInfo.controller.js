
(function () {
  angular
    .module('app')
    .controller('RoomInfo.ManagerController', Controller);

  function Controller(UserService, RoomService, FlashService, RoomDataService, $stateParams, $scope) {
    initController();
    const vm = this;
    vm.user = null;
    const { roomId: roomId } = $stateParams;
    let total = 0;
    const data = [];
    const now = +new Date();
    const period = 3000;
    const delay = 10000;
    const start = now - period;
    const oneMinute = 60 * 1000;
    const oneHour = 60 * oneMinute;
    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    console.log('Today is');
    console.log(today.toLocaleString());
    initCount();
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
        // boundaryGap: [0, '100%'],
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

    let histoX = [];
    let inData = [];
    let outData = [];
    let totalData = [];
    const promArr = [];
    for (let i = 8; i < 18; i++) {
      histoX.push(`${i}:00 - ${i + 1}:00`);
      const zeroTime = Date.parse(today);
      console.log(`Start time is ${new Date(zeroTime + i * oneHour)}`);
      console.log(`End time is ${new Date(zeroTime + (i + 1) * oneHour)}`);
      promArr[i - 8] = RoomDataService.GetByTimeRange(roomId, zeroTime + i * oneHour, zeroTime + (i + 1) * oneHour)
        .then((dataList) => {
          let inSum = 0,
            outSum = 0;
          console.log('Data list is');
          console.log(dataList);
          $.each(dataList, (index, element) => {
            inSum += element.In;
            outSum += element.Out;
          });
          inData[i - 8] = inSum;
          outData[i - 8] = outSum;
          totalData[i - 8] = inSum - outSum;
        })
        .catch((err) => {
          console.log(err);
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

    const realTime = echarts.init(document.getElementById('real-time'));
    realTime.setOption(realTimeOption);
    const history = echarts.init(document.getElementById('history'));
    Promise.all(promArr).then((val) => {
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
    const interval = setInterval(updateRealTime, period);
    $scope.$on('$destroy', () => {
      // Make sure that the interval is destroyed too
      clearInterval(interval);
    });

    function updateRealTime() {
      // console.log(start);
      const curTime = Date.now();
      RoomDataService.GetByTimeRange(roomId, curTime - period - delay, curTime - delay)
        .then((dataList) => {
          console.log(dataList);
          $.each(dataList, (index, element) => {
            total = total + element.In - element.Out;
          });
        })
        .catch((err) => {
          FlashService.Error(err);
        });
      data.push({
        name: new Date(curTime - delay).toString(),
        // value: [now.toLocaleTimeString('en-GB'),total]
        value: [new Date(curTime - delay), total],
      });
      $('#totalPeople').text(total.toString());
      realTime.setOption({
        series: [{
          data,
        }],
      });
      console.log(data);
    }

    function initController() {
      UserService.GetCurrent().then((user) => {
        vm.user = user;
      });
    }

    function initCount() {
      RoomDataService.GetByTimeRange(roomId, Date.parse(today), now - period)
        .then((dataList) => {
          console.log('Init data list');
          console.log(dataList);
          $.each(dataList, (index, element) => {
            total = total + element.In - element.Out;
          });
          console.log(`Init count is ${total}`);
        })
        .catch((err) => {
          FlashService.Error(err);
        });
    }
  }
}());
