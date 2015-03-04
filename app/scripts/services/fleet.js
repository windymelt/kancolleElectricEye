'use strict';

/**
 * @ngdoc service
 * @name kanColleViewerMomiApp.Fleet
 * @description
 * # Fleet
 * Factory in the kanColleViewerMomiApp.
 */
angular.module('kanColleViewerMomiApp')
    .factory('Fleet', function (ShipMap) {

        function generateFleetObjectFromAPIFleet (her) {
            if (her === undefined) { return undefined; }

            var herData = new Object();

            herData.hp = her.api_nowhp;
            herData.maxHp = her.api_maxhp;
            herData.hpPercent = Math.round(her.api_nowhp / her.api_maxhp * 100);
            herData.id = her.api_id;
            herData.shipId = her.api_ship_id;
            herData.lv = her.api_lv;

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

            return herData;
        }

        return {
            generateFleetObjectFromAPIFleet: generateFleetObjectFromAPIFleet
        };
    });
