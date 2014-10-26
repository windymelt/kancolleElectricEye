'use strict';

describe('Service: WebSocket', function () {

  // load the service's module
  beforeEach(module('kanColleViewerMomiApp'));

  // instantiate service
  var WebSocket;
  beforeEach(inject(function (_WebSocket_) {
    WebSocket = _WebSocket_;
  }));

  it('should do something', function () {
    expect(!!WebSocket).toBe(true);
  });

});
