'use strict';

describe('Service: ShipMap', function () {

  // load the service's module
  beforeEach(module('kanColleViewerMomiApp'));

  // instantiate service
  var ShipMap;
  beforeEach(inject(function (_ShipMap_) {
    ShipMap = _ShipMap_;
  }));

  it('should do something', function () {
    expect(!!ShipMap).toBe(true);
  });

});
