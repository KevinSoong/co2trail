'use strict';

angular.module('a2App')
  .controller('TakeActionCtrl', function ($scope, $modal) {
  $scope.open = function () {
    var modalInstance = $modal.open({
      templateUrl: 'views/take-action.html',
      controller: 'ModalInstanceCtrl',
      resolve: {}
    });
  };
})




