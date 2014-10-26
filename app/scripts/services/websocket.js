'use strict';

/**
 * @ngdoc service
 * @name kanColleViewerMomiApp.WebSocket
 * @description
 * # WebSocket
 * Factory in the kanColleViewerMomiApp.
 */
angular.module('kanColleViewerMomiApp')
  .factory('WebSocket', function () {
      var Service = [];
      var ws = new ReconnectingWebSocket("ws://localhost:8081/");

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
          console.log("WS reconnected");
      };

      ws.onerror = function() {
          console.log("WS error");
          if (Service.closeCallback != null) { Service.closeCallback(); }
      };

      Service.openCallback = null;
      Service.closeCallback = null;
      Service.callback = null;
      Service.ws = ws;
      Service.send = function (message) {
            ws.send(message);
        };
      Service.subscribe = function (callback) {
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
