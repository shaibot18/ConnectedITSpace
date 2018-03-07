(function () {
  angular
    .module('app')
    .factory('RoomService', Service);

  function Service($http, $q) {
    const service = {};
    service.GetCurrent = GetCurrent;
    service.GetRoomList = GetRoomList;
    service.GetAll = GetAll;
    service.GetById = GetById;
    service.GetByUsername = GetByUsername;
    service.Create = Create;
    service.Delete = Delete;
    return service;

    function Create(room) {
      return $http.post('/api/rooms', room).then(handleSuccess, handleError);
    }

    function Delete(_id) {
      return $http.delete(`/api/rooms/${_id}`).then(handleSuccess, handleError);
    }

    function GetCurrent() {
      return $http.get('/api/users/current').then(handleSuccess, handleError);
    }

    function GetRoomList(_id) {
      return $http.get(`/api/rooms/roomlist/${_id}`).then(handleSuccess, handleError);
    }

    function GetAll() {
      return $http.get('/api/rooms/roomlist/').then(handleSuccess, handleError);
    }

    function GetById(_id) {
      return $http.get(`/api/users/${_id}`).then(handleSuccess, handleError);
    }

    function GetByUsername(username) {
      return $http.get(`/api/users/${username}`).then(handleSuccess, handleError);
    }

    // private functions

    function handleSuccess(res) {
      return res.data;
    }

    function handleError(res) {
      return $q.reject(res.data);
    }
  }
}());
