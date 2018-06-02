let email = require('../getemail');
let flagCode = {};
module.exports = function (code, flag, $) {
  $.https.get('http://hq.sinajs.cn/list=' + (code.indexOf('hk') === -1 ? code : 'rt_' + code), {
        'responseType': 'text/plain;charset=utf-8',
        'header': 'text/plain;charset=utf-8'
    }).then(res => {
        let data = res.data.split('=')[1].split('"').join('').split(';').join('').split(',');
        let [
        temp1, // 股票名称
        temp2, // 今日开盘价
        temp3, // 昨日收盘价
        temp4, // 现价（股票当前价，收盘以后这个价格就是当日收盘价）
        temp5, // 最高价
        temp6, // 最低价
        temp7, // 日期
        temp8 // 时间
        ] = code.indexOf('hk') === -1 ? [
        data[0],
        data[1],
        data[2],
        data[3],
        data[4],
        data[5],
        data[30],
        data[31]
        ] : [
        data[1],
        data[2],
        data[3],
        data[6],
        data[4],
        data[5],
        data[17],
        data[18]
        ]
        if (Number(temp4) == 0) {
            return
        }
        let nub = Number(temp4);
        if ($.Sday[code]) {
          $.Sday[code].push(nub);
        } else {
          $.Sday[code] = [];
          $.Sday[code].push(nub);
        }
        let name = temp1 + '[' + code + ']';
        let str = {
            'name': name,
            'daima': code,
            'dangqianjiage': Number(temp4),
            'timeRQ': temp7,
            'timeSJ': temp8
        };
        $.timeRQ = temp7;
        if (Number(temp4) > 0 && !$.timeSJ[code + temp7 + temp8]) {
          $.timeSJ[code + temp7 + temp8] = true
          $.https.post('http://127.0.0.1:9999/HamstrerServlet/stockAll/add', str).then(function (message) {
            //   console.log(code + ':存储最新价格' + nub.toFixed(2) + '!');
          }).catch(function (err) {
              console.log(err);
          });
        }
        if ((Number(temp4) - Number(temp3)) / Number(temp3) < -0.04) { // !statusFlag($.codeData[code]['K-Lin'])
            console.log(code + '检测行情跌势超4%暂停交易', temp4, temp3, (Number(temp4) - Number(temp3)) / Number(temp3));
            if (!flagCode[code]) {
                let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span><p>检测行情跌势超4%</p>';
                emailGet('851726398@qq.com', $.codeData[code].name + '[' + code + ']:清仓', nubMon);
                flagCode[code] = true
            }
            return
        }
        flagCode[code] = false
        Number(temp4) > 0 && flag && calculatingData(code, temp1);
    });
    function calculatingData(code, name) {
    //   console.log(code + ':分析价格!');
      if ($.Sday[code].length > 0) {
          let lengths = $.Sday[code].length - 1;
          let mean = $.Sday[code].sum();
          let newest = $.Sday[code][lengths];
          let max = $.Sday[code].max();
          let min = $.Sday[code].min();
          let currDay = Number($.Sday[code][0]);
          let item = $.codeData[code];
          let maxSum = item && item.maxData ? [item.maxData.max().max, item.maxData.min().min].sum() : 0;
          maxSum += item.mean - mean
          let minSum = item && item.minData ? [item.minData.max().max, item.minData.min().min].sum() : 0;
          minSum += item.mean - mean
          let isMax = (((max.max - mean) * 0.9) + mean) > (max.max - $.maxValue[code]) ? (((max.max - mean) * 0.9) + mean) : (max.max - $.maxValue[code]);
          let isMin = (mean - ((mean - min.min) * 0.9)) < (min.min + $.minValue[code]) ? (mean - ((mean - min.min) * 0.9)) : (min.min + $.minValue[code]);
        //   console.log('isMax-all', (((max.max - mean) * 0.9) + mean), (max.max - $.maxValue[code]), isMax);
        //   console.log('isMin-all', (mean - ((mean - min.min) * 0.9)), (min.min + $.minValue[code]), isMin);
          console.log('max：', newest > maxSum, $.Sday[code].max().nub == $.Sday[code].length - 1, 'min:', newest < item.minData.sum(), $.Sday[code].min().nub == $.Sday[code].length - 1);
        //   console.log('length:', lengths)
          $.maxCurr[code].arr[0] || ($.maxCurr[code].arr[0] = maxSum)
          $.minCurr[code].arr[0] || ($.minCurr[code].arr[0] = minSum)
          let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
          let toEmail = '851726398@qq.com'
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
                //   emailGet(toEmail, $.codeData[code].name + '[' + code + ']:今日下降中', '当前价：' + $.Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最低：' + min.min.toFixed(2) + ';下行：' + minSum.toFixed(2) + ';下压：' + $.minCurr[code].nub);
                  $.soaringMin[code] = 1;
                  $.maxCurr[code].nub = 0
              } else if ($.soaringMin[code] == 1 && newest > (isMin > min.min + 0.03 ? isMin : min.min + 0.03)) {
                  $.deal[item.codeID] && $.deal[item.codeID].dow++
                //   emailGet(toEmail, $.codeData[code].name + '[' + code + ']:回升中', '当前价：' + $.Sday[code][lengths].toFixed(2) + '当日平均值：' + mean.toFixed(2) + ';当日最低：' + min.min.toFixed(2) + ';下行：' + minSum.toFixed(2) + nubMon);
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

// 检测行情
function statusFlag (k_lin) {
 if (!k_lin[1]) return true
 console.log('statusFlag', k_lin[0].boll.MB, k_lin[1].boll.MB)
 return k_lin[0] && k_lin[1] && (k_lin[0].boll.MB - k_lin[1].boll.MB <= 0)
}

module.exports.endEmail = function ($) {
    for (let item in $.codeIDarr1) {
        if ($.codeIDarr1[item].codeID) {
            let code = $.codeIDarr1[item].codeID;
            let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
            let toEmail = '851726398@qq.com';
            // if ($.soaringMax[code] == 1) {
            //     $.deal[code] && $.deal[code].up++
            //     emailGet(toEmail, $.codeData[code].name + '[' + code + ']:回降中', '当前价：' + $.Sday[code][$.Sday[code].length - 1].toFixed(2) + nubMon);
            //     $.soaringMax[code] = 0;
            // }
            // if ($.soaringMin[code] == 1) {
            //     $.deal[code] && $.deal[code].dow++
            //     emailGet(toEmail, $.codeData[code].name + '[' + code + ']:回升中', '当前价：' + $.Sday[code][$.Sday[code].length - 1].toFixed(2) + nubMon);
            //     $.soaringMin[code] = 0;
            // }
            emailGet('851726398@qq.com', $.codeData[code].name + '[' + code + ']:清仓', nubMon);
            $.https.post('http://localhost:8089/api/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"status":0}});
        }
    }
}