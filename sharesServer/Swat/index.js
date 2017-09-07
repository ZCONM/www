/**
 * Created by Administrator on 2017/5/14.
 */

//最小值
Array.prototype.min = function() {
	var min = Number(this[0]);
	var len = this.length;
	var nub = 0;
	for(var i = 1; i < len; i++) {
		if(this[i] != 0 && this[i] < min) {
			min = Number(this[i]);
			nub = i;
		}
	}
	return { min: min, nub: nub };
}
//最大值
Array.prototype.max = function() {
	var max = Number(this[0]);
	var len = this.length;
	var nub = 0;
	for(var i = 1; i < len; i++) {
		if(this[i] > max) {
			max = Number(this[i]);
			nub = i;
		}
	}
	return { max: max, nub: nub };
}
// 平均数
Array.prototype.sum = function(name) {
	var sum = 0;
    var len = this.length;
	if(typeof this[i] == 'object'){
		for(var i = 0; i < len; i++) {
			sum = sum + Number(this[i][name]);
		}
	}else{
		for(var i = 0; i < len; i++) {
			sum = sum + Number(this[i]);
		}
	}
	return sum / this.length;
}
// 格式化日期
function setTime() {
	var myDate =new Date();
    var y = myDate.getFullYear();
    var m = myDate.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = myDate.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
}
// -------------------------------------------------------------------------------------------
var https = require('axios');
var schedule = require('node-schedule');
var email = require('../getemail');
var codeIDarr = [];
var Sday = {};
var codeData = {};
var soaringMax = {};
var soaringMin = {};
var dayFlag = {};
var timeRQ = setTime();
var timeSJ = {};
var maxValue = {};
var minValue = {};

// 初始化
schedule.scheduleJob('0 55 8 * * 1-5', function() {
	// 每日清空数据
    codeIDarr = [];
    Sday = {};
    codeData = {};
    soaringMax = {};
    soaringMin = {};
    dayFlag = {};
    timeRQ = setTime();
    timeSJ = {};
    maxValue = {};
    minValue = {};
});
function loading() {
	console.log('loading');
    Sday = {};
    https.post('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function(d) {
    	console.log('stock/find');
        codeIDarr = d.data;
        for(var i = 0; i < codeIDarr.length; i++) {
            var item = codeIDarr[i];
            soaringMax[item.codeID] = 0;
            soaringMin[item.codeID] = 0;
            dayFlag[item.codeID] = 0;
            maxValue[item.codeID] = (item.max - Number(item.mean)) * 0.1;
            minValue[item.codeID] = (Number(item.mean) - item.min) * 0.1;
		}
        gainCode();
    }).catch(function (err) {
        console.log(err);
    });
}
// 开始记录今天的数据
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [1, 2, 3, 4, 5]; // 周
//rule.month = 3;	// 月
//rule.dayOfMonth = 1; // 日
rule.hour = [9, 10, 11, 12, 13, 14]; // 时
//rule.minute = [5,10,15,20,25,30,35,40,45,50,55,59]; // 分
rule.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] // 秒
schedule.scheduleJob(rule, function() {
    console.log('gainCodeTime');
    codeIDarr && codeIDarr.length>0 ? gainCode() : loading();
});

// 运行完一天数据后 计算创建箱子
var rules = new schedule.RecurrenceRule();
rules.dayOfWeek = [1, 2, 3, 4, 5]; // 周
rules.hour = 15; // 时
rules.minute = 5; // 分
rules.second = 0; // 秒
schedule.scheduleJob(rules, function() {
	console.log('执行任务setBOX');
	setBOX()
});


function gainCode() {
	console.log('gainCode', 1);
	if(codeIDarr){
		console.log('gainCode', 2);
		for(var i = 0; i < codeIDarr.length; i++) {
            console.log('gainCode', 3);
			var item = codeIDarr[i];
			console.log("解析股票代码：", item.codeID)
			setURL(item.codeID, !!item.max);
			codeData[item.codeID] = item;
		}
    }else{
        loading()
	}
}
/*---------------------------------------------------测试-------------------------------------------------------------
(function (code,timeRQ){
    https.post('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function(d) {
        codeIDarr = d.data;
        for(var i = 0; i < codeIDarr.length; i++) {
            var item = codeIDarr[i];
            codeData[item.codeID] = item;
        }
	});
    https.get('http://127.0.0.1:9999/HamstrerServlet/stockAll/find?'+'daima='+code+'&timeRQ='+timeRQ).then(function(res) {
        var data = res.data;
        data.forEach(function (item, i) {
            if (Sday[code]) {
                Sday[code].push(item.dangqianjiage);
            } else {
                Sday[code] = [];
                Sday[code].push(item.dangqianjiage);
            }
            calculatingData(code)
        });
    });
})('sz002232','2017-06-26')
/*---------------------------------------------------测试end-------------------------------------------------------------*/
function setURL(code,flag) {
	https.get('http://hq.sinajs.cn/list=' + code,{
		'responseType': 'text/plain;charset=utf-8',
		'header': 'text/plain;charset=utf-8'
	}).then(function(res) {
		var data = res.data.split(',');
        if (Number(data[3]) == 0){
            return
        }
		var nub=Number(data[3]);
		if (Sday[code]) {
            Sday[code].push(nub);
		} else {
			Sday[code] = [];
            Sday[code].push(nub);
		}
		var name = data[0].split('"')[1]+'['+code+']';
		var str = {
			'name': name,
			'daima': code,
			'dangqianjiage': Number(data[3]),
			'timeRQ': data[30],
			'timeSJ': data[31]
		};
		timeRQ = data[30];
		Number(data[3]) > 0 && !timeSJ[code+data[30]+data[31]] && https.post('http://127.0.0.1:9999/HamstrerServlet/stockAll/add', str).then(function (message){
            console.log(code + ':存储最新价格'+nub.toFixed(2)+'!');
            timeSJ[code+data[30]+data[31]]=true
		}).catch(function(err) {
			console.log(err);
		});
        Number(data[3]) > 0 && flag && calculatingData(code, data[0].split('"')[1]);
	});
}
function calculatingData(code, name) {
    console.log(code + ':分析价格!');
	if(Sday[code].length > 0) {
		var length = Sday[code].length - 1;
		var mean = Sday[code].sum();
		var newest = Sday[code][length];
		var max = Sday[code].max();
		var min = Sday[code].min();
		var item = codeData[code];
        var maxSum=item && item.maxData ? [item.maxData.max().max,item.maxData.min().min].sum() : 0;
        var minSum=item && item.minData ? [item.minData.max().max,item.minData.min().min].sum() : 0;
        var isMax = (((max.max - mean) * 0.9) + mean) > (max.max - maxValue[code]) ? (((max.max - mean) * 0.9) + mean) : (max.max - maxValue[code]);
        var isMin = (mean - ((mean - min.min) * 0.9)) < (min.min + minValue[code]) ? (mean - ((mean - min.min) * 0.9)) : (min.min + minValue[code]);
        console.log('isMax-all',(((max.max - mean) * 0.9) + mean),(max.max - maxValue[code]),isMax);
        console.log('isMin-all',(mean - ((mean - min.min) * 0.9)),(min.min + minValue[code]),isMin);
		console.log('max：',newest > maxSum, Sday[code].max().nub == Sday[code].length-1,'min:',newest < item.minData.sum(),Sday[code].min().nub == Sday[code].length-1);
		console.log('length:',length)
		if(newest > maxSum) {
			if(max.nub == length && soaringMax[code] == 0) {
				emailGet('851726398@qq.com,zhangcong27@huawei.com', codeData[code].name + '[' + code + ']:今日飙升中', '当前价：' + Sday[code][length].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2));
				soaringMax[code] = 1;
			} else if(soaringMax[code] == 1 && newest < (isMax < max.max - 0.03 ? isMax : max.max - 0.03)) {
				emailGet('851726398@qq.com,zhangcong27@huawei.com', codeData[code].name + '[' + code + ']:回降中', '当前价：' + Sday[code][length].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2));
				soaringMax[code] = 0;
			}
		} else if(newest < minSum) {
			if(min.nub == length && soaringMin[code] == 0) {
				emailGet('851726398@qq.com,zhangcong27@huawei.com', codeData[code].name + '[' + code + ']:今日下降中', '当前价：' + Sday[code][length].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2));
                soaringMin[code] = 1;
			} else if(soaringMin[code] == 1 && newest > isMin) {
				emailGet('851726398@qq.com,zhangcong27@huawei.com', codeData[code].name + '[' + code + ']:回升中', '当前价：' + Sday[code][length].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2));
                soaringMin[code] = 0;
			}
		}
		// else {
		// 	if(dayFlag[code] = 0 && max.nub == length){
         //        emailGet('851726398@qq.com,zhangcong27@huawei.com', codeData[code].name + '[' + code + ']:今日最高价', '当前价：' + newest);
         //        dayFlag[code] = 1;
         //    } else if(dayFlag[code] = 0 && min.nub == length){
         //        emailGet('851726398@qq.com,zhangcong27@huawei.com', codeData[code].name + '[' + code + ']:今日最低价', '当前价：' + newest);
         //        dayFlag[code] = 1;
         //    } else if (((max.max - mean) * 0.5) + mean > newest && newest > mean - ((mean - min.min) * 0.5)){
         //        dayFlag[code] = 0;
         //    }
		// }
	}
}
// 发送邮件
function emailGet(to, tit, text) {
	email.send(to, tit, text, function(err, info) {
		if(err) {
			console.log(err);
			return;
		}
		console.log('邮件:', tit);
	})
}
// setBOX()
// timeRQ = '2017-08-02'
function setBOX() {
	https.get('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function(d) {
		for(var i = 0; i < d.data.length; i++) {
			var item = d.data[i];
			getData(item);
		}
	})

	function getData(item) {
		https.get('http://127.0.0.1:9999/HamstrerServlet/stockAll/find?'+'daima='+item.codeID+'&timeRQ='+timeRQ).then(function(res) {
			var data = res.data;
			var arrData = [];
			var sum = 0;
			data.forEach(function(item, i) {
				arrData.push(item.dangqianjiage);
				sum = sum + Number(item.dangqianjiage)
			});

			var size = arrData.length;
			var mean = sum / size;
			var max = arrData.max();
			var min = arrData.min();
			var maxSection = [];
			var maxData = [];
			var minData = [];

			function maxJudgeAdd(arrData, nub) {
				var i = 0,
					n = 0,
					arr = [];
				for(i = 0; i < size; i++) {
					if(arrData[i] > mean) {
						arr.push(arrData[i])
					} else if(arr.length > 1) {
						maxData.push(arr.max().max)
						arr = [];
					}
				}
                if(arr.length > 1) {
                    maxData.push(arr.max().max)
                    arr = [];
                }
			}

			function maxJudgeMinus(arrData) {
				var i = 0,
					n = 0,
					arr = [];
				for(i = 0; i < size; i++) {
					if(arrData[i] < mean) {
						arr.push(arrData[i])
					} else if(arr.length > 1) {
						minData.push(arr.min().min)
						arr = [];
					}
				}
                if(arr.length > 1) {
                    minData.push(arr.min().min)
                    arr = [];
                }
			}
			maxJudgeAdd(arrData);
			maxJudgeMinus(arrData);
			if(minData.length<2) {minData=[];minData.push(min.min);minData.push(mean)}
            if(maxData.length<2) {maxData=[];maxData.push(max.max);maxData.push(mean)}
			var obj = { minData: minData, maxData: maxData, max: max.max + '', min: min.min + '', mean: mean + '',timeRQ: timeRQ };
			https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit', { where: { codeID: item.codeID},id:{'_id': item['_id'] }, setter: obj }).then(function(res) {
				console.log('成功');
			}).catch(function(err) {
				console.log(err);
			})
		}).catch(function(err) {
			console.log(err);
		})
	}
}
console.log("已开启统计计算服务！！");

