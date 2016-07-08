/**
 * Created by liu on 16-5-29.
 */
appDirectives
    .directive('mapAddress', function () {
        return {
            controller: function ($element, $scope, localStorage) {
                function getElementById(id) {
                    return document.getElementById(id);
                }

                var map = new BMap.Map("map");
                map.centerAndZoom("北京", 12);
                var mapId = new BMap.Autocomplete({"input": $element[0].id, "location": map});

                getElementById($element[0].id).addEventListener('blur', function () {
                    setPlace(getElementById($element[0].id).value, $element[0].id)
                });

                function setPlace(myValue, addressName) {
                    function myFun() {
                        if (local.getResults().getPoi(0) == undefined) {
                            alert('地址错误');
                            getElementById($element[0].id).value = '';
                            return
                        }
                        var pp = local.getResults().getPoi(0).point;

                        localStorage.set(addressName, pp);

                        map.centerAndZoom(pp, 18);
                        map.addOverlay(new BMap.Marker(pp));
                    }

                    var local = new BMap.LocalSearch(map, {
                        onSearchComplete: myFun
                    });
                    if (myValue != '') {
                        local.search(myValue);
                    }
                }
            }
        };
    })
    .directive('deliverManQuery', function () {
        return {
            controller: function ($element, localStorage, $scope) {
                var map = new BMap.Map("allmap");
                $scope.map = function() {
                    var sender_address = localStorage.get('SenderAddress') || {};
                    var receiver_address = localStorage.get('ReceiverAddress') || {};
                    map.centerAndZoom(new BMap.Point(sender_address.geoPosition.longitude, sender_address.geoPosition.latitude), 11.5);
                    map.enableScrollWheelZoom(true);

                    if (sender_address && receiver_address) {
                        var sender = new BMap.Point(sender_address.geoPosition.longitude, sender_address.geoPosition.latitude),
                            receiver = new BMap.Point(receiver_address.geoPosition.longitude, receiver_address.geoPosition.latitude);
                        var driving = new BMap.DrivingRoute(map, {renderOptions: {map: map, autoViewport: false}});
                        driving.search(sender, receiver);
                    }
                };
                $scope.theLocation = function (data) {
                    map.clearOverlays();
                    data.forEach(function (item) {
                        var new_point = new BMap.Point(item.lastPosition.longitude, item.lastPosition.latitude);
                        var marker = new BMap.Marker(new_point);
                        map.addOverlay(marker);
                    });
                };
            }
        }
    });

