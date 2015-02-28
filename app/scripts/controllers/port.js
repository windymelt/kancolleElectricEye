'use strict';

/**
 * @ngdoc function
 * @name kanColleViewerMomiApp.controller:PortctrlCtrl
 * @description
 * # PortctrlCtrl
 * Controller of the kanColleViewerMomiApp
 */
angular.module('kanColleViewerMomiApp')
  .controller('PortCtrl', function ($scope, $route, WebSocket, ShipMap, SharedObject) {
      if (SharedObject.api_start2Json == null) { $scope.needReload = true; }
      $scope.teitokuName = "Momiji";
      $scope.logs = [];
      $scope.docks = [];

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
          portJson.api_data.api_deck_port.forEach(function (dock) {
              var dockObj = new Object();
              dockObj.name = dock.api_name;

              var girls = [];
              dock.api_ship.forEach(function (shipNo) {
                  var individualFleetData = ShipMap.getFleetFromPort(shipNo);
                  var herData = generateFleetObjectFromAPIFleet(individualFleetData);
                  if (herData !== undefined) {girls.push(herData);}
              });
              dockObj.ships = girls;
              docks.push(dockObj);
          });

          return docks;
      }

      function generateFleetObjectFromAPIFleet (her) {
          if (her === undefined) { return undefined; }

          var herData = new Object();

          herData.hpPercent = her.api_nowhp / her.api_maxhp * 100;
          herData.id = her.api_id;
          herData.shipId = her.api_ship_id;
          herData.lv = her.api_lv;

          var shipStatus = ShipMap.fetchShipStatus(her.api_ship_id);
          herData.name = shipStatus.api_name;

          var maxFuel = shipStatus.api_fuel_max;
          var maxAmmo = shipStatus.api_bull_max;
          herData.needFuelSupply = her.api_fuel < maxFuel;
          herData.needAmmoSupply = her.api_bull < maxAmmo;

          herData.isOnFix = ShipMap.isOnFix(her.api_id);
          if (herData.isOnFix) {
              herData.fixTime = herData.isOnFix.api_complete_time_str;
          }

          herData.cond = her.api_cond;

          return herData;
      }
  });
