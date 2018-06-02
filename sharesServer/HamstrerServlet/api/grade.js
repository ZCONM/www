/**
 * Created by Administrator on 2017/5/14.
 */

//最小值
Array.prototype.min = function () {
    let _this = this;
    let min = Number(_this[0]);
    let len = _this.length;
    let nub = 0;
    for (let i = 1; i < len; i++) {
        if (_this[i] != 0 && _this[i] < min) {
            min = Number(_this[i]);
            nub = i;
        }
    }
    return { min: min, nub: nub };
}
//最大值
Array.prototype.max = function () {
    let _this = this;
    let max = Number(_this[0]);
    let len = this.length;
    let nub = 0;
    for (let i = 1; i < len; i++) {
        if (this[i] > max) {
            max = Number(_this[i]);
            nub = i;
        }
    }
    return { max: max, nub: nub };
}
// 平均数
Array.prototype.sum = function (name) {
    let sum = 0;
    let len = this.length;
    let i = 0;
    let _this = this
    if (typeof _this[i] == 'object') {
        for (i = 0; i < len; i++) {
            sum = sum + Number(_this[i][name]);
        }
    } else {
        for (i = 0; i < len; i++) {
            sum = sum + Number(_this[i]);
        }
    }
    return sum / _this.length;
}
// 格式化排名
Array.prototype.srotGrade = function () {
    let _this = this
    let arr = _this.reverse();
    let str = '分数排名：<br />';
    let index = 0;
    _this.forEach(item => {
        if (item) {
            index++
            str += '<p style="font-weight: 100;"><b style="color:#4093c6">'+ index +'. </b>'
            item.forEach((obj, i) => {
                if (i > 0) str += ','
                str += '<span style="color:#4093c6">'+ obj.code +':</span>(' + obj.nub + ')'
            })
            str += '<p />'
        }
    })
    return str;
}
// 格式化日期
function setTime() {
    let myDate = new Date();
    let y = myDate.getFullYear();
    let m = myDate.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    let d = myDate.getDate();
    d = d < 10 ? ('0' + d) : d;
    return y + '-' + m + '-' + d;
}
// 封装consoles，方便切换测试模式
let consoles = {
    log: function (...val) {
        if (test) console.log(...val);
    }
}
// -------------------------------------------------------------------------------------------
let test = false; // 是否展示测试console
let fileArr = [];
let serverUrl = '';
let curr = 0;
let MaxNumber = [];
// axios.post('http://127.0.0.1:9999/HamstrerServlet/stock/find', {"codeID":"sz002321"}).then(function(d) {
axios.post('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function(d) {
    d.data && (fileArr = d.data);
    getHtml(0, fileArr.length);
    res.send('稍后会发送邮件给您！');
})
function getHtml(index, len){
    console.log('indexKS', index, len);
    if (index == len) {
        consoles.log(1, MaxNumber);
        let code = MaxNumber[MaxNumber.length - 1][0].code;
        consoles.log(2);
        let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
        consoles.log('data.type', !!data.type)
        !!data.type && setTimeout(() => {
            axios.post('http://localhost:8089/api/HamstrerServlet/stock/edit',{"where":{"codeID":code},"setter":{"status":1}}).then(res=>{
              console.log('修改状态成功')
            }).catch((err) => {
              console.log('edit', err)
            })
        }, 1000 * 60 * (58 - (new Date()).getMinutes()))
        emailGet('851726398@qq.com,423642318@qq.com', '股票评分', MaxNumber.srotGrade())
        console.log('发送全仓邮件');
        emailGet('851726398@qq.com', '[' + code + ']:全仓', nubMon);
        return
    }
    if (!(fileArr[index] && fileArr[index]['K-Lin'])) {
        if (index < (len - 1)) {
            getHtml(index + 1, len)
        }
        return consoles.log('not K-Lin');
    }
    let item = fileArr[index];
    consoles.log('请求新浪api');
    axios.get('http://hq.sinajs.cn/list=' + (item.codeID.indexOf('hk') === -1 ? item.codeID : 'rt_' + item.codeID), {
        'responseType': 'text/plain;charset=utf-8',
        'header': 'text/plain;charset=utf-8'
    }).then(function (res) {
        consoles.log('res 请求新浪api', res.data);
        let data = res.data.split('=')[1].split('"').join('').split(';').join('').split(',');
        let [
          temp1, // 股票名称
          temp2, // 今日开盘价
          temp3, // 昨日收盘价
          temp4, // 现价（股票当前价，收盘以后这个价格就是当日收盘价）
          temp5, // 最高价
          temp6, // 最低价
          temp7, // 日期
          temp8, // 时间
          volume
        ] = item.codeID.indexOf('hk') === -1 ? [
          data[0],
          data[1],
          data[2],
          data[3],
          data[4],
          data[5],
          data[30],
          data[31],
          data[8]
        ] : [
          data[1],
          data[2],
          data[3],
          data[6],
          data[4],
          data[5],
          data[17],
          data[18],
          data[8]
        ]
        if (Number(temp4) == 0 || (Number(temp4) - Number(temp3)) / Number(temp3) > 0.05) {
            consoles.log('max 5%');
            getHtml(index + 1, len);
            return;
        }
        let timeRQ = temp7;
        let k_link = [];
        let o = {
            'max': Number(temp5),
            'min': Number(temp6),
            'mean': (Number(temp5) + Number(temp6)) / 2,
            'boll': null,
            'ks': Number(temp2),
            'js': Number(temp4),
            'volume': Number(volume),
            'deal': null,
            'timeRQ': temp7,
            'status': Number(temp4) - Number(temp2)
        }
        consoles.log('开始boll计算');
        o.boll = boll(item['K-Lin'], o);
        consoles.log('开始boll计算结束');
        item['K-Lin'][0] && item['K-Lin'][0].timeRQ != o.timeRQ && (k_link = [o]);
        if (item['K-Lin']) {
            for (let k = 0; k < item['K-Lin'].length && k < 20; k++) {
                if (item['K-Lin'][k].js) {
                    k_link.push(item['K-Lin'][k]);
                }
            }
        }
        consoles.log('开始scoreNumber计算分数');
        scoreNumber(k_link, item.codeID)
        getHtml(index + 1, len)
    });
}
function scoreNumber(k_link, code) {
    consoles.log('scoreNumber');    
    // if (code == 'sh300062') debugger
    if (!(code[2] == 6 || code[2] == 3 || code[2] == 0) || code[0] != 's') return;
    let score = {status:0, numner:0};
    // k_link.splice(0,1); // 测试代码去掉 n 数据
    if (k_link.length > 2) {
        scoreFun(0, k_link.length, k_link);
        consoles.log('scoreFun',code, score);
        score.numner += BF(k_link); // 反转趋势
        consoles.log('BF',code, score);
        let name = parseInt(score.numner);
        if (name >= 0) {
            if (!MaxNumber[name]) MaxNumber[name] = [];
            MaxNumber[name].push({code: code, nub: score.numner});
        }
    }
    function scoreFun (curr, len, k_link) {
        if (curr < len - 1 && k_link[curr].boll && k_link[curr + 1].boll) {
            if (curr < 2 && score.status == 0) {
                if (curr == 0) {
                    // if (k_link[curr].boll.MB > 10 && k_link[curr].boll.MB < 30) {
                    //     // score.numner = score.numner + (40 - k_link[curr].boll.MB) / 2
                    //     // if (code == 'sh600215') consoles.log('1', score.numner)
                    // } else if (k_link[curr].boll.MB > 5 && k_link[curr].boll.MB < 10) {
                    //     // score.numner = score.numner + k_link[curr].boll.MB / 2
                    //     // if (code == 'sh600215') consoles.log('2', score.numner)
                    // } else {
                    //     return
                    // }
                    let arr = (k_link || []).filter(item => !!item.js).map(item => item.js);
                    if (arr.max().nub == arr.length) return;
                    if (k_link[curr].boll.MB - k_link[curr+1].boll.MB < 0 || k_link[curr].status < 0) {
                        return
                    }
                    // score.numner = score.numner + ((k_link[curr].boll.MB - k_link[curr].js) * 2);
                    if (k_link[curr].volume && k_link[curr+1].volume && k_link[curr+1].volume > k_link[curr].volume && k_link[curr].status > 0) {
                        score.numner += (k_link[curr].volume / k_link[curr+1].volume) * 10;
                        score.numner += k_link[curr].volume > 1000000 ? 1 : 0;
                    }
                } else if (k_link[curr].boll.MB - k_link[curr+1].boll.MB < 0) {
                    score.status++
                }
                if (k_link[curr].boll.MB - k_link[curr+1].boll.MB > 0) {
                    score.numner += k_link[curr].boll.MB / k_link[curr+1].boll.MB
                    if (k_link[curr].boll.MD - k_link[curr+1].boll.MD > 0) {
                        score.numner += k_link[curr].boll.MD / k_link[curr+1].boll.MD
                    }
                }
                consoles.log(code, curr, score.numner);
                scoreFun(curr+1, len, k_link)
            } else if (score.status == 1) {
                if (k_link[curr].boll.MB - k_link[curr+1].boll.MB < 0) {
                    score.numner += k_link[curr+1].boll.MB / k_link[curr].boll.MB
                    if (k_link[curr].boll.MD - k_link[curr+1].boll.MD < 0) {
                        score.numner += k_link[curr+1].boll.MD / k_link[curr].boll.MD
                    }
                    // if (code == 'sh600215') consoles.log('dow', score.numner)
                } else {
                    score.status++
                }
                consoles.log(code, curr, score.numner);                
                scoreFun(curr+1, len, k_link)
            } else if (curr > 2 && score.status == 3) {
                score.numner += k_link[curr].boll.MB / k_link[1].boll.MB
                consoles.log(code, curr, score.numner);                
                return
            } else {
                return
            }
        }
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
    let norm = ([].concat(JudgeMax(k_link), JudgeMinus(k_link))).sum()
    UP = MB + (norm * MD);
    DN = MB - (norm * MD);
    let obj = {
        MA: MA,
        MD: MD,
        MB: MB,
        UP: UP,
        DN: DN
    };
    return obj
}

// 反转趋势
function BF(k_link) {
    let nub = 0;
    let flag = 0;
    for (let i = 0;i < k_link.length;i++) {
        let item = k_link[i]
        if (item.boll) {
            if (i < 2 && flag == 0) {
                if (item.js < item.boll.DN) {
                    nub += 5;
                    flag++
                }
            } else if (i >= 2 && flag == 1) {
                if (item.js < item.boll.DN) {
                    nub -= 5;
                    flag++
                }
                if (item.js > item.boll.UP) {
                    nub += 5;
                    flag++
                }
            } else {
                return nub
            }
        }
    }
    return nub
} 
// 发送邮件
function emailGet(to, tit, text) {
    email.send(to, tit, text, function (err, info) {
        if (err) {
            consoles.log(err);
            return;
        }
        consoles.log('邮件:', tit);
    })
  }

  // boll计算高点
function JudgeMax (arrData) {
    let [i, maxData, arr, arrs, index] = [0, [], [], []]
    for (i = 0; i < arrData.length && arrData[i].boll; i++) {
      if (arrData[i].js > arrData[i].boll.MB) {
        arr.push(arrData[i].js)
        arrs.push(arrData[i])
      } else if (arr.length > 1) {
        index = arr.max().nub
        maxData.push((arrs[index].js - arrs[index].boll.MB) / arrs[index].boll.MD)
        arr = []
        arrs = []
      }
    }
    if (arr.length > 1) {
      index = arr.max().nub
      maxData.push((arrs[index].js - arrs[index].boll.MB) / arrs[index].boll.MD)
      arr = []
      arrs = []
    }
    return maxData
  }
  // boll计算低点
  function JudgeMinus (arrData) {
    let [i, minData, arr, arrs, nub] = [0, [], [], []]
    for (i = 0; i < arrData.length && arrData[i].boll; i++) {
      if (arrData[i].js < arrData[i].boll.MB) {
        arr.push(arrData[i].js)
        arrs.push(arrData[i])
      } else if (arr.length > 1) {
        nub = arr.min().nub
        minData.push((arrs[nub].boll.MB - arrs[nub].js) / arrs[nub].boll.MD)
        arr = []
        arrs = []
      }
    }
    if (arr.length > 1) {
      nub = arr.min().nub
      minData.push((arrs[nub].boll.MB - arrs[nub].js) / arrs[nub].boll.MD)
      arr = []
      arrs = []
    }
    return minData
  }