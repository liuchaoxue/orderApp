/**
 * Created by liu on 16-5-26.
 */
appDirectives
    .directive('newOrder', function (localStorage) {
        return {
            restrict: "EA",
            scope: {
                x: "=order",
                after_create: '&afterCreate',
                after_cancel: '&afterCancel'
            },
            controller: function ($scope, $location, LeanCloudClassService, $q) {
                var map = new BMap.Map("map");

                function checkTime(i) {
                    if (i < 10) {
                        i = "0" + i
                    }
                    return i
                }

                function getElementById(id) {
                    return document.getElementById(id).value;
                }

                $scope.cancel = function () {
                    $scope.after_cancel()
                };

                function getLocationId() {
                    return localStorage.get('currentUser').objectId.substring(0, 6) +
                        parseInt(Math.random() * 1000000) + (new Date()).valueOf();
                }


                function getCreateInfo(distance, sender_phone, receiver_name, receiver_phone) {
                    var sender = getSenderGeoLocationData();
                    var receiver = getReceiverGeoLocationData();
                    return {
                        "requests": [
                            {
                                "method": "POST",
                                "path": "/1.1/classes/SenderGeoLocation",
                                "body": sender
                            },
                            {
                                "method": "POST",
                                "path": "/1.1/classes/ReceiverGeoLocation",
                                "body": receiver
                            },
                            {
                                "method": "POST",
                                "path": "/1.1/classes/Order",
                                "body": getOrderData(distance, sender_phone, receiver_name, receiver_phone, sender.objectId, receiver.objectId)
                            }
                        ]
                    };
                }

                function getOrderData(distance, sender_phone, receiver_name, receiver_phone, sender, receiver) {
                    return {
                        sender_address: getElementById('sender_address'),
                        sender_phone: sender_phone,
                        receiver_name: receiver_name,
                        receiver_address: getElementById('receiver_address'),
                        receiver_phone: receiver_phone,
                        cut_off_time: {
                            "__type": "Date",
                            "iso": new Date(getElementById('order_date') + ' ' +
                                checkTime(getElementById('order_hour')) + ':' +
                                checkTime(getElementById('order_min'))).toISOString()
                        },
                        deliverman: {"__type": "Pointer", "className": "_User", "objectId": ""},
                        userId: {
                            "__type": "Pointer",
                            "className": "_User",
                            "objectId": localStorage.get('currentUser').objectId
                        },
                        senderCoordinate: {
                            "__type": "Pointer",
                            "className": "SenderGeoLocation",
                            "objectId": sender
                        },
                        receiverCoordinate: {
                            "__type": "Pointer",
                            "className": "ReceiverGeoLocation",
                            "objectId": receiver
                        },
                        state: 'none',
                        deliverPrice: distance,
                        initTimeCost: 0
                    }
                }

                function getSenderGeoLocationData() {
                    var sender = getLocationId();
                    return {
                        objectId: sender,
                        geoPosition: {
                            "__type": "GeoPoint",
                            "latitude": localStorage.get('sender_address').lat,
                            "longitude": localStorage.get('sender_address').lng
                        }
                    }
                }

                function getReceiverGeoLocationData() {
                    var receiver = getLocationId();
                    return {
                        objectId: receiver,
                        geoPosition: {
                            "__type": "GeoPoint",
                            "latitude": localStorage.get('receiver_address').lat,
                            "longitude": localStorage.get('receiver_address').lng
                        }
                    }
                }

                function getDistance(cb) {
                    var distance;
                    var sender = new BMap.Point(localStorage.get('sender_address').lng, localStorage.get('sender_address').lat),
                        receiver = new BMap.Point(localStorage.get('receiver_address').lng, localStorage.get('receiver_address').lat);

                    var searchComplete = function (results) {
                        if (transit.getStatus() != BMAP_STATUS_SUCCESS) {
                            return;
                        }
                        var plan = results.getPlan(0);
                        plan.getDuration(true);
                        distance = plan.getDistance(true);
                    };

                    var transit = new BMap.DrivingRoute(map, {
                        renderOptions: {map: map, autoViewport: false},
                        onSearchComplete: searchComplete,
                        onPolylinesSet: function () {
                            cb(JSON.parse(distance.substring(0, distance.length - 2)));
                        }
                    });
                    transit.search(sender, receiver);
                }

                $scope.createOrderInfo = function (sender_phone, receiver_name, receiver_phone) {
                    if (!(getElementById('sender_address') && sender_phone && receiver_name && getElementById('receiver_address') &&
                        receiver_phone && getElementById('order_date') && getElementById('order_hour') && getElementById('order_min'))) {
                        return alert("信息填写不完整！")
                    }

                    getDistance(function (data) {
                        LeanCloudClassService.batch(getCreateInfo(data, sender_phone, receiver_name, receiver_phone), function (item) {
                            $scope.after_create();
                            localStorage.set('sender_address', {});
                            localStorage.set('receiver_address', {});
                        })
                    });
                };
            },
            template: '<div id="map"></div> <label class="item item-input item-stacked-label" >' +
            '<span class="input-label">发货地址</span>' +
            '<input type="text" id="sender_address" map-address size="20"  ng-model="x.sender_address" placeholder="请输入发货地址">' +
            '<div id="searchResultPanel" style="border:1px solid #C0C0C0; display:none;"></div>' +
            '</label>' +
            '<label class="item item-input item-stacked-label ">' +
            ' <span class="input-label">发货电话</span>' +
            ' <input type="tel" ng-model="x.sender_phone" numbers-only placeholder="请输入收货电话" >' +
            ' </label> ' +
            '<label class="item item-input item-stacked-label ">' +
            ' <span class="input-label">收货地址</span>' +
            ' <input type="text"  id="receiver_address" map-address placeholder="请输入发货地址" ng-model="x.receiver_address">' +
            ' </label>' +
            '<label class="item item-input item-stacked-label "> ' +
            '<span class="input-label">收货人</span> ' +
            '<input type="text" ng-model="x.receiver_name"  placeholder="请输入收货人姓名">' +
            ' </label>' +
            ' <label class="item item-input item-stacked-label ">' +
            ' <span class="input-label">收货电话</span>' +
            ' <input type="tel" placeholder="请输入收货电话" numbers-only  ng-model="x.receiver_phone" >' +
            ' </label>' +
            '<label class="item item-input item-stacked-label "  >' +
            ' <span class="input-label">截至日期</span>' +
            ' <input type="date" placeholder="截止日期" ng-model="x.date" id="order_date">' +
            ' </label> ' +
            '<div class="item item-input item-stacked-label "> ' +
            '<span class="input-label">截至时间</span>' +
            ' <p> <input type="number" ng-model="hour" numbers-hour placeholder="1-24" id="order_hour">' +
            ' <input type="number"  numbers-min ng-model="min" placeholder="0-60" id="order_min"> ' +
            '</p> </div> ' +

            '<div class=" button-bar"> ' +
            '<a  class="button button-assertive  button-block" ng-click="cancel()">取消</a>' +
            '<a class=" button button-positive  button-block " ng-click="createOrderInfo(x.sender_phone,x.receiver_name,x.receiver_phone)">确认</a> ' +
            '</div>'


        }
    })
    .
    directive('showOrder', function (localStorage) {

        return {
            restrict: "EA",

            controller: function ($scope, $location, LeanCloudClassService, $filter) {
                $scope.orderState = '1';

                function currentState(number) {
                    var getState = 'none';

                    if (number >= 2) {
                        getState = 'ready'
                    }
                    if (number >= 4) {
                        getState = 'deliver'
                    }
                    if (number >= 5) {
                        getState = 'done'
                    }
                    return getState
                }

                function filterOrder(state) {
                    var number = JSON.parse(state);

                    return {
                        where: {
                            state: currentState(number),
                            deliverman: {
                                "__type": "Pointer",
                                "className": "_User",
                                "objectId": {"$exists": number >= 3}
                            }
                        },
                        order: '-createdAt'
                    }
                }

                $scope.getOrderInfo = function () {
                    var filter = filterOrder($scope.orderState);

                    LeanCloudClassService.find('Order', filter
                        , function (data) {
                            $scope.orderInfo = data;
                            data.forEach(function (item) {
                                getOrderState(item);
                            })
                        }
                    )
                    ;
                };

                function getLoginStatus() {
                    return localStorage.get('currentUser') != null && localStorage.get('currentUser').username != undefined;
                }

                if (getLoginStatus()) {
                    $scope.getOrderInfo();
                }

                function getOrderState(item) {
                    if (!item) {
                        return
                    }
                    var state;

                    if (item.state == 'none') {
                        state = '未接单';
                    }
                    if (item.state == 'ready') {
                        state = '取货中';
                    }
                    if (item.state == 'deliver') {
                        state = '运送中';
                    }
                    if (item.state == 'done') {
                        state = '订单已完成';
                    }
                    item.state = state;
                    return item
                }
            },
            template: ' <div> ' +
            '<label class="item item-select"><span>状态查询</span> ' +
            '<select ng-model="orderState" ng-change="getOrderInfo()"> ' +
            '<option value="1">新增订单</option> ' +
            '<option value="2">待分配订单</option> ' +
            '<option value="3">已分配</option> ' +
            '<option value="4">配送中</option> ' +
            '<option value="5">已完成</option> ' +
            '</select> ' +
            '</label> ' +

            '</div>' +
            ' <ion-item id="page6-list-item1" class="  " ng-repeat="x in orderInfo"> ' +
            '<div class="list card ">' +
            ' <form class="list ">' +
            '<label class="item item-input item-stacked-label" >' +
            '<span class="input-label" >发货地址</span>' +
            '<input type="text"  ng-readonly="true" ng-model="x.sender_address">' +
            '</label>' +
            '<label class="item item-input item-stacked-label ">' +
            ' <span class="input-label">发货电话</span>' +
            ' <input type="tel" ng-model="x.sender_phone" numbers-only placeholder="请输入收货电话" ng-readonly="true" >' +
            ' </label> ' +
            '<label class="item item-input item-stacked-label ">' +
            ' <span class="input-label">收货地址</span>' +
            '<input type="text"  ng-readonly="true" ng-model="x.receiver_address">' +
            ' </label>' +
            '<label class="item item-input item-stacked-label "> ' +
            '<span class="input-label">收货人</span> ' +
            '<input type="text" ng-readonly="true" ng-model="x.receiver_name"  placeholder="请输入收货人姓名">' +
            ' </label>' +
            ' <label class="item item-input item-stacked-label ">' +
            ' <span class="input-label">收货电话</span>' +
            ' <input type="tel" placeholder="请输入收货电话" numbers-only ng-readonly="true" ng-model="x.receiver_phone" >' +
            ' </label>' +
            '<label class="item item-input item-stacked-label "  >' +
            ' <span class="input-label">截至日期</span>' +
            ' <input type="text" readonly="readonly"  ng-model="x.cut_off_time.iso" placeholder="">' +
            ' </label> ' +
            ' <label class="item item-input item-stacked-label ">' +
            ' <span class="input-label">下单时间</span> ' +
            '<input type="text" readonly="readonly" ng-model="x.createdAt" placeholder="">' +
            '</label> <label class="item item-input item-stacked-label ">' +
            '<span class="input-label">运送费用(元)</span><input type="text" readonly="readonly" ng-model="x.deliverPrice" placeholder=""> ' +
            '</label>' +
            ' <label  class="item item-input item-stacked-label "> ' +
            '<span class="input-label">订单状态</span> ' +
            '<input type="text" readonly="readonly" ng-model="x.state" placeholder=""> </label> </form> </div> </ion-item>'
        }
    })
    .directive('manageOrder', function (localStorage) {
        return {
            restrict: "EA",
            scope: {
                after_delete: '&afterDelete',
                after_update: '&afterUpdate',
                is_admin: '=isAdmin'
            },

            controller: function ($scope, $location, LeanCloudClassService, $q, JumpPagService, $timeout, $stateParams, $ionicScrollDelegate) {

                $scope.orderState = localStorage.get('orderState') || '1';
                $scope.voluationState = [];
                $scope.ready = [];
                $scope.deliver = [];
                $scope.done = [];

                $scope.getOrderInfo = function () {
                    var defer = $q.defer();
                    var filter = $scope.is_admin ? filterOrder($scope.orderState) : "{}";
                    LeanCloudClassService.find('Order', filter, function (data) {
                        $scope.manageOrderInfo = data;
                        stateNum(data);
                        defer.resolve(data)
                    });
                    return defer.promise
                };

                function stateNum(data) {
                    data.forEach(function (item, index) {
                        $scope.voluationState[index] = $scope.changeState(item.state, index);
                        item.currentState = 0;
                        if (item.state == 'ready') {
                            return item.currentState = 1;
                        } else if (item.state == 'deliver') {
                            return item.currentState = 2;
                        } else if (item.state == 'done') {
                            return item.currentState = 3;
                        }
                    });
                }

                $scope.changeDeliverList = function (order, isChangeDeliver, index) {
                    if (!isChangeDeliver) {
                        $scope.deliverName[index] = $scope.allDeliver
                    } else {
                        localStorage.set('address', order);
                        localStorage.set('orderState', $scope.orderState);
                        $timeout(function () {
                            JumpPagService.path('nearby');
                        }, 100);
                        //$state.go('nearby', {address: order});
                        //getDeliverInfo(order, index)
                    }
                };

                $scope.getAllDeliver = function () {
                    var defer = $q.defer();
                    LeanCloudClassService.find('_User', {where: {"type": "deliverMan"}}, function (data) {
                        $scope.allDeliver = data;
                        defer.resolve(data)
                    });
                    return defer.promise
                };

                function currentState(number) {
                    var getState = 'none';

                    if (number >= 2) {
                        getState = 'ready'
                    }
                    if (number >= 4) {
                        getState = 'deliver'
                    }
                    if (number >= 5) {
                        getState = 'done'
                    }
                    return getState
                }

                function filterOrder(state) {
                    var number = JSON.parse(state);

                    return {
                        where: {
                            state: currentState(number),
                            deliverman: {
                                "__type": "Pointer",
                                "className": "_User",
                                "objectId": {"$exists": number >= 3}
                            }
                        },
                        order: '-createdAt'
                    }
                }


                $scope.changeState = function (init, index) {

                    var isAvailable = function (msg) {

                        $scope.ready[msg] = fsm.cannot('takeOrder');
                        $scope.deliver[msg] = fsm.cannot('Pickup');
                        $scope.done[msg] = fsm.cannot('finishOrder');

                    };

                    var fsm = StateMachine.create({
                        initial: {state: init, event: 'init', defer: true},

                        events: [
                            {name: 'takeOrder', from: 'none', to: 'ready'},
                            {name: 'takeOrder', from: 'ready', to: 'none'},
                            {name: 'Pickup', from: 'ready', to: 'deliver'},
                            {name: 'Pickup', from: 'deliver', to: 'ready'},
                            {name: 'finishOrder', from: 'deliver', to: 'done'},
                            {name: 'finishOrder', from: 'done', to: 'deliver'}
                        ],

                        callbacks: {
                            oninit: function (event, from, to, msg) {
                                isAvailable(msg);
                            },
                            ontakeOrder: function (event, from, to, msg) {
                                isAvailable(msg);
                            },
                            onPickup: function (event, from, to, msg) {
                                isAvailable(msg);
                            },
                            onfinishOrder: function (event, from, toe, msg) {
                                isAvailable(msg);
                            }
                        }
                    });

                    fsm.init(index);
                    return fsm
                };

                $scope.updateOrder = function (userId, id, delivermanId, currentState) {
                    var filter = $stateParams.deliver.id == id && delivermanId == undefined ? $stateParams.deliver.deliverId : delivermanId;
                    var power = {
                        Power: 'userAndDeliverMan',
                        userId: userId,
                        deliverManId: filter
                    };
                    var data = {
                        state: currentState,
                        deliverman: {"__type": "Pointer", "className": "_User", "objectId": filter || ''}
                    };
                    LeanCloudClassService.update('Order', data, id, function (data) {
                        $scope.after_update();
                        $scope.init();
                    }, power);
                };

                function deleteInfo(orderId, senderId, receiverId) {
                    return {
                        "requests": [
                            {
                                "method": "DELETE",
                                "path": "/1.1/classes/Order/" + orderId
                            },
                            {
                                "method": "DELETE",
                                "path": "/1.1/classes/SenderGeoLocation/" + senderId
                            },
                            {
                                "method": "DELETE",
                                "path": "/1.1/classes/ReceiverGeoLocation/" + receiverId
                            }
                        ]
                    }
                }

                $scope.deleteOrder = function (orderInfo, id) {

                    LeanCloudClassService.batch(deleteInfo(id, orderInfo.senderCoordinate.objectId, orderInfo.receiverCoordinate.objectId), function (data) {
                        document.getElementById(id).className += ' hide';
                        $scope.after_delete();
                    });
                };

                $scope.init = function () {
                    $scope.deliverName = [];
                    $q.all([$scope.getOrderInfo(), $scope.getAllDeliver()]).then(function (data) {
                        data[0].forEach(function (item, index) {
                            $scope.deliverName[index] = data[1];
                        })
                    });
                };
                $scope.init();


                $scope.changeSelectedValue = function () {
                    $timeout(function () {
                        if ($stateParams.deliver.id != undefined && document.getElementById($stateParams.deliver.id + $stateParams.deliver.name) != null) {

                            document.getElementById($stateParams.deliver.id + $stateParams.deliver.name).selected = "selected";
                        }

                        var coordinate = localStorage.get('currentScrollPosition') || {left: 0, top: 0};
                        $ionicScrollDelegate.scrollTo(coordinate.left, coordinate.top, false);
                        localStorage.set('currentScrollPosition', {left: 0, top: 0, zoom: 1});
                        localStorage.set('orderState', '1');
                    }, 10);
                };

                $scope.showOrderInfo = function (id) {
                    var name = document.getElementsByName(id + "_isShowOrderInfo");
                    for (var i = 0; i < name.length; i++) {
                        document.getElementsByName(id + "_isShowOrderInfo")[i].className += ' show';
                    }
                    $scope.is_admin = true;

                    document.getElementById(id + "isShowOrderInfo").className += ' hide';
                };

                $scope.changeOrderState = function (index, boolean, data, num) {
                    data.forEach(function (item) {
                        var state = 'state' + index;
                        if (boolean) {
                            item[state] = num;
                        } else {
                            item[state] = num - 1;
                        }
                    });
                    $scope.manageOrderInfo = data;
                };

                $scope.getScrollPosition = function () {
                    var delegate = $ionicScrollDelegate.$getByHandle('ScrollPosition');
                    localStorage.set('currentScrollPosition', delegate.getScrollPosition());
                };


            },
            template: ' <div> ' +
            '<label ng-if="is_admin" class="item item-select"><span>状态查询</span> ' +
            '<select ng-model="$parent.orderState" ng-change="init()"> ' +
            '<option value="1">新增订单</option> ' +
            '<option value="2">待分配订单</option> ' +
            '<option value="3">已分配</option> ' +
            '<option value="4">配送中</option> ' +
            '<option value="5">已完成</option> ' +
            '</select> ' +
            '</label> ' +
            '</div>' +
            '<ion-item id="{{x.objectId}}" delegate-handle="myScroll" ng-repeat="x in manageOrderInfo" repeat-end="changeSelectedValue()"> ' +
            '<div class="list card "> ' +
            '<form class="list ">' +
            '<label class="item item-input item-stacked-label">' +
            '<span class="input-label">发货地址</span>' +
            '<input type="text"  ng-readonly="true" ng-model="x.sender_address">' +
            '</label>' +
            '<label ng-class="{true: \'hide\', false: \'show\'}[is_admin]" class="item item-input item-stacked-label " name="{{x.objectId}}_isShowOrderInfo">' +
            ' <span class="input-label">发货电话</span>' +
            ' <input type="tel" ng-model="x.sender_phone" numbers-only placeholder="请输入收货电话" ng-readonly="true" >' +
            ' </label> ' +
            '<label class="item item-input item-stacked-label ">' +
            ' <span class="input-label">收货地址</span>' +
            '<input type="text" ng-readonly="true" ng-model="x.receiver_address">' +
            ' </label>' +
            '<div class="item show_order_info" ng-show="is_admin" id="{{x.objectId}}isShowOrderInfo">' +
            ' <a ng-click="showOrderInfo(x.objectId)" >展示详情</a>' +
            ' </div>' +
            '<label class="item item-input item-stacked-label " ng-class="{true: \'hide\', false: \'show\'}[is_admin]" name="{{x.objectId}}_isShowOrderInfo"> ' +
            '<span class="input-label">收货人</span> ' +
            '<input type="text" ng-readonly="true" ng-model="x.receiver_name"  placeholder="请输入收货人姓名">' +
            ' </label>' +
            ' <label class="item item-input item-stacked-label " ng-class="{true: \'hide\', false: \'show\'}[is_admin]" name="{{x.objectId}}_isShowOrderInfo">' +
            ' <span class="input-label">收货电话</span>' +
            ' <input type="tel" placeholder="请输入收货电话" numbers-only ng-readonly="true" ng-model="x.receiver_phone" >' +
            ' </label>' +
            '<label class="item item-input item-stacked-label " ng-class="{true: \'hide\', false: \'show\'}[is_admin]" name="{{x.objectId}}_isShowOrderInfo">' +
            ' <span class="input-label">截至日期</span>' +
            ' <input type="text" readonly="readonly" ng-model="x.cut_off_time.iso" placeholder="">' +
            ' </label> ' +
            ' <label class="item item-input item-stacked-label " ng-class="{true: \'hide\', false: \'show\'}[is_admin]" name="{{x.objectId}}_isShowOrderInfo">' +
            ' <span class="input-label">下单时间</span> ' +
            '<input type="text" readonly="readonly" ng-model="x.createdAt" placeholder="">' +
            '</label> <label class="item item-input item-stacked-label " ng-class="{true: \'hide\', false: \'show\'}[is_admin]" name="{{x.objectId}}_isShowOrderInfo">' +
            '<span class="input-label">运送费用(元)</span>' +
            '<input type="text" readonly="readonly" ng-model="x.deliverPrice" placeholder=""> ' +
            '</label>' +
            '<ion-toggle toggle-class="toggle-dark" ng-if="is_admin" ng-click="voluationState[$index].takeOrder($index)" ng-disabled="ready[$index]" ng-checked="x.currentState>=1">接单</ion-toggle>' +
            '<ion-toggle toggle-class="toggle-energized" ng-click="voluationState[$index].Pickup($index)" ng-disabled="deliver[$index]" ng-checked="x.currentState>=2">取货完成</ion-toggle>' +
            '<ion-toggle toggle-class="toggle-royal" ng-click="voluationState[$index].finishOrder($index)" ng-disabled="done[$index]" ng-checked="x.currentState>=3">送货完成</ion-toggle> ' +
            '<ion-toggle toggle-class="toggle-balanced" ng-if="is_admin" ng-click="getScrollPosition()" ng-model="sender_coordinate" ng-change="changeDeliverList(x,sender_coordinate,$index)">附近快递员</ion-toggle> ' +
            '<label class="item item-select " ng-if="is_admin"> <span class="input-label">选择快递员</span> ' +
            '<select ng-model="x.deliverman.objectId" >' +
            ' <option value="">---未选择---</option> <option ng-repeat="i in deliverName[$index]" id="{{x.objectId}}{{i.username}}" value="{{i.objectId}}" ng-selected="i.objectId == x.deliverman.objectId ? \'selected\' : \'\'">{{i.username}} </option> </select> ' +
            '</label>' +
            '<div class=" button-bar "> ' +
            '<button class=" button button-positive  button-block " ng-click="updateOrder(x.userId.objectId,x.objectId,x.deliverman.objectId,voluationState[$index].current)">更新 </button>' +
            ' <button class=" button button-assertive  button-block " ng-if="is_admin" ng-click="deleteOrder(x,x.objectId)">删除 </button>' +
            ' </div>' +
            '</form> ' +
            '</div> ' +
            '</ion-item>'
        }
    })
    .
    directive('nearby', function () {
        return {
            restrict: "EA",
            scope: {
                goToOrderManage: '&lastPage'
            },
            controller: function ($scope, $location, LeanCloudClassService, $ionicLoading, $timeout, localStorage, $state) {
                $scope.getDeliverInfo = function (order) {
                    var getFreeNearDeliverSql = "select * from _User where objectId  not in (select deliverman.objectId from Order where done = false)" +
                        " and type = 'deliverMan' and " +
                        "lastPosition near [" + order[0].geoPosition.longitude + "," + order[0].geoPosition.latitude + "] max 15 km";
                    LeanCloudClassService.sql(getFreeNearDeliverSql, function (data) {
                        $scope.deliverName = data;
                    });
                };

                function getLoginStatus() {
                    return localStorage.get('currentUser') != null && localStorage.get('currentUser').username != undefined;
                }

                $scope.address = localStorage.get('address');
                if ($scope.address) {

                    LeanCloudClassService.find('SenderGeoLocation', {where: {objectId: $scope.address.senderCoordinate.objectId}},
                        function (data) {
                            if (getLoginStatus()) {
                                $scope.getDeliverInfo(data);
                            }
                            localStorage.set('SenderAddress', data[0]);
                        });
                    LeanCloudClassService.find('ReceiverGeoLocation', {where: {objectId: $scope.address.receiverCoordinate.objectId}},
                        function (data) {
                            localStorage.set('ReceiverAddress', data[0]);
                        });
                }

                $ionicLoading.show({
                    content: 'Loading',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                $timeout(function () {
                    $ionicLoading.hide();
                    $scope.map();
                }, 2000);


                $scope.getDeliverManName = function (name, id, deliverId) {
                    $state.go('orderManage', {deliver: {name: name, id: id, deliverId: deliverId}});
                }
            },
            template: ' <ion-item class="item-icon-left dark item" data-componentid="list-item4" ng-click="goToOrderManage()"> ' +
            '<i class="icon ion-ios-arrow-left"></i>返回 ' +
            '</ion-item>' +
            '<div deliver-man-query>' +
            '<div id="allmap"></div> ' +
            '<label class="item item-input item-stacked-label" ng-click="getDeliverManName(i.username,address.objectId,i.objectId)" ng-repeat="i in deliverName" ng-init="theLocation(deliverName)">' +
            '<span class="input-label" >快递员：{{i.username}}</span>' +
            '</label></div>'
        }
    })
    .directive("repeatEnd", function () {
        return {
            restrict: "EA",
            link: function (scope, element, attrs) {
                if (scope.$last) {
                    scope.$eval(attrs.repeatEnd);
                }
            }
        };
    });



