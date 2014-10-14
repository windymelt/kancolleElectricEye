'use strict';

/**
 * @ngdoc overview
 * @name kanColleViewerMomiApp
 * @description
 * # kanColleViewerMomiApp
 *
 * Main module of the application.
 */
angular
  .module('kanColleViewerMomiApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

angular.module('kanColleViewerMomiApp')
    .service('SharedObject', function (WS) {
        console.log("SharedObject created");
        var Service = {
            portJson: null,
            api_start2: null
        };

        WS.subscribe(function(message){
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
