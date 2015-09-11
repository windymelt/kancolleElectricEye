'use strict';

/**
 * @ngdoc function
 * @name kanColleViewerMomiApp.controller:MissionCtrl
 * @description
 * # MissionCtrl
 * Controller of the kanColleViewerMomiApp
 */
angular.module('kanColleViewerMomiApp')
  .controller('MissionCtrl', function ($scope, $http, $interval, WebSocket, SharedObject, ShipMap, Fleet) {
            SharedObject.hook("api_start2", function () {
          $scope.needReload = false;
          console.log("Received api_start2!");
          $scope.$apply();
      });

      WebSocket.registerOpening(function () {
          $scope.proxyProblem = false;
          $scope.$apply();
      });

      WebSocket.registerClosing(function () {
          $scope.proxyProblem = true;
          $scope.$apply();
      });

      SharedObject.hook("port", function () { renderDock(); });
      renderDock();

      function renderDock () {
          console.log("render Dock");
          if (SharedObject.portJson == null) { return; }
          var api_dock = SharedObject.portJson.api_data.api_deck_port;
          var api_mission = SharedObject.api_start2Json.api_data.api_mst_mission;
          $scope.docks = [{}, {}, {}, {}];
          [0, 1, 2, 3].forEach(function (i) {
              console.log("setting completetime " + i);
              $scope.docks[i].id = i;
              $scope.docks[i].isOnMission = api_dock[i].api_mission[2] != 0;
              var area = api_dock[i].api_mission[1];
              $scope.docks[i].area = area;
              api_mission.forEach(function (x) {
                  if (x.api_id == area) {
                      $scope.docks[i].missionDescription = x.api_name;
                      $scope.docks[i].missionTime = x.api_time * 60 * 1000;
                  }
              });
              $scope.docks[i].completeTime = api_dock[i].api_mission[2];
          });
          $interval(function () {
              var now = new Date();
              [0, 1, 2, 3].forEach(function (i) {
                  if($scope.docks[i].isOnMission) {
                      $scope.docks[i].lastingTime = api_dock[i].api_mission[2] - now.getTime();
                      $scope.docks[i].progressPercentage = Math.floor(($scope.docks[i].lastingTime / $scope.docks[i].missionTime) * 1000) / 10;
                  }
              });
          }, 1000);
          $scope.reserve = function (dockId) {
              console.log("reserve " + dockId);
              var time = $scope.docks[dockId].completeTime - 60;
              var params = {
                      at: time,
                      title: "遠征",
                      description: "第" + (dockId + 1) + "艦隊が遠征から帰投しました"
              };
              console.log(params);
              $http({
                  method : 'POST',
                  url : 'http://kcl.it/settimer',
                  data: params
              }).success(function(data, status, headers, config) {
                  //成功
              }).error(function(data, status, headers, config) {
                  //失敗
});
          };
          $scope.$apply();
      }
  }).filter('msecsToTimeString', function() {
      return function(millseconds) {
          var seconds = Math.floor(millseconds / 1000);
          var days = Math.floor(seconds / 86400);
          var hours = Math.floor((seconds % 86400) / 3600);
          var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
          var timeString = '';
          if(days > 0) timeString += days + " 日 ";
          if(hours > 0) timeString += hours + " 時間 ";
          if(minutes >= 0) timeString += minutes + " 分 ";
          timeString += (seconds % 60) + " 秒";
          return timeString;
      };
  });
