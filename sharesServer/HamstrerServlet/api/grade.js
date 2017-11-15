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
// -------------------------------------------------------------------------------------------
let fileArr = [];
let serverUrl = '';
let curr = 0;
let MaxNumber = [];
axios.get('http://127.0.0.1:9999/HamstrerServlet/stock/find').then(function(d) {
    d.data && (fileArr = d.data)
    getHtml(0, fileArr.length)
    res.send('稍后会发送邮件给您！');
})
function getHtml(index, len){
    console.log('indexKS', index, len)
    if (index == len) {
        let code = MaxNumber[MaxNumber.length - 1][0].code
        let nubMon = '<br /><span style="color: #0D5F97;font-size: 28px;">代码：' + code.substring(2, 8) + '</span>';
        console.log('data.type', !!data.type)
        !!data.type && setTimeout(() => {
            console.log('全仓')
            emailGet('851726398@qq.com', '[' + code + ']:全仓', nubMon);
            console.log('修改状态')
            axios.post('/api/HamstrerServlet/stock/edit', {where: {codeID: code}, setter: {status: 2}}).then(res => {
              console.log('edit', res)
            }).catch((err) => {
              console.log('edit', err)
            })
        }, 120000)
        emailGet('851726398@qq.com,423642318@qq.com', '股票评分', MaxNumber.srotGrade())
        // console.log(MaxNumber)
        return
    }
    if (!(fileArr[index] && fileArr[index]['K-Lin'])) {
        if (index < (len - 1)) {
            getHtml(index + 1, len)
        }
        return
    }
    let item = fileArr[index];
    axios.get('http://hq.sinajs.cn/list=' + item.codeID, {
        'responseType': 'text/plain;charset=utf-8',
        'header': 'text/plain;charset=utf-8'
    }).then(function (res) {
        let data = res.data.split(',');
        if (Number(data[3]) == 0) {
            getHtml(index + 1, len)
            return;
        }
        let timeRQ = data[30];
        let k_link = [];
        let o = {
            'max': Number(data[4]),
            'min': Number(data[5]),
            'mean': (Number(data[4]) + Number(data[5])) / 2,
            'boll': null,
            'ks': Number(data[1]),
            'js': Number(data[3]),
            'deal': null,
            'timeRQ': data[30],
            'status': Number(data[3]) - Number(data[1])
        }
        o.boll = boll(item['K-Lin'], o);
        item['K-Lin'][0] && item['K-Lin'][0].timeRQ != o.timeRQ && (k_link = [o]);
        if (item['K-Lin']) {
            for (let k = 0; k < item['K-Lin'].length && k < 20; k++) {
                if (item['K-Lin'][k].js) {
                    k_link.push(item['K-Lin'][k]);
                }
            }
        }
        scoreNumber(k_link, item.codeID)
        getHtml(index + 1, len)
    });
}
function scoreNumber(k_link, code) {
    // if (code == 'sh600215') debugger
    if (!(code[2] == 6 || code[2] == 3)) return
    let score = {status:0, numner:0};
    if (k_link.length > 2) {
        scoreFun(0, k_link.length, k_link)
        let name = parseInt(score.numner);
        if (name > 0) {
            if (!MaxNumber[name]) MaxNumber[name] = []
            MaxNumber[name].push({code: code, nub: score.numner})
        }
    }
    function scoreFun (curr, len, k_link) {
        if (curr < len - 1 && k_link[curr].boll && k_link[curr + 1].boll) {
            if (curr < 2 && score.status == 0) {
                if (curr == 0) {
                    if (k_link[curr].boll.MB > 10 && k_link[curr].boll.MB < 30) {
                        // score.numner = score.numner + (40 - k_link[curr].boll.MB) / 2
                        // if (code == 'sh600215') console.log('1', score.numner)
                    } else if (k_link[curr].boll.MB > 5 && k_link[curr].boll.MB < 10) {
                        // score.numner = score.numner + k_link[curr].boll.MB / 2
                        // if (code == 'sh600215') console.log('2', score.numner)
                    } else {
                        return
                    }
                    if (k_link[curr].boll.MB - k_link[curr+1].boll.MB < 0 || k_link[curr].js - k_link[curr+1].js < 0) {
                        return
                    }
                    score.numner = score.numner + ((k_link[curr].boll.MB - k_link[curr].js) * 2)
                } else if (k_link[curr].boll.MB - k_link[curr+1].boll.MB < 0) {
                    score.status++
                }
                if (k_link[curr].boll.MB - k_link[curr+1].boll.MB > 0) {
                    score.numner += k_link[curr].boll.MB / k_link[curr+1].boll.MB
                    if (k_link[curr].boll.MD - k_link[curr+1].boll.MD > 0) {
                        score.numner += k_link[curr].boll.MD / k_link[curr+1].boll.MD
                    }
                }
                
                scoreFun(curr+1, len, k_link)
            } else if (score.status == 1) {
                if (k_link[curr].boll.MB - k_link[curr+1].boll.MB < 0) {
                    score.numner += k_link[curr+1].boll.MB / k_link[curr].boll.MB
                    if (k_link[curr].boll.MD - k_link[curr+1].boll.MD < 0) {
                        score.numner += k_link[curr+1].boll.MD / k_link[curr].boll.MD
                    }
                    // if (code == 'sh600215') console.log('dow', score.numner)
                } else {
                    score.status++
                }
                scoreFun(curr+1, len, k_link)
            } else if (curr > 2 && score.status == 3) {
                score.numner += k_link[curr].boll.MB / k_link[1].boll.MB
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
    let sumK = (arr.max().max / arr.sum() + (arr.sum() + (arr.sum() - arr.min().min)) / arr.sum()) / 2
    UP = MB + (sumK * MD);
    DN = MB - (sumK * MD);
    let obj = {
        MA: MA,
        MD: MD,
        MB: MB,
        UP: UP,
        DN: DN
    };
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