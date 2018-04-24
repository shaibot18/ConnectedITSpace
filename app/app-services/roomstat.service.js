angular
  .module('app')
  .factory('RoomStatService', RoomStatService);

function RoomStatService($http, $q) {
  const roomStatService = {};
  roomStatService.obtainStats = obtainStats;
  // roomStatService.GetAllStats = getAllStats;
  // roomStatService.GetAllStatsById = getAllStatsById;
  // roomStatService.GetAllStatsByRange = getAllStatsByRange;

  return roomStatService;

  function obtainStats(data) {
    return $http.post('/api/roomstat/', data).then(handleSuccess, handleError);
  }

  // function getAllStats() {
  //   return $http.get('/api/roomstat').then(handleSuccess, handleError);
  // }

  // function getAllStatsById(_roomId) {
  //   return $http.get(`/api/roomstat/${_roomId}`).then(handleSuccess, handleError);
  // }

  // function getAllStatsByRange(_roomId, start, end = Date.now()) {
  //   return $http.get(`/api/roomstat/${_roomId}/period?startTime=${start}&endTime=${end}`, { timeout: 3000 }).then(handleSuccess, handleError);
  // }

  function handleSuccess(res) {
    return res.data;
  }
  function handleError(res) {
    return $q.reject(res.data);
  }
}
