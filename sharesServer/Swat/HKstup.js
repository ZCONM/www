let email = require('../getemail');
// let indexNum = 0
module.exports = function (code, flag, $) {
  console.log('HKstup', code, flag)
  $.https.get('http://hq.sinajs.cn/list=' + 'rt_' + code).then(res => {
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
        ] = [
        data[1],
        data[2],
        data[3],
        data[6],
        data[4],
        data[5],
        data[17],
        data[18]
        ]
        console.log('HKstup '+code+' ->', flag, Number(temp4))  
        if (Number(temp4) == 0) {
            return
        }
        let nub = Number(temp4);
        let name = temp1 + '[' + code + ']';
        let str = {
            'name': name,
            'daima': code,
            'dangqianjiage': Number(temp4),
            'timeRQ': temp7,
            'timeSJ': temp8
        };
        $.timeRQ = temp7;
        calculatingData(code, temp1)
        if (Number(temp4) > 0 && !$.timeSJ[code + temp7 + temp8]) {
          $.timeSJ[code + temp7 + temp8] = true
          $.https.post('http://127.0.0.1:9999/HamstrerServlet/stockAll/add', str).then(function (message) {
              console.log(code + ':存储最新价格' + nub.toFixed(2) + '!');
              if ($.Sday[code]) {
                $.Sday[code].push(nub);
              } else {
                $.Sday[code] = [];
                $.Sday[code].push(nub);
              }
              flag && calculatingData(code, temp1);
          }).catch(function (err) {
              console.log(err);
          });
        }
    });
    function calculatingData(code, name) {
      console.log(code + ':分析价格!');
// --------------------------------------------------------
      let data = {
        stor: { timeRQ: -1, timeSJ: -1 },
        data: {
          daima: code
        },
        limit: 300
      }
      $.https
      .post('http://127.0.0.1:9999/HamstrerServlet/stockAll/find', data)
      .then(d => {
        $.codeData[code].status == 3 && _MACD(d)
        // if ($.codeData[code].status == 3) {
        //   d.data = d.data.slice(350 - indexNum, d.length)
        //   indexNum++
        //   _MACD(d)
        // }
        $.codeData[code].status == 4 && _BOLL(d)
      })
      // macd分析价格
      function _MACD (d) {
        let list = []
        let arr = []
        d.data.forEach((item, i) => {
          arr.push(item.dangqianjiage)
        })
        d.data.forEach((item, i) => {
          if (i >= 24) {
            list.push(MACD(arr, 12, i - 24))
          }
        })
        console.log('list[0].M', list[0].M, indexNum)
        // 开始分析
        if (list.length > 1) {
          let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
          if (!$.deal[code].info) { // 空仓
            console.log('空仓', list[0].M1, list[0].M2, list[0].M)
            if (list[0].M1 < list[0].M2 && (list[0].M - list[0].M2) > 0) {
              emailGet('851726398@qq.com', $.codeData[code].name + '[' + code + ']:全仓', '当前价：' + list[0].M + nubMon);
              let bottom = []
              for (let i = 0; i < list.length && list[i].M1 < list[i].M2; i++) {
                bottom.push(list[i].M)
              }
              $.deal[code].info = {
                M: list[0].M,
                bottom: bottom.min().min,
                flag: false
              }
            }
          } else { // 满仓
            console.log('满仓', list[0].M1.toFixed(2), list[0].M2.toFixed(2), list[0].M.toFixed(2), $.deal[code].info.flag)
            if (list[0].M - $.deal[code].info.bottom >= 0) {
              if ((list[0].M - $.deal[code].info.M) / $.deal[code].info.M > 0.005) {
                if (list[0].M < list[0].M1) {
                  emailGet('851726398@qq.com', $.codeData[code].name + '[' + code + ']:清仓', '当前价：' + list[0].M + nubMon);
                  $.deal[code].info = null
                }
              }
            } else if ($.deal[code].info.M - $.deal[code].bottom < $.deal[code].bottom - list[0].M) { // 破最低清仓
              if ($.deal[code].info.flag) {
                emailGet('851726398@qq.com', $.codeData[code].name + '[' + code + ']:清仓', '当前价：' + list[0].M + nubMon);
                $.deal[code].info = null
              } else {
                $.deal[code].info.flag = true
              }
            }
          }
        }
      }
      // BOll分析
      function _BOLL (d) {
        let boll = {}
        let list = []
        boll.SJ = []
        boll.JS = []
        boll.MB = []
        boll.UP = []
        boll.DN = []
        let arr = []
        d.data.forEach((item, i) => {
          arr.push(item.dangqianjiage)
        })
        d.data.forEach((item, i) => {
          if (i >= 20) {
            list.push({
              timeSJ: d.data[i - 20].timeSJ,
              js: d.data[i - 20].dangqianjiage,
              boll: bolls(arr, i - 20)
            })
          }
        })
        // 开始分析
        if (list.length > 1) {
          let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
          if ($.deal[code].info) { // 是否已买入
            if (list[0].js >= list[0].boll.UP || list[0].js < $.deal[code].info.bottom) { // 突破boll线上线
              emailGet('851726398@qq.com', $.codeData[code].name + '[' + code + ']:清仓', '当前价：' + $.Sday[code][$.Sday[code].length - 1].toFixed(2) + nubMon);
              $.deal[code].info = null
            }
          } else if (list[0].js <= list[0].boll.DN) { // 破下行线
            emailGet('851726398@qq.com', $.codeData[code].name + '[' + code + ']:全仓', '当前价：' + $.Sday[code][$.Sday[code].length - 1].toFixed(2) + nubMon);
            $.deal[code].info = {
              M: list[0].M,
              bottom: list[0].M
            }
          }
        }
      }
    }
}
// 计算布林值
function bolls (Arr, index = 0) {
  let klink = Arr
  let [MA, MD, MB, UP, DN, mean, sum, arr, i1, k1, k2] = [0, 0, 0, 0, 0, 0, 0, [], 0, 0, 0]
  for (let i = index; i < klink.length && i < index + 20; i++) {
    MA += Number(klink[i])
    arr.push(Number(klink[i]))
    i1++
  }
  MA = MA / i1
  for (let k = index; k < klink.length && k < index + 20; k++) {
    let item = klink[k]
    if (k < klink.length - 1) {
      sum += Math.pow(Number(item) - MA, 2)
      k1++
    }
    if (k > 0) {
      mean += Number(item)
      k2++
    }
  }
  MD = Math.sqrt(sum / k1)
  MB = mean / k2
  let sumK = (arr.max().max / arr.sum() + (arr.sum() + (arr.sum() - arr.min().min)) / arr.sum()) / 2
  UP = MB + (sumK * MD)
  DN = MB - (sumK * MD)
  let obj = {
    MA: MA, // N日内的收盘价之和÷N
    MD: MD, // 计算标准差MD
    MB: MB, // 中线
    UP: UP, // 上线
    DN: DN // 下线
  }
  return obj
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
function MACD (data, dayCount = 30, index) {
  let [M1, M2, sum1, sum2] = [0, 0, 0, 0]
  for (let i = index; i < index + dayCount; i++) {
    sum1 = 0
    for (let j = 0; j < dayCount; j++) {
      sum1 += data[i + j]
    }
    i === index && (M1 = sum1 / dayCount)
    sum2 += sum1 / dayCount
  }
  M2 = sum2 / dayCount
  return {
    M: data[index],
    M1: M1,
    M2: M2
  }
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