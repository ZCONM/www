// let $ = { https: require('axios'), deal: {'sh601002': true}, timeRQ: ''}
module.exports = function ($) {
  console.log('minuteK')
  let time = new Date()
  for (let code in $.deal) {
    if (time.getHours() < 15) {
      getHtml(code, $.timeRQ)
    } else if (code.substring(0, 2) != 'hk') {
      getHtml(code, $.timeRQ)
    }
  }
  function getHtml (code, timeRQ) {
    let data = {
      stor: {timeRQ: -1, timeSJ: -1},
      data: {
        daima: code
      },
      limit: 60
    }
    $.https.post('http://127.0.0.1:9999/HamstrerServlet/stockAll/find', data).then(res => {
      if (res.data && res.data.length > 0) {
        // console.log('res.data', res.data)
        let dangqianjiage = [];
        // console.log('res ->', res.data[0], res.data[res.data.length - 1])
        res.data.forEach(element => {
          dangqianjiage.push(element.dangqianjiage)
        });
        let data = {
          'code': res.data[0].daima,
          'max': dangqianjiage.max().max,
          'min': dangqianjiage.min().min,
          'mean': dangqianjiage.sum(),
          'boll': null,
          'ks': dangqianjiage[0],
          'js': dangqianjiage[dangqianjiage.length - 1],
          'status': dangqianjiage[dangqianjiage.length - 1] - dangqianjiage[0],
          'timeRQ': res.data[0].timeRQ,
          "timeSJ" : res.data[0].timeSJ
        }
        data.boll = boll(dangqianjiage)
        $.https.post('http://127.0.0.1:9999/HamstrerServlet/stock_minute_k/add', data).then(function (res) {
          console.log('成功 ' + code + '-->')
        }).catch(function (err) {
          console.log('失败 ', code + '-->');
        })
      }
    })
  }
}

function boll(k_link) {
  let MA = 0, MD = 0, MB = 0, UP = 0, DN = 0, mean = 0, sum = 0, arr = [], i1 = 0, k1 = 0, k2 = 0;
  for (let i = 0; i < k_link.length && i < 20; i++) {
      MA += Number(k_link[i])
      arr.push(Number(k_link[i]))
      i1++
  }
  MA = MA / i1
  for (let k = 0; k < k_link.length; k++) {
      if (k % 3 == 0) {
        let item = k_link[k];
        if (k < k_link.length - 1) {
            sum += Math.pow(Number(item) - MA, 2);
            k1++
        }
        if (k > 0) {
            mean += Number(item)
            k2++
        }
      }
  }
  MD = Math.sqrt(sum / k1);
  MB = mean / k2;
  let sumK = (arr.max().max / arr.sum() + (arr.sum() + (arr.sum() - arr.min().min)) / arr.sum()) / 2
  UP = MB + (sumK * MD);
  DN = MB - (sumK * MD);
  let obj = {
      MA: MA, // N日内的收盘价之和÷N
      MD: MD, // 计算标准差MD
      MB: MB, // 中线
      UP: UP, // 上线
      DN: DN // 下线
  };
  return obj
}