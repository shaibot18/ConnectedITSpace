
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
        var period = 1000;
        
        var total = 0;
        initCount();
        var now = +new Date();


        var data = [];
        // data.push({
        //     name: new Date(now - period).toString(),
        //     value: total
        // });
        var oneMinute = 60*1000;
        var oneDay = 24 * 3600 * 1000;
        // var value = Math.random() * 1000;
        
        // for (var i = 0; i < 1000; i++) {
        //     data.push(randomData());
        // }


        var option1 = {
            // title: {
            //     text: '动态数据 + 时间坐标轴'
            // },
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

        var histoX = [];
        for (var i = 8; i <= 17; i++){
            histoX.push(i + ':00 - ' + (i+1) +':00');
        }

        var inData =  [32, 32, 31, 34, 30, 45, 42, 24, 26, 10];
        var outData = [-20, -23, -10, -33, -40, -43, -27, -36, -33, -30];
        // var totalData = inData.map(function(val,index){
        //     return val + outData[index]
        // }); 
        var totalData = [12,21,42,43,33,35,50,38,31,11];


        var histogramOption = {
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

        var myChart = echarts.init(document.getElementById('graph_area'));
        var histogram = echarts.init(document.getElementById('histogram'));
        myChart.setOption(option1);
        histogram.setOption(histogramOption);
        var start = now - period; 

        var interval = setInterval(function () {
            console.log(start);
            RoomDataService.GetByTimeRange(roomId,start,start + period)
                .then(function(dataList){
                    console.log(dataList);
                    $.each(dataList,function(index,element){
                        if (element.Direction){
                            total = total + 1;
                        }
                        else{
                            total = total - 1;
                        }
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
            // for (var i = 0; i < 5; i++) {
            //     data.shift();
            //     data.push(randomData());
            // }

            myChart.setOption({
                series: [{
                    data: data
                }]
            });
            console.log(data);
            console.log('Total is ' + total);
        }, period);

        $scope.$on('$destroy', function() {
            // Make sure that the interval is destroyed too
            clearInterval(interval);
          });

        function randomData() {
            now = new Date(+now + oneDay);
            value = value + Math.random() * 21 - 10;
            return {
                name: now.toString(),
                value: [
                    [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'),
                    Math.round(value)
                ]
            }
        }

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }

        function initCount(){
            var today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            today.setMilliseconds(0);
            console.log('Today is');
            console.log(today.toLocaleString());
            RoomDataService.GetByTimeRange(roomId,Date.parse(today),now - period)
                .then(function(dataList){
                    console.log('Init data list');
                    console.log(dataList);
                    $.each(dataList,function(index,element){
                        if (element.Direction){
                            total = total + 1;
                        }
                        else{
                            total = total - 1;
                        }
                    });
                    console.log('Init count is ' + total);
                })
                .catch(function(err){
                    FlashService.Error(err);
                });
        }

    }
})();