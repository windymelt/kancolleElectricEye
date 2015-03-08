'use strict';

/**
 * @ngdoc function
 * @name kanColleViewerMomiApp.controller:GirlsstatCtrl
 * @description
 * # GirlsstatCtrl
 * Controller of the kanColleViewerMomiApp
 */
angular.module('kanColleViewerMomiApp')
  .controller('GirlsStatCtrl', function ($scope, SharedObject, ShipMap, Fleet, WebSocket) {
      var divisionThreshold = 5;

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

      SharedObject.hook("port", function () { renderStats(); });

      renderStats();

      function renderStats () {
          if (SharedObject.portJson == null) { return; }
          var lvHistgram = generateLvHistgram();
          drawLvHistgramChart(lvHistgram);

          $scope.$apply();
      }


      function generateLvHistgram () {
          var hist = [];
          SharedObject.portJson.api_data.api_ship.forEach(function (ship) {
              console.log(ship);
              console.log(ship.api_lv);
              console.log(Math.floor(ship.api_lv / divisionThreshold));
              if (hist[Math.floor(ship.api_lv / divisionThreshold)] === undefined) {
                  hist[Math.floor(ship.api_lv / divisionThreshold)] = 1;
              } else {
                  hist[Math.floor(ship.api_lv / divisionThreshold)]++;
              } ;
          });
          for (var i_hist = 0; i_hist < hist.length; i_hist++) {
              if (hist[i_hist] === undefined) {
                  hist[i_hist] = 0;
              }
          };
          console.log(hist);
          return hist;
      }

      function drawLvHistgramChart (lvHistgram) {
          var labels = [];
          console.log(lvHistgram);
          console.log("lngth:" + lvHistgram.length);
          for (var i_hist = 0; i_hist < lvHistgram.length; i_hist++) { labels.push(i_hist * divisionThreshold + "-" + (i_hist * divisionThreshold + divisionThreshold - 1) ); }
          console.log(labels);
          var radarColorActualOpaque = "rgba(96,189,104,1)";
          var dataSets = [{
              label: "Lv.",
              fillColor: radarColorActualOpaque,
              strokeColor: radarColorActualOpaque,
              highlightFill: "#fff",
              highlightStroke: "rgba(220,220,220,1)",
              data: lvHistgram
          }];
          var data = {
              labels: labels,
              datasets: dataSets
          };

          var statusChartCtx = $("#lvhistbar").get(0).getContext("2d");
          var statusChart = new Chart(statusChartCtx).Bar(data, {
              scaleShowGridLines : true
          });
          console.log(data);
      }
  });
