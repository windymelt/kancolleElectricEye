'use strict';

/**
 * @ngdoc function
 * @name kanColleViewerMomiApp.controller:GirlsCtrl
 * @description
 * # GirlsCtrl
 * Controller of the kanColleViewerMomiApp
 */
angular.module('kanColleViewerMomiApp')
  .controller('GirlsCtrl', function ($scope, WebSocket, SharedObject, ShipMap, Fleet) {
      $scope.sort = {
          column: "d",
          descending: true
      };

      $scope.head = {
          a: "ID",
          b: "艦種",
          c: "艦名",
          d: "LV.",
          e: "Cond.",
          f: "HP",
          g: "火力",
          h: "雷装",
          i: "対空",
          j: "装甲",
          k: "運",
          l: "索敵",
          m: "制空"
      };

      $scope.changeSorting = function(column) {
          var sort = $scope.sort;
          if (sort.column == column) {
              sort.descending = !sort.descending;
          } else {
              sort.column = column;
              sort.descending = true;
          }
      };

      $scope.selectedCls = function(column) {
          return column == $scope.sort.column && "active";
    };

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

      SharedObject.hook("port", function () { renderGirls(); });
      SharedObject.hook("slot_item", function () { renderGirls(); });
      renderGirls();

      function renderGirls () {
          if (SharedObject.portJson == null) { return; }
          var girls = [];
          SharedObject.portJson.api_data.api_ship.forEach(function (girlApi) {
              var girl = Fleet.generateFleetObjectFromAPIFleet(girlApi);
              girls.push({
                  a: girl.id,
                  b: ShipMap.getShipTypeNameFromId(ShipMap.fetchShipStatus(girlApi.api_ship_id).api_stype),
                  c: girl.name,
                  d: girl.lv,
                  e: girl.cond,
                  f: girl.hp,
                  g: girl.karyoku[0],
                  h: girl.raisou[0],
                  i: girl.taiku[0],
                  j: girl.soukou[0],
                  k: girl.un[0],
                  l: girl.sakuteki[0],
                  m: Fleet.calculateAirSperiorityIndex(girl.id)
              });
          });
          $scope.body = girls;
          $scope.$apply();
      }
  });
