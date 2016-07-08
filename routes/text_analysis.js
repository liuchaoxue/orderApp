/**
 * Created by liu on 16-6-15.
 */
'use strict';
var router = require('express').Router();
var http = require("http");

function options(path) {
    return {
        "method": "POST",
        "hostname": "api.bosonnlp.com",
        "port": null,
        "path": path,
        "headers": {
            "content-type": "text/plain",
            "accept": "application/json",
            "x-token": "M2o-JT_x.8206.ock-E0c0DdaD",
            "cache-control": "no-cache"
        }
    };
}

function textAnalysisResults(res, path, content, cb) {
    var option = options(path);

    var postReq = http.request(option, function (postRes) {
        var chunks = [];
        postRes.on("data", function (chunk) {
            chunks.push(chunk);
        });

        postRes.on("end", function () {
            var body = Buffer.concat(chunks);
            cb(body.toString());
        });
    });

    postReq.write(JSON.stringify(content));
    postReq.end();
}

router.post('/keyword', function (req, res, next) {
    var content = req.body.textInfo;
    textAnalysisResults(res, "/keywords/analysis", content, function (data) {
        res.send(JSON.stringify(data));
    });
});

router.post('/participle', function (req, res, next) {
    var content = req.body.textInfo;
    textAnalysisResults(res, "/tag/analysis?space_mode=0&oov_level=3&t2s=0&=&special_char_conv=0", content, function (data) {
        res.send(JSON.stringify(data));
    });
});

router.post('/abstract', function (req, res, next) {
    var content = req.body.textInfo;
    textAnalysisResults(res, "/summary/analysis", {
        not_exceed: 0,
        percentage: 0.2,
        title: '',
        content: content
    }, function (data) {
        res.send(JSON.stringify(datea));
    });
});

module.exports = router;