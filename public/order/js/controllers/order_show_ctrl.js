/**
 * Created by liu on 16-5-24.
 */
appControllers.controller('orderShowCtrl', function ($scope, LeanCloudClassService, localStorage, JumpPagService) {

    $scope.goToOrderManage = function () {
        JumpPagService.path('/orderManage')
    };

    $scope.goToOrderShow = function () {
        JumpPagService.path('/orderShow')
    };


    $scope.goToNewOrder = function () {
        JumpPagService.path('/order')
    };

    function getOrder() {
        //LeanCloudClassService.find('Order', {
        //    where: {
        //        userId: {
        //            "__type": "Pointer",
        //            "className": "_User",
        //            "objectId": localStorage.get('currentUser').objectId
        //        }
        //    },
        //    order:'-createdAt'
        //}, function (data) {
        //    $scope.orderInfo = data;
        //});
    }

    function getButtonStatus() {
        $scope.isDelverMan = localStorage.get('currentUser').type == 'deliverMan';
        $scope.isAdmin = localStorage.get('currentUser').type == 'admin';

    }

    function getLoginStatus() {
        return localStorage.get('currentUser') != null && localStorage.get('currentUser').username != undefined;
    }

    function init() {
        if (getLoginStatus()) {
            getOrder();
            getButtonStatus()
        }
    }

    init()


});
