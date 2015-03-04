'use strict';

/**
 * @ngdoc function
 * @name kanColleViewerMomiApp.controller:PortctrlCtrl
 * @description
 * # PortctrlCtrl
 * Controller of the kanColleViewerMomiApp
 */
angular.module('kanColleViewerMomiApp')
  .controller('PortCtrl', function ($scope, $route, WebSocket, ShipMap, SharedObject, Fleet) {
      if (SharedObject.api_start2Json == null) { $scope.needReload = true; }
      $scope.teitokuName = "Momiji";
      $scope.logs = [];
      $scope.docks = [];

      $scope.hpUnit = 1; // 1: abstruct, -1: percent

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

      SharedObject.hook("port", function () { renderPort(); });
      renderPort();

      function renderPort () {
          if (SharedObject.portJson == null) { return; }

          $scope.teitokuName = getTeitokuName(SharedObject.portJson);
          $scope.logs = generateLogArray(SharedObject.portJson);
          $scope.docks = generateDockArray(SharedObject.portJson);
          $scope.fleetsFixDockCount = ShipMap.countFleetsOnFix();

          $scope.$apply();
      }

      function getTeitokuName (portJson) {
          return portJson.api_data.api_basic.api_nickname;
      }

      function generateLogArray (portJson) {
          var logArray = [];
          portJson.api_data.api_log.forEach(function (log) {
              console.log("log: " + log.api_message);
              var logObj = new Object();
              logObj.id = log.api_no;
              logObj.message = log.api_message;
              logArray.push(logObj);
          });

          return logArray;
      }

      function generateDockArray (portJson) {
          var docks = [];
          var dockCount = 0;
          portJson.api_data.api_deck_port.forEach(function (dock) {
              var dockObj = new Object();
              dockObj.id = dockCount;
              dockObj.name = dock.api_name;

              var girls = [];
              dock.api_ship.forEach(function (shipNo) {
                  var individualFleetData = ShipMap.getFleetFromPort(shipNo);
                  var herData = Fleet.generateFleetObjectFromAPIFleet(individualFleetData);
                  if (herData !== undefined) {girls.push(herData);}
              });
              dockObj.ships = girls;

              dockObj.isOnFix = false;
              dockObj.ships.forEach(function (her) {if (her.isOnFix) dockObj.isOnFix = true;});

              dockObj.isOnMission = SharedObject.portJson.api_data.api_deck_port[dockCount].api_mission[0] == 1;
              docks.push(dockObj);
              dockCount++;
          });

          return docks;
      }
  });
