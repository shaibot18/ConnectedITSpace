(function () {
  angular
    .module('app')
    .factory('RoomService', Service);

  function Service($http, $q) {
    const service = {};
    service.GetRoomList = GetRoomList;
    service.GetAll = GetAll;
    service.Create = Create;
    service.Delete = Delete;
    service.Get = Get;
    service.Update = Update;
    return service;

    function Create(room) {
      return $http.post('/api/rooms', room).then(handleSuccess, handleError);
    }

    function Get(_id) {
      return $http.get(`/api/rooms/${_id}`).then(handleSuccess, handleError);
    }

    function Update(_id, room) {
      return $http.put(`/api/rooms/${_id}`, room).then(handleSuccess, handleError);
    }

    function Delete(_id) {
      return $http.delete(`/api/rooms/${_id}`).then(handleSuccess, handleError);
    }

    function GetRoomList(_id) {
      return $http.get(`/api/rooms/roomlist/${_id}`).then(handleSuccess, handleError);
    }

    function GetAll() {
      return $http.get('/api/rooms/').then(handleSuccess, handleError);
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
