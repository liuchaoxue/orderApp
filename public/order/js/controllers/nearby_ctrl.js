/**
 * Created by liu on 16-6-21.
 */

appControllers.controller('nearbyCtrl', function ($scope, localStorage, JumpPagService, $ionicScrollDelegate, $timeout) {
    $scope.goToOrderManage = function () {
        JumpPagService.path('/orderManage');
    };
});