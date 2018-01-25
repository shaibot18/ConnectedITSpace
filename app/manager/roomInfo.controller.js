
    (function () {
    'use strict';

    angular
        .module('app')
        .controller('RoomInfo.ManagerController', Controller);

    function Controller(UserService,RoomService,FlashService,RoomDataService,$stateParams,$scope) {
        initController();
        var vm = this;
        vm.user = null;
        var roomId = $stateParams.roomId;
        var total = 0;
        var data = [];
        var now = +new Date();
        initCount();
        const period = 1000;
        const oneMinute = 60*1000, oneHour = 60*oneMinute, oneDay = 24 * oneHour;
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        console.log('Today is');
        console.log(today.toLocaleString());
        var realTimeOption = {
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    params = params[0];
                    var date = new Date(params.name);
                    return now.toLocaleTimeString('en-GB') + ' : ' + params.value[1];
                },
                axisPointer: {
                    animation: false
                }
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                // boundaryGap: [0, '100%'],
                splitLine: {
                    show: false
                }
            },
            series: [{
                name: '模拟数据',
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: data
            }]
        };

        let histoX = [], inData = [], outData = []; 
        for (var i = 8; i <= 17; i++){
            histoX.push(i + ':00 - ' + (i+1) +':00');
            let inSum = 0, outSum = 0; 
            let zeroTime = Date.parse(today);
            RoomDataService.GetByTimeRange(roomId,zeroTime + i*oneHour,zeroTime + (i+1)*oneHour)
                .then(function(dataList){
                    console.log(dataList);
                    $.each(dataList,function(index,element){
                        inSum += element.In; 
                        outSum += element.Out;
                    });
                })
                .catch(function(err){
                    FlashService.Error(err);
                });
                inData[i-8] = inSum;
                outData[i-8] = outSum;
                totalData[i-8] = inSum - outSum;
        }
        
        var historyOption = {
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            legend: {
                data:['In', 'Out', 'Total']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis : [
                {
                    type : 'category',
                    axisTick : {show: false},
                    data : histoX
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : [
                {
                    name:'In',
                    type:'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true
                        }
                    },
                    data:inData
                },
                {
                    name:'Out',
                    type:'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'bottom'
                        }
                    },
                    data:outData
                },
                {
                    name:'Total',
                    type:'line',
                    data:totalData
                }
            ]
        };

        let realTime = echarts.init(document.getElementById('real-time'))
            .setOption(realTimeOption);        
        let history = echarts.init(document.getElementById('history'))
            .setOption(historyOption);
        let start = now - period; 
        let interval = setInterval(updateRealTime(), period);
        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            clearInterval(interval);
          });

        function updateRealTime() {
            console.log(start);
            RoomDataService.GetByTimeRange(roomId,start,start + period)
                .then(function(dataList){
                    console.log(dataList);
                    $.each(dataList,function(index,element){
                        total = total + element.In - element.Out;
                    });
                })
                .catch(function(err){
                    FlashService.Error(err);
                });
            now = new Date(start + period);
            data.push({
                name: now.toString(),
                // value: [now.toLocaleTimeString('en-GB'),total]
                value: [now,total]                
            });
            $('#totalPeople').text(total.toString());
            start = start + period; 
            myChart.setOption({
                series: [{
                    data: data
                }]
            });
            console.log(data);
            console.log('Total is ' + total);
        }

        function initController() {
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }

        function initCount(){
            RoomDataService.GetByTimeRange(roomId,Date.parse(today),now - period)
                .then(function(dataList){
                    console.log('Init data list');
                    console.log(dataList);
                    $.each(dataList,function(index,element){
                        total = total + element.In - element.Out;
                    });
                    console.log('Init count is ' + total);
                })
                .catch(function(err){
                    FlashService.Error(err);
                });
        }
    }
})();