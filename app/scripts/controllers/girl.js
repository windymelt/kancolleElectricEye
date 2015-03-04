'use strict';

/**
 * @ngdoc function
 * @name kanColleViewerMomiApp.controller:GirlCtrl
 * @description
 * # GirlCtrl
 * Controller of the kanColleViewerMomiApp
 */
angular.module('kanColleViewerMomiApp')
  .controller('GirlCtrl', function ($scope, $routeParams, WebSocket, ShipMap, SharedObject, Fleet, $sce) {
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

      SharedObject.hook("port", function () { renderGirl(); });
      renderGirl();

      function renderGirl () {
          if (SharedObject.portJson == null) { return; }
          $scope.girlId = $routeParams.girlId;
          $scope.hpUnit = 1; // 1: abstruct, -1: percent
          var her = ShipMap.getFleetFromPort($scope.girlId);
          var herFleet = Fleet.generateFleetObjectFromAPIFleet(her);

          $scope.girl = herFleet;

          var herDockId = ShipMap.getDockIdSheBelongsTo($scope.girlId);
          if (herDockId != undefined) {
              $scope.herDockId = herDockId;
              $scope.herDockName = ShipMap.getDockName($scope.herDockId);
          }

          var labels = ["火力", "装甲", "雷装", "回避", "対空", "対潜", "索敵"];
          // 各パラメタの0番は装備を加味した能力値(実効値)、1番は装備を除いた近代化改修を利用した場合に得られる最大能力値(理論最大値)？
          // ただし運は謎
          // 最大能力はapi_start2から取得するっぽい
          var status = [herFleet.karyoku, herFleet.soukou, herFleet.raisou, herFleet.kaihi, herFleet.taiku, herFleet.taisen, herFleet.sakuteki];
          var zippedStatus = labels.map(function (elem, i) { return [labels[i], status[i]]; });
          console.log(zippedStatus);
          $scope.zippedStatus = zippedStatus;

          drawStatusRadar(labels, status);

          $scope.$apply();
      }

      function drawStatusRadar (labels, status) {
          var statusIdeal = [],
              statusActual = [];

          status.forEach(function (pair) { statusActual.push(pair[0]); statusIdeal.push(pair[1]); });
          console.log("ideal: " + statusIdeal);
          console.log("actual: " + statusActual);

          var radarColorActualOpaque = "rgba(96,189,104,1)";
          var radarColorActual = "rgba(96,189,104,0.05)";
          var radarColorIdealOpaque = "rgba(93,165,218,1)";
          var radarColorIdeal = "rgba(93,165,218,0.05)";

          var dataSetActual = {
              label: "実効値",
              fillColor: radarColorActual,
              strokeColor: radarColorActualOpaque,
              pointColor: radarColorActualOpaque,
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: statusActual
          };
          var dataSetIdeal = {
              label: "最大基本値",
              fillColor: radarColorIdeal,
              strokeColor: radarColorIdealOpaque,
              pointColor: radarColorIdealOpaque,
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: statusIdeal
          };
          var dataSet = [dataSetActual, dataSetIdeal];
          var data = {labels: labels, datasets: dataSet};
          console.log(data);

          var statusChartCtx = $("#status-chart").get(0).getContext("2d");
          var statusChart = new Chart(statusChartCtx).Radar(data, {
              scaleShowLabels: true,
              pointLabelFontSize : 15,
              legendTemplate : "<% for (var i=0; i<datasets.length; i++){%><span class=\"label\" style=\"background-color:<%=datasets[i].strokeColor%>\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span><%}%>"
          });
          $scope.statusChartLegend = $sce.trustAsHtml(statusChart.generateLegend());
      }
  });
