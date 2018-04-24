angular.module('app.directive', [])
  .directive('dateRangeSelector', Directive);
function Directive() {
  return {
    templateUrl: 'date-range-selector.html',
  };
}
