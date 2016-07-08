/**
 * Created by liu on 16-6-6.
 */
appServices
    .factory("TextAnalysisHeaders", function (localStorage) {
        var timestamp = (new Date()).valueOf();
        var sign = md5(timestamp + "RwnwgXatT9r26LWN2IRJz0bw");
        return {
            headers: function () {
                return {
                    headers: {
                        "X-LC-Id": "TdgH827olWojXWNIW78aNJOB-gzGzoHsz",
                        "X-LC-Sign": sign + ',' + timestamp,
                        "Content-Type": "application/json; charset=utf-8"
                    }
                }

            }
        };
    }).factory('TextAnalysisAPI', function ($location) {
        var getAPI = function (type) {
            switch (type) {
                case "keyword" :
                    return $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/keyword";
                case "participle" :
                    return $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/participle";
                case  "abstract" :
                    return $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/abstract";
            }
            return false;
        };
        return {
            getAPI: getAPI
        }
    }).factory('TextAnalysisService', function ($http, TextAnalysisAPI, TextAnalysisHeaders) {
        return {
            keyword: function (text, cb) {
                cb = cb || function () {
                    };
                $http.post(TextAnalysisAPI.getAPI("keyword"), {textInfo: text}, TextAnalysisHeaders.headers())
                    .success(function (data) {
                        cb(JSON.parse(data));
                        console.log(JSON.parse(data))
                    })
            },
            participle: function (text, cb) {
                cb = cb || function () {
                    };
                $http.post(TextAnalysisAPI.getAPI("participle"), {textInfo: text}, TextAnalysisHeaders.headers())
                    .success(function (data) {
                        cb(JSON.parse(data));
                        console.log(JSON.parse(data))
                    })
            },
            abstract: function (text, cb) {
                cb = cb || function () {
                    };
                $http.post(TextAnalysisAPI.getAPI("abstract"), {textInfo: text}, TextAnalysisHeaders.headers())
                    .success(function (data) {
                        cb(JSON.parse(data));
                        console.log(JSON.parse(data))
                    })
            }
        }
    });