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
            },
            getDockIdSheBelongsTo: function (id) {
                console.log("Searching fleet id: " + id);
                var result = SharedObject.portJson.api_data.api_deck_port.find(function (dock) {
                    console.log("Now searching in dock #" + dock.api_id);
                    var index = dock.api_ship.indexOf(parseInt(id));
                    console.log("Searched index is: " + index);
                    return index >= 0; // 存在しないときは-1を返す; 存在していれば0以上の値を返す
                });
                if (result !== undefined) {
                    return SharedObject.portJson.api_data.api_deck_port.indexOf(result);
                } else {
                    console.log("Fleet not found in deck");
                    return undefined;
                }
            },
            getDockName: function (id) {
                return SharedObject.portJson.api_data.api_deck_port[id].api_name;
            }
        };
    });
