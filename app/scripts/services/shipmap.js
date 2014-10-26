'use strict';

/**
 * @ngdoc service
 * @name kanColleViewerMomiApp.ShipMap
 * @description
 * # ShipMap
 * Factory in the kanColleViewerMomiApp.
 */
angular.module('kanColleViewerMomiApp')
    .factory('ShipMap', function (SharedObject) {

        return {
            getFleetFromPort: function (id) {
                return SharedObject.portJson.api_data.api_ship.find(function(element){
                    return element.api_id == id;
                });
            },
            isOnFix: function (id) {
                return SharedObject.portJson.api_data.api_ndock.find(function(element){
                    return element.api_ship_id == id;
                });
            },
            countFleetsOnFix: function () {
                return SharedObject.portJson.api_data.api_ndock.filter(function (ndock) {
                    return ndock.api_state == 1;
                }).length;
            },
            fetchShipStatus: function (id) {
                return SharedObject.api_start2Json.api_data.api_mst_ship.find(function (element) {
                    return element.api_id == id;
                });
            }
        };
    });
