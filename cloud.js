var AV = require('leanengine');
var OrderLog = AV.Object.extend('OrderLog');
var router = require('express').Router();
var http = require("http");
var query = new AV.Query('_User');
/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function (request, response) {
    response.success('Hello world!');
});

AV.Cloud.afterSave('Order', function (request) {
    console.log("距离：" + request.object._previousAttributes.deliverPrice + "公里");
    var todo = AV.Object.createWithoutData('Order', request.object.id);
    todo.set('deliverPrice', request.object._previousAttributes.deliverPrice * 10000 * 12 / 10000);
    todo.save();
});

function options() {
    return {
        "method": "GET",
        "hostname": "123.56.242.183",
        "port": "8082",
        "path": "/api/positions",
        "headers": {
            "authorization": "Basic YWRtaW46YWRtaW4=",
            "cache-control": "no-cache",
            "postman-token": "db24b66e-f057-f58d-29e7-82cbdb2a6c07"
        }
    }
}


AV.Cloud.define('UpdateDeviceGeoPosition', function (request, response) {
    var req = http.request(options(), function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function () {
            var body = JSON.parse(Buffer.concat(chunks).toString());
            body.push({
                "deviceId": 999,
                "fixTime": "2016-07-05T00:54:09.000+0000",
                "latitude": 39.997464,
                "longitude": 116.739665
            });
            body.push({
                "deviceId": 666,
                "fixTime": "2016-07-05T00:54:09.000+0000",
                "latitude": 39.949564,
                "longitude": 116.549249
            });
            getUpdateDeviceId(body);
        });
    });
    req.end();
    response.success();
});

function getUpdateDeviceId(body) {
    var updateInfo = {};

    body.forEach(function (item) {
        updateInfo[item.deviceId] = {
            deviceId: item.deviceId,
            lastLocateAt: {
                "__type": "Date",
                "iso": new Date(item.fixTime).toISOString()
            },
            lastPosition: {
                "__type": "GeoPoint",
                "latitude": item.latitude,
                "longitude": item.longitude
            }
        };
    });
    updatePosition(updateInfo);
}

function updatePosition(updateInfo) {
    query.find().then(function (results) {
        results.forEach(function (item) {
            if (updateInfo[item.attributes.deviceId]) {
                var updateUser = AV.Object.createWithoutData('_USer', item.id);
                updateUser.set('lastLocateAt', updateInfo[item.attributes.deviceId].lastLocateAt);
                updateUser.set('lastPosition', updateInfo[item.attributes.deviceId].lastPosition);
                updateUser.save().then(function (todo) {
                    //console.log(todo);
                }, function (error) {
                    console.log(error);
                });
            }
        });
    }, function (error) {
    });
}

function getTimeDifference(createdAt, ready, deliver) {
    var date = new Date().getTime() - createdAt.getTime();
    return Math.floor(date / 1000) - ready - deliver;
}

function updateState(object, request, state) {
    var order = AV.Object.createWithoutData('Order', request.object.id);
    var stateTime = getUpdateInfo(object, request, state);

    order.set('readyTimeCost', stateTime.ready);
    order.set('deliverTimeCost', stateTime.deliver);
    order.set('doneTimeCost', stateTime.done);
    if (state == 'done') {
        var totalTime = Math.floor((new Date().getTime() - request.object.createdAt.getTime()) / 1000);
        order.set('totalTimeCost', totalTime);
    } else {
        order.set('totalTimeCost', null);
    }
    order.save();
}

function getUpdateInfo(object, request, state) {
    var stateTime = {
        ready: object.readyTimeCost,
        deliver: object.deliverTimeCost,
        done: object.doneTimeCost
    };
    var allState = ['none', 'ready', 'deliver', 'done'],
        item = allState.indexOf(state);

    for (var i = 1; i < allState.length; i++) {
        if (i > item) {
            stateTime[allState[i]] = null;
        } else {
            stateTime[allState[item]] = getTimeDifference(request.object.createdAt, object.readyTimeCost || 0, object.deliverTimeCost || 0);
        }
    }
    return stateTime
}

AV.Cloud.afterUpdate('Order', function (request, response) {
    var beforeUpdateState = 'none';
    var orderLogQuery = new AV.Query('OrderLog');
    orderLogQuery.descending('createdAt');
    orderLogQuery.equalTo('orderId', {"__type": "Pointer", "className": "Order", "objectId": request.object.id});

    orderLogQuery.find().then(function (results) {
        var object = request.object._previousAttributes,
            state = object.state;
        if (results.length != 0) {
            beforeUpdateState = results[0].get('afterUpdateState');
        }

        if (beforeUpdateState === state) {
            return;
        }
        updateState(object, request, state);

        createOrderLog(request, beforeUpdateState, response);
    }, function (error) {
        response.error();
    });
});

function createOrderLog(request, beforeUpdateState, response) {
    var orderLog = new OrderLog();
    orderLog.set('orderId', {"__type": "Pointer", "className": "Order", "objectId": request.object.id});
    orderLog.set('beforeUpdateState', beforeUpdateState);
    orderLog.set('afterUpdateState', request.object._previousAttributes.state);

    orderLog.save().then(function (todo) {
        response.success();
    }, function (error) {
        console.log(error);
    });
}

module.exports = AV.Cloud;
