(function () {
    'use strict';

    angular
        .module('app')
        .controller('Index.ManagerController', Controller);

    function Controller($scope,$compile,UserService,RoomService,FlashService,$state) {
        var vm = this;

        vm.user = null;
        initController();


        $scope.deleteRoom = function(_RoomId){
            console.log('Delete function called' + _RoomId);
            RoomService.Delete(_RoomId)
                .then(function(data){
                    $state.reload();
                })
                .catch(function(err){
                    FlashService.Error(err);
                });           
        }

        $(document).ready(function(){
            $(".middleadd2").click(
                function(){
                    if($(".triangle_display").css("display")=="none"){
                        $(".triangle_display").show();
                    }
                    else{
                        $(".triangle_display").hide();}
                    }
            );
        });


        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
                RoomService.GetRoomList(vm.user.sub).then(function (roomList) {
                    console.log(roomList);
                    $scope.roomList = roomList;
                });
            });
        }

        function renderRoomList(roomList) {
            $.each(roomList,function (index,element) {
                var $HTML = $compile($('#newRoom').html())($scope);
                $HTML.find('h3').text(element.country + ', '+ element.city + ', ' + element.building);
                // $HTML.find('.x_panel').attr('id',element._id);
                $HTML.find('.triangle_display').attr('name',element._id);
                $HTML.find('a').attr('href','#/manager/roomInfo/' + element._id);
                $('#content').prepend($HTML);
            });

            return;
        }

    }
})();