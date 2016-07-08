'use strict';
var AV = require('leanengine');

AV.init({
  appId: 'TdgH827olWojXWNIW78aNJOB-gzGzoHsz',
  appKey: 'RwnwgXatT9r26LWN2IRJz0bw',
  masterKey: 'XYqxT7dKubhNeWN2TMISsskw'
});

// 如果不希望使用 masterKey 权限，可以将下面一行删除
AV.Cloud.useMasterKey();

var app = require('./app');

// 端口一定要从环境变量 `LEANCLOUD_APP_PORT` 中获取。
// LeanEngine 运行时会分配端口并赋值到该变量。
var PORT = parseInt(process.env.LEANCLOUD_APP_PORT || 3000);
app.listen(PORT, function () {
  console.log('Node app is running, port:', PORT);
});
