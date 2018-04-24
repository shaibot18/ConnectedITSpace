angular
  .module('app')
  .directive('mapSearch', () => ({
    restrict: 'E',
    templateUrl: 'manager/map-search.directive.html',
    link,
    scope: {
      result: '='
    }
  }));

function link(scope, ele) {
  const result = {};
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZXZzY2hlbiIsImEiOiJjamM1c3d2Z2owcndrMnF0OGJ3b3o1MWkyIn0.oDhmygyuNxXmvq2CqIDFIw';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v10',
    center: [121.355249, 31.230112],
    maxZoom: 10,
    zoom: 7,
    minZoom: 3
  });
  map.addControl(new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true
  }));
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
  });
  map.addControl(geocoder, 'top-left');
  map.on('load', () => {
    geocoder.on('result', (ev) => {
      result.place_name = ev.result.place_name;
      result.coordinates = ev.result.geometry.coordinates;
    });
  });
  scope.updateInput = () => {
    scope.result = result;
    $('#map-modal').modal('hide');
  };
  $('#map-modal').on('shown.bs.modal', (ev) => {
    map.resize();
  });
  document.getElementById('map-search-input')
    .addEventListener('focus', () => {
      scope.result = {};
      $('#map-modal').modal('show');
    });
}
