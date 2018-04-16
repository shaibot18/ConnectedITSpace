angular
  .module('app')
  .factory('RoomStatService', Service);

function Service($http, $q) {
  const RoomStatService = {};
  RoomStatService.GetAllStats = GetAllStats;
  RoomStatService.GetAllStatsById = GetAllStatsById;
  RoomStatService.GetAllStatsByRange = GetAllStatsByRange;

  return RoomStatService;

  function GetAllStats() {
    return $http.get('/api/roomstat').then(handleSuccess, handleError);
  }

  function GetAllStatsById(_roomId) {
    return $http.get(`/api/roomstat/${_roomId}`).then(handleSuccess, handleError);
  }

  function GetAllStatsByRange(_roomId, start, end = Date.now()) {
    return $http.get(`/api/roomstat/${_roomId}/period?startTime=${start}&endTime=${end}`, { timeout: 3000 }).then(handleSuccess, handleError);
  }

  function handleSuccess(res) {
    return res.data;
  }
  function handleError(res) {
    return $q.reject(res.data);
  }
}
