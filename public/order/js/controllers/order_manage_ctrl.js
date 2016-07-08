/**
 * Created by liu on 16-5-24.
 */
appControllers.controller('orderManageCtrl', function ($scope, localStorage, JumpPagService) {

    function getLoginStatus() {
        return localStorage.get('currentUser') != null && localStorage.get('currentUser').username != undefined;
    }

    function init() {
        if (getLoginStatus()) {
            isAdmin();
        }
    }

    function isAdmin() {
        $scope.isAdmin = localStorage.get('currentUser').type == 'admin'
    }

    $scope.afterUpdate = function () {
        alert('更新成功 ');
    };

    $scope.afterDelete= function () {
        alert('删除成功 ');
    };

    $scope.goToOrderManage = function () {
        JumpPagService.path('/orderManage')
    };

    $scope.goToOrderShow = function () {
        JumpPagService.path('/orderShow')
    };


    $scope.goToNewOrder = function () {
        JumpPagService.path('/order')
    };

    init();


});