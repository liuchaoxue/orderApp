/**
 * Created by liu on 16-5-24.
 */
appControllers.controller('orderCtrl', function ($scope, JumpPagService) {
    $scope.afterCreate = function () {
        $scope.goToOrderShow();
    };

    $scope.afterCancel = function () {
        $scope.goToOrderShow()
    };

    $scope.goToOrderShow = function(){
        JumpPagService.path('/orderShow')
    };

});
