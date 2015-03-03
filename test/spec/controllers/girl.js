'use strict';

describe('Controller: GirlCtrl', function () {

  // load the controller's module
  beforeEach(module('kanColleViewerMomiApp'));

  var GirlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GirlCtrl = $controller('GirlCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
