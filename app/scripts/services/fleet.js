'use strict';

/**
 * @ngdoc service
 * @name kanColleViewerMomiApp.Fleet
 * @description
 * # Fleet
 * Factory in the kanColleViewerMomiApp.
 */
angular.module('kanColleViewerMomiApp')
    .factory('Fleet', function (ShipMap, SharedObject) {

        function generateFleetObjectFromAPIFleet (her) {
            if (her === undefined) { return undefined; }

            var herData = new Object();

            herData.hp = her.api_nowhp;
            herData.maxHp = her.api_maxhp;
            herData.hpPercent = Math.round(her.api_nowhp / her.api_maxhp * 100);
            herData.id = her.api_id;
            herData.shipId = her.api_ship_id;
            herData.lv = her.api_lv;

            herData.items = her.api_slot.slice(0, her.api_slotnum);

            herData.karyoku = her.api_karyoku;
            herData.soukou = her.api_soukou;
            herData.raisou = her.api_raisou;
            herData.kaihi = her.api_kaihi;
            herData.taiku = her.api_taiku;
            herData.taisen = her.api_taisen;
            herData.sakuteki = her.api_sakuteki;
            herData.un = her.api_lucky;

            var shipStatus = ShipMap.fetchShipStatus(her.api_ship_id);
            herData.name = shipStatus.api_name;

            var maxFuel = shipStatus.api_fuel_max;
            var maxAmmo = shipStatus.api_bull_max;
            herData.needFuelSupply = her.api_fuel < maxFuel;
            herData.needAmmoSupply = her.api_bull < maxAmmo;

            herData.isOnFix = ShipMap.isOnFix(her.api_id);
            if (herData.isOnFix) {
                herData.fixTime = herData.isOnFix.api_complete_time_str;
            }

            herData.cond = her.api_cond;

            herData.airSperiorityIndex = calculateAirSperiorityIndex(her.api_id);

            return herData;
        }

        function calculateAirSperiorityIndex(girlId) {
            if (girlId == -1) { return 0; }
            if (SharedObject.slot_itemJson == null) { return undefined; }
            var girl = ShipMap.getFleetFromPort(girlId);
            if (girl === undefined) { return undefined; }
            var slotItemIds = girl.api_slot.slice(0, girl.api_slotnum),
                slotAmounts = girl.api_onslot.slice(0,girl.api_slotnum);

            var slotItemTaiku = slotItemIds.
                    map(ShipMap.getItem)
                    .map(function (item) {
                        if (item == undefined) { return undefined; }
                        return item.api_slotitem_id;
                    })
                    .map(ShipMap.getItemStatus)
                    .map(function (status) {
                        // [3, 5, 6, 6]は戦闘機、[5, 7, 11, 10]は水上戦闘機
                        if (status === undefined) { return 0; }
                        if (JSON.stringify(status.api_type) == "[3,5,6,6]" || JSON.stringify(status.api_type) == "[5,7,11,10]") {
                            return status.api_tyku;
                        } else {
                            return 0;
                        }
                    });
            var index = slotItemTaiku
                .map(function (_, i) {
                    return Math.floor(slotItemTaiku[i] * Math.sqrt(slotAmounts[i]));
                })
                .reduce(function (x, y) {
                    return x + y;
                });
            return index;
        }

        function calculateAirSperiorityIndexFromGirls (girls) {
            var indexSum = 0;
            girls.forEach(function (girl) {
                indexSum += calculateAirSperiorityIndex(girl);
            });
            return indexSum;
        }

        function generateSlotItemsDescription (itemIds) {
            var items = [];
            itemIds.forEach(function (id) {
                var item = ShipMap.getItem(id);
                if (item !== undefined) {
                    items.push({item:item, status:ShipMap.getItemStatus(item.api_slotitem_id)});
                } else {
                    items.push(undefined);
                }
            });
            return items;
        }

        return {
            generateFleetObjectFromAPIFleet: generateFleetObjectFromAPIFleet,
            calculateAirSperiorityIndex: calculateAirSperiorityIndex,
            calculateAirSperiorityIndexFromGirls: calculateAirSperiorityIndexFromGirls,
            generateSlotItemsDescription: generateSlotItemsDescription
        };
    });
