!function(e){var r={};function a(o){if(r[o])return r[o].exports;var t=r[o]={i:o,l:!1,exports:{}};return e[o].call(t.exports,t,t.exports,a),t.l=!0,t.exports}a.m=e,a.c=r,a.d=function(e,r,o){a.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:o})},a.r=function(e){Object.defineProperty(e,"__esModule",{value:!0})},a.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(r,"a",r),r},a.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},a.p="",a(a.s=0)}([function(e,r){angular.module("app.directive",[]),angular.module("app",["ui.router","app.directive"]).config(function(e,r){r.otherwise("/"),1==window.user.role?(r.when("/","/admin"),e.state("editManager",{url:"/admin/editManager",templateUrl:"admin/editManager.html",controller:"EditManager.AdminController",controllerAs:"vm",data:{activeTab:"new"}}).state("home",{url:"/admin",templateUrl:"admin/index.html",controller:"Index.AdminController",controllerAs:"vm",data:{activeTab:"home"}}).state("addManager",{url:"/admin/addManager",templateUrl:"admin/addManager.html",controller:"AddManager.AdminController",controllerAs:"vm",data:{activeTab:"addManager"}}).state("userManagement",{url:"/admin/userManagement",templateUrl:"admin/userManagement.html",controller:"UserManagement.AdminController",controllerAs:"vm",data:{activeTab:"userManagement"}})):2==window.user.role&&(r.when("/","/manager"),e.state("home",{url:"/manager",templateUrl:"manager/index.html",controller:"Index.ManagerController",controllerAs:"vm",data:{activeTab:"home"}}).state("roomInfo",{url:"/manager/roomInfo/:roomId",templateUrl:"manager/roomInfo.html",controller:"RoomInfo.ManagerController",data:{activeTab:"roomInfo"}}).state("addRoom",{url:"/manager/addRoom",templateUrl:"manager/addRoom.html",controller:"AddRoom.ManagerController",controllerAs:"vm"}).state("editRoom",{url:"/manager/editRoom/:roomId",templateUrl:"manager/editRoom.html",controller:"EditRoom.ManagerController",controllerAs:"vm",data:{activeTab:"roomInfo"}}))}).run(function(e,r,a){console.log("Run function run"),e.defaults.headers.common.Authorization=`Bearer ${a.jwtToken}`,r.$on("$stateChangeSuccess",(e,a,o,t,n)=>{r.activeTab=a.data.activeTab}),e.user=a.user,r.user=a.user}),$(()=>{console.log("Manual function run"),$.get("/app/user",e=>{window.user=e,console.log("window.user is "),console.log(e),$("#userName").html(e.firstName)}),$.get("/app/token",e=>{window.jwtToken=e,angular.bootstrap(document,["app"])})})}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC5qcyJdLCJuYW1lcyI6WyJpbnN0YWxsZWRNb2R1bGVzIiwiX193ZWJwYWNrX3JlcXVpcmVfXyIsIm1vZHVsZUlkIiwiZXhwb3J0cyIsIm1vZHVsZSIsImkiLCJsIiwibW9kdWxlcyIsImNhbGwiLCJtIiwiYyIsImQiLCJuYW1lIiwiZ2V0dGVyIiwibyIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsImdldCIsInIiLCJ2YWx1ZSIsIm4iLCJfX2VzTW9kdWxlIiwib2JqZWN0IiwicHJvcGVydHkiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsInAiLCJzIiwiYW5ndWxhciIsImNvbmZpZyIsIiRzdGF0ZVByb3ZpZGVyIiwiJHVybFJvdXRlclByb3ZpZGVyIiwib3RoZXJ3aXNlIiwid2luZG93IiwidXNlciIsInJvbGUiLCJ3aGVuIiwic3RhdGUiLCJ1cmwiLCJ0ZW1wbGF0ZVVybCIsImNvbnRyb2xsZXIiLCJjb250cm9sbGVyQXMiLCJkYXRhIiwiYWN0aXZlVGFiIiwicnVuIiwiJGh0dHAiLCIkcm9vdFNjb3BlIiwiJHdpbmRvdyIsImNvbnNvbGUiLCJsb2ciLCJkZWZhdWx0cyIsImhlYWRlcnMiLCJjb21tb24iLCJBdXRob3JpemF0aW9uIiwiand0VG9rZW4iLCIkb24iLCJldmVudCIsInRvU3RhdGUiLCJ0b1BhcmFtcyIsImZyb21TdGF0ZSIsImZyb21QYXJhbXMiLCIkIiwiaHRtbCIsImZpcnN0TmFtZSIsInRva2VuIiwiYm9vdHN0cmFwIiwiZG9jdW1lbnQiXSwibWFwcGluZ3MiOiJhQUNBLElBQUFBLEtBR0EsU0FBQUMsRUFBQUMsR0FHQSxHQUFBRixFQUFBRSxHQUNBLE9BQUFGLEVBQUFFLEdBQUFDLFFBR0EsSUFBQUMsRUFBQUosRUFBQUUsSUFDQUcsRUFBQUgsRUFDQUksR0FBQSxFQUNBSCxZQVVBLE9BTkFJLEVBQUFMLEdBQUFNLEtBQUFKLEVBQUFELFFBQUFDLElBQUFELFFBQUFGLEdBR0FHLEVBQUFFLEdBQUEsRUFHQUYsRUFBQUQsUUFLQUYsRUFBQVEsRUFBQUYsRUFHQU4sRUFBQVMsRUFBQVYsRUFHQUMsRUFBQVUsRUFBQSxTQUFBUixFQUFBUyxFQUFBQyxHQUNBWixFQUFBYSxFQUFBWCxFQUFBUyxJQUNBRyxPQUFBQyxlQUFBYixFQUFBUyxHQUNBSyxjQUFBLEVBQ0FDLFlBQUEsRUFDQUMsSUFBQU4sS0FNQVosRUFBQW1CLEVBQUEsU0FBQWpCLEdBQ0FZLE9BQUFDLGVBQUFiLEVBQUEsY0FBaURrQixPQUFBLEtBSWpEcEIsRUFBQXFCLEVBQUEsU0FBQWxCLEdBQ0EsSUFBQVMsRUFBQVQsS0FBQW1CLFdBQ0EsV0FBMkIsT0FBQW5CLEVBQUEsU0FDM0IsV0FBaUMsT0FBQUEsR0FFakMsT0FEQUgsRUFBQVUsRUFBQUUsRUFBQSxJQUFBQSxHQUNBQSxHQUlBWixFQUFBYSxFQUFBLFNBQUFVLEVBQUFDLEdBQXNELE9BQUFWLE9BQUFXLFVBQUFDLGVBQUFuQixLQUFBZ0IsRUFBQUMsSUFHdER4QixFQUFBMkIsRUFBQSxHQUlBM0IsSUFBQTRCLEVBQUEsbUJDL0RBQyxRQUFBMUIsT0FBQSxvQkFDQTBCLFFBQUExQixPQUFBLHFDQUNBMkIsT0FHQSxTQUFBQyxFQUFBQyxHQUVBQSxFQUFBQyxVQUFBLEtBQ0EsR0FBQUMsT0FBQUMsS0FBQUMsTUFDQUosRUFBQUssS0FBQSxjQUNBTixFQUNBTyxNQUFBLGVBQ0FDLElBQUEscUJBQ0FDLFlBQUEseUJBQ0FDLFdBQUEsOEJBQ0FDLGFBQUEsS0FDQUMsTUFDQUMsVUFBQSxTQUdBTixNQUFBLFFBQ0FDLElBQUEsU0FDQUMsWUFBQSxtQkFDQUMsV0FBQSx3QkFDQUMsYUFBQSxLQUNBQyxNQUNBQyxVQUFBLFVBR0FOLE1BQUEsY0FDQUMsSUFBQSxvQkFDQUMsWUFBQSx3QkFDQUMsV0FBQSw2QkFDQUMsYUFBQSxLQUNBQyxNQUNBQyxVQUFBLGdCQUdBTixNQUFBLGtCQUNBQyxJQUFBLHdCQUNBQyxZQUFBLDRCQUNBQyxXQUFBLGlDQUNBQyxhQUFBLEtBQ0FDLE1BQ0FDLFVBQUEscUJBR0csR0FBQVYsT0FBQUMsS0FBQUMsT0FDSEosRUFBQUssS0FBQSxnQkFDQU4sRUFDQU8sTUFBQSxRQUNBQyxJQUFBLFdBQ0FDLFlBQUEscUJBQ0FDLFdBQUEsMEJBQ0FDLGFBQUEsS0FDQUMsTUFDQUMsVUFBQSxVQUdBTixNQUFBLFlBQ0FDLElBQUEsNEJBQ0FDLFlBQUEsd0JBQ0FDLFdBQUEsNkJBQ0FFLE1BQ0FDLFVBQUEsY0FHQU4sTUFBQSxXQUNBQyxJQUFBLG1CQUNBQyxZQUFBLHVCQUNBQyxXQUFBLDRCQUNBQyxhQUFBLE9BRUFKLE1BQUEsWUFDQUMsSUFBQSw0QkFDQUMsWUFBQSx3QkFDQUMsV0FBQSw2QkFDQUMsYUFBQSxLQUNBQyxNQUNBQyxVQUFBLGlCQTVFQUMsSUFrRkEsU0FBQUMsRUFBQUMsRUFBQUMsR0FFQUMsUUFBQUMsSUFBQSxvQkFDQUosRUFBQUssU0FBQUMsUUFBQUMsT0FBQUMsd0JBQTBETixFQUFBTyxXQUUxRFIsRUFBQVMsSUFBQSx1QkFBQUMsRUFBQUMsRUFBQUMsRUFBQUMsRUFBQUMsS0FDQWQsRUFBQUgsVUFBQWMsRUFBQWYsS0FBQUMsWUFFQUUsRUFBQVgsS0FBQWEsRUFBQWIsS0FDQVksRUFBQVosS0FBQWEsRUFBQWIsT0FJQTJCLEVBQUEsS0FFQWIsUUFBQUMsSUFBQSx1QkFDQVksRUFBQTVDLElBQUEsWUFBQWlCLElBQ0FELE9BQUFDLE9BQ0FjLFFBQUFDLElBQUEsbUJBQ0FELFFBQUFDLElBQUFmLEdBQ0EyQixFQUFBLGFBQUFDLEtBQUE1QixFQUFBNkIsYUFFQUYsRUFBQTVDLElBQUEsYUFBQStDLElBQ0EvQixPQUFBcUIsU0FBQVUsRUFDQXBDLFFBQUFxQyxVQUFBQyxVQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuIiwiLy8gaW1wb3J0IGFuZ3VsYXIgZnJvbSAnYW5ndWxhcic7XG4vLyBpbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudCc7XG4vLyBpbXBvcnQgJy4vYXBwLWNvbnRlbnQvYXBwLmNzcyc7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHAuZGlyZWN0aXZlJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyJywgJ2FwcC5kaXJlY3RpdmUnXSlcbiAgLmNvbmZpZyhjb25maWcpXG4gIC5ydW4ocnVuKTtcblxuZnVuY3Rpb24gY29uZmlnKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgLy8gZGVmYXVsdCByb3V0ZVxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gIGlmICh3aW5kb3cudXNlci5yb2xlID09IDEpIHtcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignLycsICcvYWRtaW4nKTtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdlZGl0TWFuYWdlcicsIHtcbiAgICAgICAgdXJsOiAnL2FkbWluL2VkaXRNYW5hZ2VyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdhZG1pbi9lZGl0TWFuYWdlci5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0VkaXRNYW5hZ2VyLkFkbWluQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGFjdGl2ZVRhYjogJ25ldydcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnYWRtaW4vaW5kZXguaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRleC5BZG1pbkNvbnRyb2xsZXInLFxuICAgICAgICBjb250cm9sbGVyQXM6ICd2bScsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBhY3RpdmVUYWI6ICdob21lJ1xuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnYWRkTWFuYWdlcicsIHtcbiAgICAgICAgdXJsOiAnL2FkbWluL2FkZE1hbmFnZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2FkbWluL2FkZE1hbmFnZXIuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBZGRNYW5hZ2VyLkFkbWluQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGFjdGl2ZVRhYjogJ2FkZE1hbmFnZXInXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCd1c2VyTWFuYWdlbWVudCcsIHtcbiAgICAgICAgdXJsOiAnL2FkbWluL3VzZXJNYW5hZ2VtZW50JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdhZG1pbi91c2VyTWFuYWdlbWVudC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1VzZXJNYW5hZ2VtZW50LkFkbWluQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGFjdGl2ZVRhYjogJ3VzZXJNYW5hZ2VtZW50J1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gIH0gZWxzZSBpZiAod2luZG93LnVzZXIucm9sZSA9PSAyKSB7XG4gICAgJHVybFJvdXRlclByb3ZpZGVyLndoZW4oJy8nLCAnL21hbmFnZXInKTtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdob21lJywge1xuICAgICAgICB1cmw6ICcvbWFuYWdlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbWFuYWdlci9pbmRleC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0luZGV4Lk1hbmFnZXJDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgYWN0aXZlVGFiOiAnaG9tZSdcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ3Jvb21JbmZvJywge1xuICAgICAgICB1cmw6ICcvbWFuYWdlci9yb29tSW5mby86cm9vbUlkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdtYW5hZ2VyL3Jvb21JbmZvLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbUluZm8uTWFuYWdlckNvbnRyb2xsZXInLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgYWN0aXZlVGFiOiAncm9vbUluZm8nXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdhZGRSb29tJywge1xuICAgICAgICB1cmw6ICcvbWFuYWdlci9hZGRSb29tJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdtYW5hZ2VyL2FkZFJvb20uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBZGRSb29tLk1hbmFnZXJDb250cm9sbGVyJyxcbiAgICAgICAgY29udHJvbGxlckFzOiAndm0nLFxuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnZWRpdFJvb20nLCB7XG4gICAgICAgIHVybDogJy9tYW5hZ2VyL2VkaXRSb29tLzpyb29tSWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ21hbmFnZXIvZWRpdFJvb20uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdFZGl0Um9vbS5NYW5hZ2VyQ29udHJvbGxlcicsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ3ZtJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIGFjdGl2ZVRhYjogJ3Jvb21JbmZvJ1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcnVuKCRodHRwLCAkcm9vdFNjb3BlLCAkd2luZG93KSB7XG4gIC8vIGFkZCBKV1QgdG9rZW4gYXMgZGVmYXVsdCBhdXRoIGhlYWRlclxuICBjb25zb2xlLmxvZygnUnVuIGZ1bmN0aW9uIHJ1bicpO1xuICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbi5BdXRob3JpemF0aW9uID0gYEJlYXJlciAkeyR3aW5kb3cuand0VG9rZW59YDtcbiAgLy8gdXBkYXRlIGFjdGl2ZSB0YWIgb24gc3RhdGUgY2hhbmdlXG4gICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlLCBmcm9tUGFyYW1zKSA9PiB7XG4gICAgJHJvb3RTY29wZS5hY3RpdmVUYWIgPSB0b1N0YXRlLmRhdGEuYWN0aXZlVGFiO1xuICB9KTtcbiAgJGh0dHAudXNlciA9ICR3aW5kb3cudXNlcjtcbiAgJHJvb3RTY29wZS51c2VyID0gJHdpbmRvdy51c2VyO1xufVxuXG4vLyBtYW51YWxseSBib290c3RyYXAgYW5ndWxhciBhZnRlciB0aGUgSldUIHRva2VuIGlzIHJldHJpZXZlZCBmcm9tIHRoZSBzZXJ2ZXJcbiQoKCkgPT4ge1xuICAvLyBnZXQgSldUIHRva2VuIGZyb20gc2VydmVyXG4gIGNvbnNvbGUubG9nKCdNYW51YWwgZnVuY3Rpb24gcnVuJyk7XG4gICQuZ2V0KCcvYXBwL3VzZXInLCAodXNlcikgPT4ge1xuICAgIHdpbmRvdy51c2VyID0gdXNlcjtcbiAgICBjb25zb2xlLmxvZygnd2luZG93LnVzZXIgaXMgJyk7XG4gICAgY29uc29sZS5sb2codXNlcik7XG4gICAgJCgnI3VzZXJOYW1lJykuaHRtbCh1c2VyLmZpcnN0TmFtZSk7XG4gIH0pO1xuICAkLmdldCgnL2FwcC90b2tlbicsICh0b2tlbikgPT4ge1xuICAgIHdpbmRvdy5qd3RUb2tlbiA9IHRva2VuO1xuICAgIGFuZ3VsYXIuYm9vdHN0cmFwKGRvY3VtZW50LCBbJ2FwcCddKTtcbiAgfSk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiIn0=