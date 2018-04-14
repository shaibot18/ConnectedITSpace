angular
  .module('app')
  .factory('RoomDataService', Service);

function Service($http, $q) {
  const RoomDataService = {};
  RoomDataService.GetAll = GetAll;
  RoomDataService.GetByTimeRange = GetByTimeRange;
  RoomDataService.UpdateAllNum = UpdateAllNum;
  RoomDataService.AdjustTimeZone = AdjustTimeZone;
  RoomDataService.RemoveDuplicates = RemoveDuplicates;
  return RoomDataService;

  function RemoveDuplicates() {
    return $http.get('/api/roomdata/remove').then(handleSuccess, handleError);
  }

  function AdjustTimeZone() {
    return $http.get('/api/roomdata/adjust').then(handleSuccess, handleError);
  }

  function UpdateAllNum(RoomId) {
    return $http.get(`/api/roomdata/allnum/${RoomId}`).then(handleSuccess, handleError);
  }

  function GetAll() {
    return $http.get('/api/roomdata').then(handleSuccess, handleError);
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
