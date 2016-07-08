var appControllers = angular.module('app.controllers', []);
var appServices = angular.module('app.services', []);
var appDirectives = angular.module('app.directives', []);

appControllers.controller('appLoginCtrl', function ($scope, $location, $ionicModal, localStorage, TextAnalysisService, JumpPagService, UserLoginService) {

    $ionicModal.fromTemplateUrl('templates/appLogin.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
        Init();
    });

    function Init() {
        $scope.isLogin = getLoginStatus();
        $scope.userName = getUserName();
        if (!$scope.isLogin) {
            openLogin();
        }
    }

    $scope.login = function (name, password) {
        UserLoginService.login(name, password, function (data) {
            localStorage.set('currentUser', data);
            localStorage.set('username', data.username);
            Init();
            closeLogin();
            checkUserType();
        })
    };

    //TextAnalysisService.get('admin', '123');

    $scope.exit = function () {
        localStorage.set('currentUser', {});
        Init()
    };

    function getLoginStatus() {
        return localStorage.get('currentUser') != null && localStorage.get('currentUser').username != undefined;
    }

    function getUserName() {
        var current_user = localStorage.get('currentUser');
        return current_user ? current_user.username : "";
    }

    function openLogin() {
        $scope.modal.show();
    }

    function closeLogin() {
        $scope.modal.hide();
    }

    function checkUserType() {
        if (localStorage.get('currentUser').type == 'admin' || localStorage.get('currentUser').type == 'deliverMan') {
            $scope.goToOrderManage()
        } else {
            $scope.goToOrderShow()
        }
    }

    $scope.goToOrderManage = function () {
        JumpPagService.path('/orderManage')
    };

    $scope.goToOrderShow = function () {
        JumpPagService.path('/orderShow')
    };


    $scope.goToNewOrder = function () {
        JumpPagService.path('/order')
    };


});


