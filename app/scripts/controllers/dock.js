'use strict';

/**
 * @ngdoc function
 * @name kanColleViewerMomiApp.controller:DockCtrl
 * @description
 * # DockCtrl
 * Controller of the kanColleViewerMomiApp
 */
angular.module('kanColleViewerMomiApp')
  .controller('DockCtrl', function ($sce, $scope, $routeParams, WebSocket, ShipMap, SharedObject) {
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

      SharedObject.hook("port", function () { renderDock(); });
      renderDock();

      function renderDock () {
          if (SharedObject.portJson == null) { return; }
          var dockId = $routeParams.dockId;
          var dock = SharedObject.portJson.api_data.api_deck_port[dockId];

          var girls = [];
          dock.api_ship.forEach(function (shipNo) {
              var individualFleetData = ShipMap.getFleetFromPort(shipNo);
              var herData = generateFleetObjectFromAPIFleet(individualFleetData);
              if (herData !== undefined) {girls.push(herData);}
          });

          $scope.dockId = dockId;
          $scope.girls = girls;
          $scope.dockName = dock.api_name;

          $scope.isOnFix = false;
          girls.forEach(function (her) {if (her.isOnFix) $scope.isOnFix = true;});

          $scope.isOnMission = SharedObject.portJson.api_data.api_deck_port[dockId].api_mission[0] == 1;

          drawStatusRadar(girls, 0);

          $scope.$apply();
      }

      function drawStatusRadar(girls) {
          var i_fleet = 0;
          var fleetRadarColor = [
              "rgba(77,77,77,0.05)",
              "rgba(93,165,218,0.05)",
              "rgba(250,164,58,0.05)",
              "rgba(96,189,104,0.05)",
              "rgba(222,207,63,0.05)",
              "rgba(241,88,84,0.05)"
          ];
          var fleetRadarColorOpaque = [
              "rgba(77,77,77,1)",
              "rgba(93,165,218,1)",
              "rgba(250,164,58,1)",
              "rgba(96,189,104,1)",
              "rgba(222,207,63,1)",
              "rgba(241,88,84,1)"
          ];

          var dataSets = [];
          girls.forEach(function (her) {
              var label = her.name;
              var data = [her.maxHp, her.karyoku[0], her.soukou[0], her.raisou[0], her.kaihi[0], her.taiku[0], her.taisen[0], her.sakuteki[0]];
              dataSets.push({
                  label: label,
                  fillColor: fleetRadarColor[i_fleet],
                  strokeColor: fleetRadarColorOpaque[i_fleet],
                  pointColor: fleetRadarColorOpaque[i_fleet],
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(220,220,220,1)",
                  data: data
              });
              i_fleet++;
          });
          var data = {labels: ["耐久", "火力", "装甲", "雷装", "回避", "対空", "対潜", "索敵"], datasets: dataSets};
          var statusChartCtx = $("#status-chart").get(0).getContext("2d");
          var statusChart = new Chart(statusChartCtx).Radar(data, {
              scaleShowLabels: true,
              pointLabelFontSize : 15,
              legendTemplate : "<% for (var i=0; i<datasets.length; i++){%><span class=\"label\" style=\"background-color:<%=datasets[i].strokeColor%>\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span><%}%>"
          });
          $scope.statusChartLegend = $sce.trustAsHtml(statusChart.generateLegend());
      }

      function generateFleetObjectFromAPIFleet (her) {
          if (her === undefined) { return undefined; }

          var herData = new Object();

          herData.hp = her.api_nowhp;
          herData.maxHp = her.api_maxhp;
          herData.hpPercent = Math.round(her.api_nowhp / her.api_maxhp * 100);
          herData.id = her.api_id;
          herData.shipId = her.api_ship_id;
          herData.lv = her.api_lv;

          herData.karyoku = her.api_karyoku;
          herData.soukou = her.api_soukou;
          herData.raisou = her.api_raisou;
          herData.kaihi = her.api_kaihi;
          herData.taiku = her.api_taiku;
          herData.taisen = her.api_taisen;
          herData.sakuteki = her.api_sakuteki;
          herData.un = her.api_lucky;

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
