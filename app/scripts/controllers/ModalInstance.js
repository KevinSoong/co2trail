'use strict';

angular.module('a2App')
  .controller('ModalInstanceCtrl', function ($scope, $modalInstance) {
    $scope.ok = function () {
      $modalInstance.close();
    };
  });
