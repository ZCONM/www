let init = require('./init')
let setTime = init.setTime
let longLine = require('./longLine')
let stup = require('./stup')
init.init()
// ------------------------------------
let $ = {
    https: require('axios'),
    schedule: require('node-schedule'),
    email: require('../getemail'),
    codeIDarr1: [],
    codeIDarr2: [],
    Sday: {},
    codeData: {},
    soaringMax: {},
    soaringMin: {},
    dayFlag: {},
    timeRQ: setTime(),
    timeSJ: {},
    maxValue: {},
    minValue: {},
    maxCurr: {},
    minCurr: {},
    MaxNumber: [],
    deal: {},
    ruleCurr: 0
}
// 初始化
$.schedule.scheduleJob('0 55 8 * * 1-5', function () {
    // 每日清空数据
    $.codeIDarr1 = [];
    $.codeIDarr2 = [];
    $.Sday = {};
    $.codeData = {};
    $.soaringMax = {};
    $.soaringMin = {};
    $.dayFlag = {};
    $.timeRQ = setTime();
    $.timeSJ = {};
    $.maxValue = {};
    $.minValue = {};
    $.maxCurr = {};
    $.minCurr = {};
    $.MaxNumber = [];
    $.deal = {};
    $.ruleCurr = 0;
});
function loading() {
    if ($.ruleCurr > 0) return
    console.log('loading');
    $.Sday = {};
    $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function (d) {
        console.log('stock/find');
        let arr1 = [], arr2 = [];
        for (let i = 0; i < d.data.length; i++) {
            let item = d.data[i];
            $.soaringMax[item.codeID] = 0;
            $.soaringMin[item.codeID] = 0;
            $.dayFlag[item.codeID] = 0;
            $.maxValue[item.codeID] = (item.max - Number(item.mean)) * 0.1;
            $.minValue[item.codeID] = (Number(item.mean) - item.min) * 0.1;
            $.maxCurr[item.codeID] = { nub: 0, arr: [] };
            $.minCurr[item.codeID] = { nub: 0, arr: [] };
            // if (item.codeID == 'sz300263') debugger
            if (item.status > 0) {
                item.status == 1 && arr1.push(item)
                item.status == 2 && arr2.push(item)
                $.codeData[item.codeID] = item;
                $.deal[item.codeID] = { up: 0, dow: 0 }
            }
        }
        $.codeIDarr1 = arr1
        $.codeIDarr2 = arr2
        gainCode();
    }).catch(function (err) {
        console.log(err);
    });
}
$.schedule.scheduleJob('* * 9-15 * * 1-5', function () {
    $.codeIDarr1.length > 0 || $.codeIDarr2.length > 0 ? gainCode() : loading();
    $.ruleCurr++
});

$.schedule.scheduleJob('5 30 15 * * 1-5', function () {
    console.log('执行任务setBOX');
    setBOX()
});

function gainCode() {
    if ($.ruleCurr % 5 == 0) {
        for (let i = 0; i < $.codeIDarr1.length; i++) {
            let item = $.codeIDarr1[i];
            console.log("解析股票代码长：", item.codeID)
            longLine(item.codeID, !!item.max, $);
            
        }
        for (let i = 0; i < $.codeIDarr2.length; i++) {
            let item = $.codeIDarr2[i];
            console.log("解析股票代码短：", item.codeID)
            stup(item.codeID, !!item.max, $);
        }
    }
}