'use strict';

describe('Controller: GirlsstatCtrl', function () {

  // load the controller's module
  beforeEach(module('kanColleViewerMomiApp'));

  var GirlsstatCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GirlsstatCtrl = $controller('GirlsstatCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
