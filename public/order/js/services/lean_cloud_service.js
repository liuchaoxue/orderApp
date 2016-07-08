/**
 * Created by liu on 16-5-24.
 */
appServices
    .factory("LeanCloudHeaders", function (localStorage) {
        var timestamp = (new Date()).valueOf();
        var sign = md5(timestamp + "RwnwgXatT9r26LWN2IRJz0bw");
        return {
            headers: function () {
                return {
                    headers: {
                        "X-LC-Id": "TdgH827olWojXWNIW78aNJOB-gzGzoHsz",
                        "X-LC-Sign": sign + ',' + timestamp,
                        "X-LC-Session": localStorage.get('currentUser') == null ? '' : localStorage.get('currentUser').sessionToken,
                        "Content-Type": "application/json"
                    }
                }

            }
        };
    }).factory('LeanCloudAPI', function ($location) {
        var HOST = 'https://api.leancloud.cn';

        var getAPI = function (type) {
            switch (type) {
                case "api" :
                    return HOST + "/1.1/classes";

                case "login" :
                    return HOST + "/1.1/login";

                case 'sql' :
                    return HOST + "/1.1/cloudQuery";

                case 'batch' :
                    return HOST + "/1.1/batch"
            }
            return false;
        };
        return {
            getAPI: getAPI
        }
    }).factory('ClassPower', function (localStorage) {

        return {
            onlyOwn: function () {
                var powerInfo = {"role:admin": {"read": true, "write": true}};
                powerInfo[localStorage.get('currentUser').objectId] = {
                    "read": true, "write": true
                };
                return powerInfo
            },
            userAndDeliverMan: function (delivermanId, id) {
                var userPower = {"role:admin": {"read": true, "write": true}};
                userPower[id] = {
                    "read": true, "write": true
                };
                if (delivermanId != undefined && delivermanId != '') {
                    userPower[delivermanId] = {
                        "read": true, "write": true
                    }
                }
                return userPower
            }
        }
    }).factory('LeanCloudClassService', function ($http, LeanCloudAPI, LeanCloudHeaders, $filter, localStorage, ClassPower) {

        function dateFormat(data) {
            data.forEach(function (item) {
                for (var key in item) {
                    if (key == "createdAt" || key == "updatedAt") {
                        item[key] = $filter('date')(item[key], "yyyy-MM-dd HH:mm:ss");
                    }

                    if (item[key] != null && typeof(item[key]) == 'object' && item[key].iso) {
                        item[key].iso = $filter('date')(item[key].iso, "yyyy-MM-dd HH:mm:ss");
                    }
                }
            });
            return data
        }

        function handel_where(data) {
            var where_sql = '?';
            for (var key in data) {
                if (where_sql != '?') {
                    where_sql += "&"
                }
                if (typeof data[key] == 'object' && data[key]) {
                    var item = encodeURIComponent(JSON.stringify(data[key]))
                } else {
                    var item = encodeURIComponent((data[key]))
                }
                where_sql += key + '=' + item
            }
            return where_sql
        }


        return {
            sql: function (sql, cb) {
                $http.get(LeanCloudAPI.getAPI('sql') + "?cql=" + encodeURIComponent(sql), LeanCloudHeaders.headers())
                    .success(function (data) {
                        cb(dateFormat(data.results))
                    })
            },
            create: function (className, data, cb, power) {
                cb = cb || function () {
                    };
                power = power || {Power: 'onlyOwn'};
                data.ACL = ClassPower[power.Power]();
                $http.post(LeanCloudAPI.getAPI('api') + '/' + className, data, LeanCloudHeaders.headers())
                    .success(function (data) {
                        cb(data);
                    })
                    .error(function () {
                        alert('存储错误')
                    })
            },

            batch: function (data, cb, power) {
                cb = cb || function () {
                    };
                power = power || {Power: 'onlyOwn'};
                data.requests.forEach(function (item) {
                    if(item.method == 'POST') {
                        item.body.ACL = ClassPower[power.Power]();
                    }
                });
                $http.post(LeanCloudAPI.getAPI('batch'), data, LeanCloudHeaders.headers())
                    .success(function (data) {
                        cb(data);
                    })
                    .error(function () {
                        alert('存储错误')
                    })
            },

            find: function (className, limit, cb) {
                cb = cb || function () {
                    };
                $http.get(LeanCloudAPI.getAPI('api') + '/' + className + handel_where(limit), LeanCloudHeaders.headers())
                    .success(function (data) {
                        cb(dateFormat(data.results))
                    });
            },

            delete: function (className, id, cb) {
                cb = cb || function () {
                    };
                $http.delete(LeanCloudAPI.getAPI('api') + '/' + className + '/' + id, LeanCloudHeaders.headers())
                    .success(function (data) {
                        cb(data);
                    })
                    .error(function () {
                        alert('删除错误，未能删除！')
                    })
            },

            update: function (className, data, id, cb, power) {
                cb = cb || function () {
                    };
                power = power || {Power: 'onlyOwn'};
                data.ACL = ClassPower[power.Power](power.deliverManId, power.userId);

                $http.put(LeanCloudAPI.getAPI('api') + '/' + className + '/' + id, data, LeanCloudHeaders.headers())
                    .success(function (data) {
                        cb(data)
                    })
                    .error(function () {
                        alert('更新错误')
                    });
            }
        }
    }).factory('UserLoginService', function ($http, LeanCloudAPI, LeanCloudHeaders) {
        return {
            login: function (username, password, cb) {
                $http.get(LeanCloudAPI.getAPI("login") + '?username=' + username + '&password=' + password, LeanCloudHeaders.headers())
                    .success(function (data) {
                        cb(data)
                    }).error(function () {
                        alert("登录失败！")
                    });
            }
        }
    });
