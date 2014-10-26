'use strict';

/**
 * @ngdoc service
 * @name kanColleViewerMomiApp.SharedObject
 * @description
 * # SharedObject
 * Service in the kanColleViewerMomiApp.
 */
angular.module('kanColleViewerMomiApp')
  .service('SharedObject', function SharedObject(WebSocket) {
      console.log("SharedObject created");
      var Service = {
          portJson: null,
          api_start2: null
      };

      WebSocket.subscribe(function(message){
          var json = JSON.parse(message);
          switch (json.api) {
          case "port":
              Service.portJson = JSON.parse(message).data;
              callback("port");
              break;

          case "api_start2":
              Service.api_start2Json = JSON.parse(message).data;
              callback("api_start2");
              break;
          }
      });

      var callbackTable = [];
      function callback(api) {
          callbackTable.forEach(function (callbackObj) {
              if (callbackObj.api == api) {callbackObj.callback();}
          });
      }

      Service.hook = function (api, callback) {
          var callbackObj = new Object();
          callbackObj.api = api;
          callbackObj.callback = callback;
          callbackTable.push(callbackObj);
      };

      return Service;
  });
