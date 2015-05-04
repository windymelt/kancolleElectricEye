'use strict';

describe('Controller: DockCtrl', function () {

  // load the controller's module
  beforeEach(module('kanColleViewerMomiApp'));

  var DockCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DockCtrl = $controller('DockCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
