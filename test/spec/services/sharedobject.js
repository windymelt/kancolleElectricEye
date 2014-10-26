'use strict';

describe('Service: SharedObject', function () {

  // load the service's module
  beforeEach(module('kanColleViewerMomiApp'));

  // instantiate service
  var SharedObject;
  beforeEach(inject(function (_SharedObject_) {
    SharedObject = _SharedObject_;
  }));

  it('should do something', function () {
    expect(!!SharedObject).toBe(true);
  });

});
