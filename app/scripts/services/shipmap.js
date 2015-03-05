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
            },
            getItem: function (id) {
                return SharedObject.slot_itemJson.api_data.find(function (item) {
                    return item.api_id == id;
                });
            },
            getItemStatus: function (id) {
                return SharedObject.api_start2Json.api_data.api_mst_slotitem.find(function (item) {
                    return item.api_id == id;
                });
            },
            findGirlsWithName: function (q) { // クエリ文字列を含む艦種を抽出し、それら艦種のidを持つ個別の艦娘を検索する
                var ships = SharedObject.api_start2Json.api_data.api_mst_ship.filter(function (ship) {
                    return ship.api_name.indexOf(q) > -1 || ship.api_yomi.indexOf(q) > -1;
                });
                if (ships == []) return [];

                return SharedObject.portJson.api_data.api_ship.filter(function (her) {
                    var foundFlag = false;
                    ships.forEach(function (s) {
                        if(s.api_id == her.api_ship_id) {
                            console.log("Found: " + her.api_id);
                            foundFlag = true;
                        };
                    });
                    return foundFlag;
                });
            },
            findSlotItemTypesWithName: function (q, havingOnly = true) {
                // 名前から装備を探す関数
                // havingOnly == trueのときは艦隊にある装備のみ返す

                // 所与の装備種別IDに該当する装備を艦隊が有しているかを返すヘルパー関数
                function itemExists(typeId) {
                    var item = SharedObject.slot_itemJson.api_data.find(function (it) {
                        return it.api_slotitem_id == typeId;
                    });
                    return item !== undefined;
                }

                // 装備種別から名前が一致し、かつ艦隊に存在するものを検索する
                var items = SharedObject.api_start2Json.api_data.api_mst_slotitem.filter(function (itm) {
                    if (havingOnly) {
                        return itm.api_name.indexOf(q) > -1 && itemExists(itm.api_id);
                    } else {
                        return itm.api_name.indexOf(q) > -1;
                    }
                });

                return items;
            },
            findSlotItemOwnerByItemId: function (slotItemId) {
                return SharedObject.portJson.api_data.api_ship.find(function (her) {
                    return her.api_slot.indexOf(slotItemId) > -1;
                });
            },
            findSlotItemsWithType: function (typeIds) {
                var slotItems = {};
                SharedObject.slot_itemJson.api_data.forEach(function (item) {
                    if (typeIds.indexOf(item.api_slotitem_id) > -1) {
                        if (slotItems[item.api_slotitem_id] === undefined) {
                            slotItems[item.api_slotitem_id] = [item.api_id];
                        } else {
                            slotItems[item.api_slotitem_id].push(item.api_id);
                        };
                    }
                });
                return slotItems;
            }
        };
    });
