(function () {
  angular
    .module('app')
    .factory('RoomDataService', Service);

  function Service($http, $q) {
    const service = {};
    service.GetAll = GetAll;
    service.GetByTimeRange = GetByTimeRange;
    service.TotalNumber = TotalNumber;
    return service;

    function GetAll() {
      return $http.get('/api/roomdata').then(handleSuccess, handleError);
    }

    function TotalNumber() {
      
    }

    function GetByTimeRange(_RoomId, start, end = Date.now()) {
      return $http.get(`/api/roomdata/${_RoomId}?startTime=${start}&endTime=${end}`, { timeout: 3000 }).then(handleSuccess, handleError);
    }

    function handleSuccess(res) {
      return res.data;
    }
    function handleError(res) {
      return $q.reject(res.data);
    }
  }
}());
