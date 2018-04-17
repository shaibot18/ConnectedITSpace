/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./app/app.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app/app.js":
/*!********************!*\
  !*** ./app/app.js ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

// import angular from 'angular';
// import moment from 'moment';
// import './app-content/app.css';

angular.module('app.directive', []);
angular.module('app', ['ui.router', 'app.directive'])
  .config(config)
  .run(run);

function config($stateProvider, $urlRouterProvider) {
  // default route
  $urlRouterProvider.otherwise('/');
  if (window.user.role == 1) {
    $urlRouterProvider.when('/', '/admin');
    $stateProvider
      .state('editManager', {
        url: '/admin/editManager',
        templateUrl: 'admin/editManager.html',
        controller: 'EditManager.AdminController',
        controllerAs: 'vm',
        data: {
          activeTab: 'new'
        },
      })
      .state('home', {
        url: '/admin',
        templateUrl: 'admin/index.html',
        controller: 'Index.AdminController',
        controllerAs: 'vm',
        data: {
          activeTab: 'home'
        },
      })
      .state('addManager', {
        url: '/admin/addManager',
        templateUrl: 'admin/addManager.html',
        controller: 'AddManager.AdminController',
        controllerAs: 'vm',
        data: {
          activeTab: 'addManager'
        },
      })
      .state('userManagement', {
        url: '/admin/userManagement',
        templateUrl: 'admin/userManagement.html',
        controller: 'UserManagement.AdminController',
        controllerAs: 'vm',
        data: {
          activeTab: 'userManagement'
        },
      });
  } else if (window.user.role == 2) {
    $urlRouterProvider.when('/', '/manager');
    $stateProvider
      .state('dbControl', {
        url: '/dbc',
        templateUrl: 'manager/dbc.html',
        controller: 'Dbc.ManagerController',
        controllerAs: 'vm',
        data: {
          activeTab: 'dbc'
        }
      })
      .state('home', {
        url: '/manager',
        templateUrl: 'manager/index.html',
        controller: 'Index.ManagerController',
        controllerAs: 'vm',
        data: {
          activeTab: 'home'
        },
      })
      .state('roomInfo', {
        url: '/manager/roomInfo/:roomId',
        templateUrl: 'manager/roomInfo.html',
        controller: 'RoomInfo.ManagerController',
        data: {
          activeTab: 'roomInfo'
        },
      })
      .state('roomStat', {
        url: '/manager/roomStat/:roomId',
        templateUrl: 'manager/roomStat.html',
        controller: 'RoomStatController',
        data: {
          activeTab: 'roomStat'
        },
      })
      .state('addRoom', {
        url: '/manager/addRoom',
        templateUrl: 'manager/addRoom.html',
        controller: 'AddRoom.ManagerController',
        controllerAs: 'vm',
      })
      .state('editRoom', {
        url: '/manager/editRoom/:roomId',
        templateUrl: 'manager/editRoom.html',
        controller: 'EditRoom.ManagerController',
        controllerAs: 'vm',
        data: {
          activeTab: 'roomInfo'
        },
      });
  }
}

function run($http, $rootScope, $window) {
  // add JWT token as default auth header
  console.log('Run function run');
  $http.defaults.headers.common.Authorization = `Bearer ${$window.jwtToken}`;
  // update active tab on state change
  $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    $rootScope.activeTab = toState.data.activeTab;
  });
  $http.user = $window.user;
  $rootScope.user = $window.user;
}

// manually bootstrap angular after the JWT token is retrieved from the server
$(() => {
  // get JWT token from server
  console.log('Manual function run');
  $.get('/app/user', (user) => {
    window.user = user;
    console.log('window.user is ');
    console.log(user);
    $('#userName').html(user.firstName);
  });
  $.get('/app/token', (token) => {
    window.jwtToken = token;
    angular.bootstrap(document, ['app']);
  });
});


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vYXBwL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7O0FDbkVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1AsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwwREFBMEQsaUJBQWlCO0FBQzNFO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9hcHAvYXBwLmpzXCIpO1xuIiwiLy8gaW1wb3J0IGFuZ3VsYXIgZnJvbSAnYW5ndWxhcic7XG4vLyBpbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCc7XG4vLyBpbXBvcnQgJy4vYXBwLWNvbnRlbnQvYXBwLmNzcyc7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHAuZGlyZWN0aXZlJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyJywgJ2FwcC5kaXJlY3RpdmUnXSlcbiAgLmNvbmZpZyhjb25maWcpXG4gIC5ydW4ocnVuKTtcblxuZnVuY3Rpb24gY29uZmlnKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgLy8gZGVmYXVsdCByb3V0ZVxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gIGlmICh3aW5kb3cudXNlci5yb2xlID09IDEpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignLycsICcvYWRtaW4nKTtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdlZGl0TWFuYWdlcicsIHtcbiAgICAgICAgdXJsOiAnL2FkbWluL2VkaXRNYW5hZ2VyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdhZG1pbi9lZGl0TWFuYWdlci5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0VkaXRNYW5hZ2VyLkFkbWluQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGFjdGl2ZVRhYjogJ25ldydcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnYWRtaW4vaW5kZXguaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRleC5BZG1pbkNvbnRyb2xsZXInLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bScsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBhY3RpdmVUYWI6ICdob21lJ1xuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnYWRkTWFuYWdlcicsIHtcbiAgICAgICAgdXJsOiAnL2FkbWluL2FkZE1hbmFnZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2FkbWluL2FkZE1hbmFnZXIuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBZGRNYW5hZ2VyLkFkbWluQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGFjdGl2ZVRhYjogJ2FkZE1hbmFnZXInXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCd1c2VyTWFuYWdlbWVudCcsIHtcbiAgICAgICAgdXJsOiAnL2FkbWluL3VzZXJNYW5hZ2VtZW50JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdhZG1pbi91c2VyTWFuYWdlbWVudC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1VzZXJNYW5hZ2VtZW50LkFkbWluQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGFjdGl2ZVRhYjogJ3VzZXJNYW5hZ2VtZW50J1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gIH0gZWxzZSBpZiAod2luZG93LnVzZXIucm9sZSA9PSAyKSB7XG4gICAgJHVybFJvdXRlclByb3ZpZGVyLndoZW4oJy8nLCAnL21hbmFnZXInKTtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdkYkNvbnRyb2wnLCB7XG4gICAgICAgIHVybDogJy9kYmMnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ21hbmFnZXIvZGJjLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnRGJjLk1hbmFnZXJDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgYWN0aXZlVGFiOiAnZGJjJ1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdob21lJywge1xuICAgICAgICB1cmw6ICcvbWFuYWdlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbWFuYWdlci9pbmRleC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0luZGV4Lk1hbmFnZXJDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgYWN0aXZlVGFiOiAnaG9tZSdcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ3Jvb21JbmZvJywge1xuICAgICAgICB1cmw6ICcvbWFuYWdlci9yb29tSW5mby86cm9vbUlkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdtYW5hZ2VyL3Jvb21JbmZvLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbUluZm8uTWFuYWdlckNvbnRyb2xsZXInLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgYWN0aXZlVGFiOiAncm9vbUluZm8nXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdyb29tU3RhdCcsIHtcbiAgICAgICAgdXJsOiAnL21hbmFnZXIvcm9vbVN0YXQvOnJvb21JZCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbWFuYWdlci9yb29tU3RhdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Jvb21TdGF0Q29udHJvbGxlcicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBhY3RpdmVUYWI6ICdyb29tU3RhdCdcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2FkZFJvb20nLCB7XG4gICAgICAgIHVybDogJy9tYW5hZ2VyL2FkZFJvb20nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ21hbmFnZXIvYWRkUm9vbS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0FkZFJvb20uTWFuYWdlckNvbnRyb2xsZXInLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bScsXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdlZGl0Um9vbScsIHtcbiAgICAgICAgdXJsOiAnL21hbmFnZXIvZWRpdFJvb20vOnJvb21JZCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbWFuYWdlci9lZGl0Um9vbS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0VkaXRSb29tLk1hbmFnZXJDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgYWN0aXZlVGFiOiAncm9vbUluZm8nXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBydW4oJGh0dHAsICRyb290U2NvcGUsICR3aW5kb3cpIHtcbiAgLy8gYWRkIEpXVCB0b2tlbiBhcyBkZWZhdWx0IGF1dGggaGVhZGVyXG4gIGNvbnNvbGUubG9nKCdSdW4gZnVuY3Rpb24gcnVuJyk7XG4gICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uLkF1dGhvcml6YXRpb24gPSBgQmVhcmVyICR7JHdpbmRvdy5qd3RUb2tlbn1gO1xuICAvLyB1cGRhdGUgYWN0aXZlIHRhYiBvbiBzdGF0ZSBjaGFuZ2VcbiAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUsIGZyb21QYXJhbXMpID0+IHtcbiAgICAkcm9vdFNjb3BlLmFjdGl2ZVRhYiA9IHRvU3RhdGUuZGF0YS5hY3RpdmVUYWI7XG4gIH0pO1xuICAkaHR0cC51c2VyID0gJHdpbmRvdy51c2VyO1xuICAkcm9vdFNjb3BlLnVzZXIgPSAkd2luZG93LnVzZXI7XG59XG5cbi8vIG1hbnVhbGx5IGJvb3RzdHJhcCBhbmd1bGFyIGFmdGVyIHRoZSBKV1QgdG9rZW4gaXMgcmV0cmlldmVkIGZyb20gdGhlIHNlcnZlclxuJCgoKSA9PiB7XG4gIC8vIGdldCBKV1QgdG9rZW4gZnJvbSBzZXJ2ZXJcbiAgY29uc29sZS5sb2coJ01hbnVhbCBmdW5jdGlvbiBydW4nKTtcbiAgJC5nZXQoJy9hcHAvdXNlcicsICh1c2VyKSA9PiB7XG4gICAgd2luZG93LnVzZXIgPSB1c2VyO1xuICAgIGNvbnNvbGUubG9nKCd3aW5kb3cudXNlciBpcyAnKTtcbiAgICBjb25zb2xlLmxvZyh1c2VyKTtcbiAgICAkKCcjdXNlck5hbWUnKS5odG1sKHVzZXIuZmlyc3ROYW1lKTtcbiAgfSk7XG4gICQuZ2V0KCcvYXBwL3Rva2VuJywgKHRva2VuKSA9PiB7XG4gICAgd2luZG93Lmp3dFRva2VuID0gdG9rZW47XG4gICAgYW5ndWxhci5ib290c3RyYXAoZG9jdW1lbnQsIFsnYXBwJ10pO1xuICB9KTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==