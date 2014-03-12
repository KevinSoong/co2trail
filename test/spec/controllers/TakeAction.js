'use strict';

describe('Controller: TakeActionCtrl', function () {

  // load the controller's module
  beforeEach(module('a2App'));

  var TakeActionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TakeActionCtrl = $controller('TakeActionCtrl', {
      $scope: scope
    });
  }));

  // it('should attach a list of awesomeThings to the scope', function () {
  //   expect(scope.awesomeThings.length).toBe(3);
  // });
});
