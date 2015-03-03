'use strict';

/**
 * @ngdoc function
 * @name kanColleViewerMomiApp.controller:GirlCtrl
 * @description
 * # GirlCtrl
 * Controller of the kanColleViewerMomiApp
 */
angular.module('kanColleViewerMomiApp')
  .controller('GirlCtrl', function ($scope, $routeParams, WebSocket, ShipMap, SharedObject) {
      $scope.girlId = $routeParams.girlId;
      $scope.awesomeThings = [
          'HTML5 Boilerplate',
          'AngularJS',
          'Karma'
      ];
  });
