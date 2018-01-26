
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
        var period = 3000;
        var delay = 10000;
        var start = now - period;         
        var oneMinute = 60*1000;
        var oneHour = 60*oneMinute;
        var oneDay = 24 * oneHour;
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        console.log('Today is');
        console.log(today.toLocaleString());
        initCount();        
        var realTimeOption = {
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    params = params[0];
                    return params.value[0].toLocaleTimeString('en-GB') + ' : ' + params.value[1];
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

        var histoX = [], inData = [], outData = [], totalData = []; 
        var promArr = [];
        for (let i = 8; i < 18; i++){
            histoX.push(i + ':00 - ' + (i+1) +':00');
            var zeroTime = Date.parse(today);
            console.log('Start time is ' + new Date(zeroTime + i*oneHour));
            console.log('End time is ' + new Date(zeroTime + (i+1)*oneHour));                                
            promArr[i-8] = RoomDataService.GetByTimeRange(roomId,zeroTime + i*oneHour,zeroTime + (i+1)*oneHour)
                .then(function(dataList){
                    var inSum = 0, outSum = 0;                     
                    console.log('Data list is');
                    console.log(dataList);
                    $.each(dataList,function(index,element){
                        inSum = inSum + element.In; 
                        outSum = outSum + element.Out;
                    });
                    inData[i-8] = inSum;
                    outData[i-8] = outSum;
                    totalData[i-8] = inSum - outSum;
                })
                .catch(function(err){
                    console.log(err);
                    FlashService.Error(err);
                });   
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
            ]
        };

        var realTime = echarts.init(document.getElementById('real-time'))
        realTime.setOption(realTimeOption);        
        var history = echarts.init(document.getElementById('history'))
        Promise.all(promArr).then(function(val){
            history.setOption(historyOption);
            history.setOption({
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
            })
        })
        var interval = setInterval(updateRealTime, period);
        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            clearInterval(interval);
          });

        function updateRealTime() {
            // console.log(start);
            let curTime = Date.now();
            RoomDataService.GetByTimeRange(roomId,curTime - period -delay,curTime - delay)
                .then(function(dataList){
                    console.log(dataList);
                    $.each(dataList,function(index,element){
                        total = total + element.In - element.Out;
                    });
                })
                .catch(function(err){
                    FlashService.Error(err);
                });
            data.push({
                name: new Date(curTime - delay).toString(),
                // value: [now.toLocaleTimeString('en-GB'),total]
                value: [new Date(curTime -delay),total]                
            });
            $('#totalPeople').text(total.toString());
            realTime.setOption({
                series: [{
                    data: data
                }]
            });
            console.log(data);
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