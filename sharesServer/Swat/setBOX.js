module.exports = function ($) {
  let current = 0;
  stock_find()
  function stock_find(currI) {
      console.log('currI', currI)
      let curr = currI || 0
      let each = 200
      https.get('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function (d) {
          for (let i = curr; i < d.data.length && (i % each != 0 || i == curr); i++) {
              let item = d.data[i];
              lookData(item, i, d.data.length - 1)
          }
          if (curr + each < d.data.length) {
              setTimeout(() => {
                  stock_find(curr + each)
              }, 5000)
          }
      })
  }
  // 收集当天信息
  function lookData(item, index) {
      https.get('http://hq.sinajs.cn/list=' + item.codeID, {
          'responseType': 'text/plain;charset=utf-8',
          'header': 'text/plain;charset=utf-8'
      }).then(function (res) {
          let data = res.data.split(',');
          if (Number(data[3]) == 0) {
              current++
              return;
          }
          let timeRQ = data[30];
          let mean10, min10, max10, k_link;
          let o = {
              'max': Number(data[4]),
              'min': Number(data[5]),
              'mean': (Number(data[4]) + Number(data[5])) / 2,
              'boll': null,
              'ks': Number(data[1]),
              'js': Number(data[3]),
              'deal': $.deal[item.codeID] || null,
              'timeRQ': data[30],
              'status': Number(data[3]) - Number(data[1])
          }
          o.boll = boll(item['K-Lin'], o);
          k_link = [o];
          mean10 = [(Number(data[4]) + Number(data[5])) / 2];
          min10 = [Number(data[5])];
          max10 = [Number(data[4])];
          if (item['K-Lin']) {
              let objCF = {}
              objCF[o.timeRQ] = true
              for (let k = 0; k < item['K-Lin'].length && k < 20; k++) {
                  if (item['K-Lin'][k].js) {
                      mean10.push(item['K-Lin'][k].mean);
                      min10.push(item['K-Lin'][k].min);
                      max10.push(item['K-Lin'][k].max);
                      !objCF[item['K-Lin'][k].timeRQ] && k_link.push(item['K-Lin'][k]);
                      objCF[item['K-Lin'][k].timeRQ] = true
                  }
              }
          }
          mean10 = mean10.sum();
          min10 = min10.min().min;
          max10 = max10.max().max;
          let obj = {
              'minData': [Number(data[5]), (Number(data[4]) + Number(data[5])) / 2],
              'maxData': [Number(data[4]), (Number(data[4]) + Number(data[5])) / 2],
              'max': Number(data[4]),
              'min': Number(data[5]),
              'mean': (Number(data[4]) + Number(data[5])) / 2,
              'timeRQ': timeRQ,
              'mean10': mean10,
              'min10': min10,
              'max10': max10,
              'K-Lin': k_link
          };
          obj.max && https.post('http://127.0.0.1:9999/HamstrerServlet/stock/edit', {
              where: { codeID: item.codeID },
              id: { '_id': item['_id'] },
              setter: obj
          }).then(function (res) {
              current++
              console.log('成功 ' + item.codeID + '-->', current)
          }).catch(function (err) {
              console.log(err);
          })
      })
  }
}
// 计算布林值
function boll(k_link, o) {
  k_link = [o].concat(k_link)
  let MA = 0, MD = 0, MB = 0, UP = 0, DN = 0, mean = 0, sum = 0, arr = [], i1 = 0, k1 = 0, k2 = 0;
  for (let i = 0; i < k_link.length && i < 20; i++) {
      MA += Number(k_link[i].js)
      arr.push(Number(k_link[i].js))
      i1++
  }
  MA = MA / i1
  for (let k = 0; k < k_link.length && k < 20; k++) {
      let item = k_link[k];
      if (k < k_link.length - 1) {
          sum += Math.pow(Number(item.js) - MA, 2);
          k1++
      }
      if (k > 0) {
          mean += Number(item.js)
          k2++
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