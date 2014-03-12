'use strict';

angular.module('a2App')
  .controller('TakeActionCtrl', function ($scope, $modal) {
    $scope.items = ['item1', 'item2', 'item3'];

  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: 'views/take-action.html',
      controller: ModalInstanceCtrl,
      resolve: {}
    });

  };
  // Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var ModalInstanceCtrl = function ($scope, $modalInstance) {
  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

});


