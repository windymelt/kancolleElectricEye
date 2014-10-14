'use strict';

/**
 * @ngdoc function
 * @name kanColleViewerMomiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the kanColleViewerMomiApp
 */
angular.module('kanColleViewerMomiApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

angular.module('kanColleViewerMomiApp')
    .controller('PortCtrl', function ($route, $scope, WS, ShipMap, SharedObject) {
        if (SharedObject.api_start2Json == null) {$scope.needReload = true;}
        $scope.teitokuName = "Momiji";
            $scope.logs = [];
            $scope.docks = [];

        SharedObject.hook("api_start2", function () {
            $scope.needReload = false;
            console.log("Received api_start2!");
            $scope.$apply();
        });

        WS.registerOpening(function(){
            $scope.proxyProblem = false;
            $scope.$apply();
        });

        WS.registerClosing(function(){
            $scope.proxyProblem = true;
            $scope.$apply();
        });

        SharedObject.hook("port", function() {renderPort();});
        renderPort();
        function renderPort() {
            if (SharedObject.portJson == null) { return; }
            var jsonData = SharedObject.portJson;
            $scope.teitokuName = jsonData.api_data.api_basic.api_nickname;

            $scope.logs = [];
            jsonData.api_data.api_log.forEach(function(log){
                console.log("log: " + log.api_message);
                var logObj = new Object();
                logObj.id = log.api_no;
                logObj.message = log.api_message;
                $scope.logs.push(logObj);
            });

            var docks = [];
            jsonData.api_data.api_deck_port.forEach(
                function(dock){
                    var ships = [];
                    var dockObj = new Object();
                    dock.api_ship.forEach(
                        function(shipNo) {
                            var ship = ShipMap.getFleetFromPort(jsonData, shipNo);
                            var shipData = new Object();
                            if (ship === undefined) {return;}
                            var shipStatus = ShipMap.fetchShipStatus(ship.api_ship_id);

                            shipData.hpPercent = ship.api_nowhp / ship.api_maxhp * 100;
                            shipData.id = ship.api_id;
                            shipData.shipId = ship.api_ship_id;
                            shipData.name = shipStatus.api_name;
                            shipData.lv = ship.api_lv;
                            shipData.isOnFix = ShipMap.isOnFix(jsonData, ship.api_id);
                            if(shipData.isOnFix) {shipData.fixTime = shipData.isOnFix.api_complete_time_str;}

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
    }
               );

angular.module('kanColleViewerMomiApp').factory('WS', function() {
    var Service = {
        openCallback: null,
        closeCallback: null
    };
    var ws = new WebSocket("ws://localhost:8081/");

    ws.onopen = function() {
        console.log("Socket has been opened!");
        if (Service.openCallback != null) { Service.openCallback(); }
    };

    ws.onmessage = function(message) {
        console.log("Data Incoming");
        Service.callback(message.data);
    };

    ws.onclose = function() {
        if (Service.closeCallback != null) { Service.closeCallback(); }
        Service.reconnect();
        console.log("WS reconnected");
    };

    ws.onerror = function() {
        console.log("WS error");
        if (Service.closeCallback != null) { Service.closeCallback(); }
    };

    Service.reconnect = function () {
        Service.ws.close();
        Service.ws = new WebSocket("ws://localhost:8081/");

        const CLOSED = 3;
        const CLOSING = 2;

        if (Service.ws.readyState == CLOSED || Service.ws.readyState == CLOSING) {
            return false;
        } else {
            if (Service.openCallback != null) { Service.openCallback(); }
            return true;
        }
    };

    Service.ws = ws;

    Service.send = function(message) {
        Service.ws.send(message);
    };

    Service.subscribe = function(callback) {
        Service.callback = callback;
    };

    Service.registerOpening = function (callback) {
        Service.openCallback = callback;
    };

    Service.registerClosing = function (callback) {
        Service.closeCallback = callback;
    };

    return Service;
});

angular.module('kanColleViewerMomiApp').factory('ShipMap', function(SharedObject) {
    var Service = {};

    Service.getFleetFromPort = function(port, id) {
        return port.api_data.api_ship.find(function(element, index, array){
            return element.api_id == id;
        });
    };

    Service.isOnFix = function(port, id) {
        return port.api_data.api_ndock.find(function(element, index, array){
            return element.api_ship_id == id;
        });
    };

    Service.countFleetsOnFix = function () {
        return SharedObject.portJson.api_data.api_ndock.filter(function (ndock) {
            return ndock.api_state == 1;
        }).length;
    };

    Service.fetchShipStatus = function (id) {
        return SharedObject.api_start2Json.api_data.api_mst_ship.find(function (element, index, array) {
            return element.api_id == id;
        });
    };

    return Service;
});
