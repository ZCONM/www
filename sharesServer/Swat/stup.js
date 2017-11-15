let email = require('../getemail');
module.exports = function (code, flag, $) {
  $.https.get('http://hq.sinajs.cn/list=' + code, {
        'responseType': 'text/plain;charset=utf-8',
        'header': 'text/plain;charset=utf-8'
    }).then(res => {
        let data = res.data.split(',');
        if (Number(data[3]) == 0) {
            return
        }
        let nub = Number(data[3]);
        if ($.Sday[code]) {
          $.Sday[code].push(nub);
        } else {
          $.Sday[code] = [];
          $.Sday[code].push(nub);
        }
        let name = data[0].split('"')[1] + '[' + code + ']';
        let str = {
            'name': name,
            'daima': code,
            'dangqianjiage': Number(data[3]),
            'timeRQ': data[30],
            'timeSJ': data[31]
        };
        $.timeRQ = data[30];
        if (Number(data[3]) > 0 && !$.timeSJ[code + data[30] + data[31]]) {
          $.timeSJ[code + data[30] + data[31]] = true
          $.https.post('http://127.0.0.1:9999/HamstrerServlet/stockAll/add', str).then(function (message) {
              console.log(code + ':存储最新价格' + nub.toFixed(2) + '!');
          }).catch(function (err) {
              console.log(err);
          });
        }
        Number(data[3]) > 0 && flag && calculatingData(code, data[0].split('"')[1]);
    });
    function calculatingData(code, name) {
      console.log(code + ':分析价格!');
      if ($.Sday[code].length > 0) {
          let lengths = $.Sday[code].length - 1;
          let mean = $.Sday[code].sum();
          let newest = $.Sday[code][lengths];
          let max = $.Sday[code].max();
          let min = $.Sday[code].min();
          let currDay = Number($.Sday[code][0]);
          let item = $.codeData[code];
          let maxSum = item && item.maxData ? [item.maxData.max().max, item.maxData.min().min].sum() : 0;
          let minSum = item && item.minData ? [item.minData.max().max, item.minData.min().min].sum() : 0;
          let isMax = (((max.max - mean) * 0.9) + mean) > (max.max - $.maxValue[code]) ? (((max.max - mean) * 0.9) + mean) : (max.max - $.maxValue[code]);
          let isMin = (mean - ((mean - min.min) * 0.9)) < (min.min + $.minValue[code]) ? (mean - ((mean - min.min) * 0.9)) : (min.min + $.minValue[code]);
          console.log('isMax-all', (((max.max - mean) * 0.9) + mean), (max.max - $.maxValue[code]), isMax);
          console.log('isMin-all', (mean - ((mean - min.min) * 0.9)), (min.min + $.minValue[code]), isMin);
          console.log('max：', newest > maxSum, $.Sday[code].max().nub == $.Sday[code].length - 1, 'min:', newest < item.minData.sum(), $.Sday[code].min().nub == $.Sday[code].length - 1);
          console.log('length:', lengths)
          $.maxCurr[code].arr[0] || ($.maxCurr[code].arr[0] = maxSum)
          $.minCurr[code].arr[0] || ($.minCurr[code].arr[0] = minSum)
          let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
          let toEmail = code == 'sh600335' ? '423642318@qq.com' : '851726398@qq.com'
          if (newest > maxSum) {
              if (max.nub == lengths && $.soaringMax[code] == 0 && max.max > ($.maxCurr[code].arr[$.maxCurr[code].arr.length - 1] + $.maxCurr[code].nub)) {
                  emailGet(toEmail, $.codeData[code].name + '[' + code + ']:今日飙升中', '当前价：' + $.Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2) + ';上行：' + maxSum.toFixed(2) + ';上压：' + $.maxCurr[code].nub);
                  $.soaringMax[code] = 1;
                  $.minCurr[code].nub = 0;
              } else if ($.soaringMax[code] == 1 && newest < (isMax < max.max - 0.03 ? isMax : max.max - 0.03)) {
                  $.deal[item.codeID] && $.deal[item.codeID].up++
                  emailGet(toEmail, $.codeData[code].name + '[' + code + ']:回降中', '当前价：' + $.Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最高：' + max.max.toFixed(2) + ';上行：' + maxSum.toFixed(2) + nubMon);
                  $.soaringMax[code] = 0;
                  $.maxCurr[code].nub = $.maxCurr[code].nub + mathNumber($.maxCurr[code].nub);
                  $.maxCurr[code].arr.push(max.max)
              }
          } else if (newest < minSum) {
              if (min.nub == lengths && $.soaringMin[code] == 0 && min.min < ($.minCurr[code].arr[$.minCurr[code].arr.length - 1] - $.minCurr[code].nub)) {
                  let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
                  emailGet('851726398@qq.com', $.codeData[code].name + '[' + code + ']:清仓', '当前价：' + $.Sday[code][$.Sday[code].length - 1].toFixed(2) + nubMon);
                  $.soaringMin[code] = 1;
                  $.maxCurr[code].nub = 0
              } else if ($.soaringMin[code] == 1 && newest > (isMin > min.min + 0.03 ? isMin : min.min + 0.03)) {
                  $.deal[item.codeID] && $.deal[item.codeID].dow++
                  $.soaringMin[code] = 0;
                  $.minCurr[code].nub = $.minCurr[code].nub + mathNumber($.minCurr[code].nub);
                  $.minCurr[code].arr.push(max.max)
              }
          }
          function mathNumber(val) {
              if (val < 0.05) {
                  return 0.05
              } else if (val < 0.09) {
                  return 0.04
              } else if (val < 0.12) {
                  return 0.03
              } else if (val < 0.14) {
                  return 0.02
              } else {
                  return 0.01
              }
          }
      }
    }
}

// 发送邮件
function emailGet(to, tit, text) {
  email.send(to, tit, text, function (err, info) {
      if (err) {
          console.log(err);
          return;
      }
      console.log('邮件:', tit);
  })
}

module.exports.endEmail = function ($) {
    for (let item in $.codeIDarr2) {
        if ($.codeIDarr2[item].codeID) {
            let code = $.codeIDarr2[item].codeID;
            let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
            emailGet('851726398@qq.com', $.codeData[code].name + '[' + code + ']:清仓', '当前价：' + $.Sday[code][$.Sday[code].length - 1].toFixed(2) + nubMon);
        }
    }
}