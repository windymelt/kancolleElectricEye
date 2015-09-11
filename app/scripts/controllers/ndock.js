'use strict';

/**
 * @ngdoc function
 * @name kanColleViewerMomiApp.controller:NdockCtrl
 * @description
 * # NdockCtrl
 * Controller of the kanColleViewerMomiApp
 */
angular.module('kanColleViewerMomiApp')
  .controller('NDockCtrl', function ($scope, $http, $interval, WebSocket, SharedObject, ShipMap, Fleet) {
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

      SharedObject.hook("port", function () { renderNDock(); });
      renderNDock();

      function renderNDock () {
          if (SharedObject.portJson == null) { return; }
          var api_ndock = SharedObject.portJson.api_data.api_ndock;
          $scope.ndocks = Fleet.generateNDockObjectArrayFromAPI(api_ndock);
          console.log($scope.ndocks);
          console.log(ShipMap.getShipTypeNameFromId(47));
          [0, 1, 2, 3].forEach(function (i) {
              if ($scope.ndocks[i].status == "on dock") {$scope.ndocks[i].herName = Fleet.generateFleetObjectFromAPIFleet(ShipMap.getFleetFromPort($scope.ndocks[i].shipID)).name;}
          });
          $interval(function () {
              var now = new Date();
              [0, 1, 2, 3].forEach(function (i) {
                  $scope.ndocks[i].lastingTime = $scope.ndocks[i].completeTime - now.getTime();
              });
          }, 1000);
          $scope.reserve = function (ndockId) {
              console.log("reserve " + ndockId);
              var time = $scope.ndocks[ndockId - 1].completeTime - 60;
              var params = {
                      at: time,
                      title: "入渠",
                      description: "入渠ドック#" + ndockId + "の入渠が完了しました"
                  };
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
}
});;
