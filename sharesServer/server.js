var _ = require('underscore');
var vm = require('vm');  
var fs = require('fs');  
var journey = require('journey');  
var async = require('async');  
var dbutil = require('./dbutil');
var querystring = require('querystring');
var express = require('express');
var bodyParser = require('body-parser') 
var mongoose = require('./set-server.js');
var Schema = mongoose.Schema;
var app = express();
var MyList={};
String.prototype.replaceAll = function(s1, s2) {  
    var demo = this;
    while (demo.indexOf(s1) != - 1)  
    demo = demo.replace(s1, s2);  
    return demo;  
}
function isEmptyObject(e) {  
    var t;  
    for (t in e)  
        return !1;  
    return !0  
}
app.get('/HamstrerServlet/*', function(req, res){
    // console.log('url:',req.url);
    var data = req.query;
    // console.log('data:',data);
    var stockName = req.url.replaceAll("/HamstrerServlet/", "").split("/")[0];
    var sandbox = {  
        req: req,  
        res: res,
        async: async,
        data: data,
        stockName: stockName,
        mongoose: mongoose,
        Schema: Schema,
        MyList: MyList,
        console: console
    };
    var url = req.url.split('?')[0];
    fs.readFile('.' + url + '.js', function(err, fileData) {
    	console.log(fileData);
        vm.runInNewContext(fileData, sandbox, 'myfile.vm');
    });
});
var jsonParser = bodyParser.json()
app.post('/HamstrerServlet/*', jsonParser, function(req, res){
    // console.log('url:',req.url);
    // console.log('data:',req.body)
    var body = '', jsonStr = '';
    if (req.body) {
        //能正确解析 json 格式的post参数
        jsonStr = req.body;
    } else {
        //不能正确解析json 格式的post参数
        req.on('data', function (chunk) {
            body += chunk; //读取参数流转化为字符串
        });
        req.on('end', function () {
            //读取参数流结束后将转化的body字符串解析成 JSON 格式
            try {
                jsonStr = JSON.parse(body);
            } catch (err) {
                jsonStr = '';
            }
        });
    }
    var stockName = req.url.replaceAll("/HamstrerServlet/", "").split("/")[0];
    var sandbox = {  
        req: req,  
        res: res,
        async: async,
        data: jsonStr,
        stockName: stockName,
        mongoose: mongoose,
        Schema: Schema,
        MyList: MyList,
        console: console
    };
    fs.readFile('.' + req.url + '.js', function(err, fileData) {
        vm.runInNewContext(fileData, sandbox, 'myfile.vm');
    });
});  
app.listen(9999); 
console.log('http://127.0.0.1:9999');