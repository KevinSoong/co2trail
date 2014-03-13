'use strict';

angular.module('a2App')
  .controller('TakeActionCtrl', function ($scope, $modal, $sce) {
    $scope.likeURL = $sce.trustAsResourceUrl('http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fkjsoong.people.si.umich.edu%2Fco2trail%2F&width&layout=button_count&action=like&show_faces=false&share=false&height=21&appId=180750652090500');
  $scope.open = function () {
    var modalInstance = $modal.open({
      templateUrl: 'views/take-action.html',
      controller: 'ModalInstanceCtrl',
      resolve: {}
    });
  };
})




