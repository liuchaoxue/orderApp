angular.module('app.routes', [])

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider


            .state('order', {
                url: '/order',
                templateUrl: 'templates/new_order.html',
                cache:'false',
                controller: 'orderCtrl'
            })

            .state('orderShow', {
                url: '/orderShow',
                cache:'false',
                templateUrl: 'templates/order_show.html',
                controller: 'orderShowCtrl'
            })

            .state('test', {
                url: '/test',
                templateUrl: 'templates/test.html',
                cache:'false',
                controller: 'testCtrl'
            })

            .state('nearby', {
                url: '/nearby',
                templateUrl: 'templates/nearby_deliver_man.html',
                cache:'false',
                controller: "nearbyCtrl",
                resolve: {
                    validater: function (localStorage) {
                        if (localStorage.get('currentUser').type == 'user') {
                            $state.go('/orderShow');
                        }
                    }
                }
            })

            .state('orderManage', {
                url: '/orderManage',
                templateUrl: 'templates/order_manage.html',
                cache:'false',
                controller: 'orderManageCtrl',
                params:{'deliver':{}},
                resolve: {
                    validater: function (localStorage) {
                        if (localStorage.get('currentUser').type == 'user') {
                            $state.go('/orderShow');
                        }
                    }
                }
            });
        $urlRouterProvider.otherwise('/orderShow')
    });