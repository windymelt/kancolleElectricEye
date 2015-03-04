'use strict';

/**
 * @ngdoc function
 * @name kanColleViewerMomiApp.controller:DockCtrl
 * @description
 * # DockCtrl
 * Controller of the kanColleViewerMomiApp
 */
angular.module('kanColleViewerMomiApp')
  .controller('DockCtrl', function ($sce, $scope, $routeParams, WebSocket, ShipMap, SharedObject, Fleet) {
      $scope.hpUnit = 1; // 1: abstruct, -1: percent
      $scope.chartMode = 1; // 1: each, -1: sum

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
              var herData = Fleet.generateFleetObjectFromAPIFleet(individualFleetData);
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
          var sumRadarColor = "rgba(241,124,176,1)";

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

          var data;
          var labels = ["耐久", "火力", "装甲", "雷装", "回避", "対空", "対潜", "索敵"];
          if ($scope.chartMode == 1) { // 各艦娘のグラフを重ねて描写するとき
              data = {labels: labels, datasets: dataSets};
          } else if ($scope.chartMode == -1) { // 合計グラフを描写するとき
              var sumData = [0, 0, 0, 0, 0, 0, 0, 0];
              // 全ての当該艦隊に所属する艦娘に対して
              dataSets.forEach(function (girl) {
                  var i_label = 0;
                  // 能力ごとの合計値を求める
                  labels.forEach(function (label) {
                      console.log(label + " of " + girl.label + " is " + girl.data[i_label]);
                      sumData[i_label] += girl.data[i_label];
                      i_label++;
                  });
              });
              // 合計データセットを作成する
              var sumDataSet = [{
                  label: "合計",
                  fillColor: sumRadarColor,
                  strokeColor: fleetRadarColorOpaque[i_fleet],
                  pointColor: fleetRadarColorOpaque[i_fleet],
                  pointStrokeColor: "#fff",
                  pointHighlightFill: "#fff",
                  pointHighlightStroke: "rgba(220,220,220,1)",
                  data: sumData
              }];
              data = {labels: labels, datasets: sumDataSet};
          }

          var statusChartCtx = $("#status-chart").get(0).getContext("2d");
          var statusChart = new Chart(statusChartCtx).Radar(data, {
              scaleShowLabels: true,
              pointLabelFontSize : 15,
              legendTemplate : "<% for (var i=0; i<datasets.length; i++){%><span class=\"label\" style=\"background-color:<%=datasets[i].strokeColor%>\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span><%}%>"
          });
          $scope.statusChartLegend = $sce.trustAsHtml(statusChart.generateLegend());
      }

      $scope.invertChartMode = function () {
          $scope.chartMode = -$scope.chartMode;
          console.log("Now, chartMode:" + $scope.chartMode);
          drawStatusRadar($scope.girls);
      };
  });
