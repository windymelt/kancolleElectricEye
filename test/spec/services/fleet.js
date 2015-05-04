'use strict';

describe('Service: Fleet', function () {

  // load the service's module
  beforeEach(module('kanColleViewerMomiApp'));

  // instantiate service
  var Fleet;
  beforeEach(inject(function (_Fleet_) {
    Fleet = _Fleet_;
  }));

  it('should do something', function () {
    expect(!!Fleet).toBe(true);
  });

});
