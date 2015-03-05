'use strict';

describe('Controller: GirlsCtrl', function () {

  // load the controller's module
  beforeEach(module('kanColleViewerMomiApp'));

  var GirlsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GirlsCtrl = $controller('GirlsCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
