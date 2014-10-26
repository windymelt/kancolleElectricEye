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

          $scope.teitokuName = SharedObject.portJson.api_data.api_basic.api_nickname;

          $scope.logs = generateLogArray(SharedObject.portJson);

          var docks = [];
          SharedObject.portJson.api_data.api_deck_port.forEach(
              function (dock) {
                  var ships = [];
                  var dockObj = new Object();
                  dock.api_ship.forEach(
                      function (shipNo) {
                          var ship = ShipMap.getFleetFromPort(shipNo);
                          var shipData = new Object();
                          if (ship === undefined) { return; }
                          var shipStatus = ShipMap.fetchShipStatus(ship.api_ship_id);

                          shipData.hpPercent = ship.api_nowhp / ship.api_maxhp * 100;
                          shipData.id = ship.api_id;
                          shipData.shipId = ship.api_ship_id;
                          shipData.name = shipStatus.api_name;
                          shipData.lv = ship.api_lv;
                          shipData.isOnFix = ShipMap.isOnFix(ship.api_id);
                          if (shipData.isOnFix) { shipData.fixTime = shipData.isOnFix.api_complete_time_str; }

                          var maxFuel = shipStatus.api_fuel_max;
                          var maxAmmo = shipStatus.api_bull_max;
                          shipData.needFuelSupply = ship.api_fuel < maxFuel;
                          shipData.needAmmoSupply = ship.api_bull < maxAmmo;
                          ships.push(shipData);
                      });
                  dockObj.ships = ships;
                  dockObj.name = dock.api_name;
                  docks.push(dockObj);
              });
          $scope.docks = docks;

          $scope.fleetsFixDockCount = ShipMap.countFleetsOnFix();
          console.log($scope.fleetsFixDockCount + " ships are on fix.");

          $scope.$apply();
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
  });
