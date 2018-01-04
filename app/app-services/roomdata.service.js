(function () {
    'use strict';

    angular
        .module('app')
        .factory('RoomDataService', Service);

    function Service($http, $q) {
        var service = {};

        service.GetAll = GetAll;
        service.GetByTimeRange = GetByTimeRange;

        return service;


      
        function GetAll() {
            return $http.get('/api/roomdata').then(handleSuccess, handleError);
        }

        function GetByTimeRange(_RoomId){
            var start = arguments[1];
            var end = arguments[2] || Date.parse(Date());
            return $http.get('/api/roomdata/' + _RoomId + '?startTime=' + start + '&endTime=' + end).then(handleSuccess,handleError);
        }


        function Delete(_id) {
            return $http.delete('/api/users/' + _id).then(handleSuccess, handleError);
        }

        // private functions

        function handleSuccess(res) {
            return res.data;
        }

        function handleError(res) {
            return $q.reject(res.data);
        }
    }

})();
