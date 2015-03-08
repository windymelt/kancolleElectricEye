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
      .when('/dock/:dockId', {
        templateUrl: 'views/dock.html',
        controller: 'DockCtrl'
      })
      .when('/girl/:girlId', {
        templateUrl: 'views/girl.html',
        controller: 'GirlCtrl'
      })
      .when('/girls', {
        templateUrl: 'views/girls.html',
        controller: 'GirlsCtrl'
      })
      .when('/girlsstat', {
        templateUrl: 'views/girlsstat.html',
        controller: 'GirlsStatCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
