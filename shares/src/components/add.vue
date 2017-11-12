<script src="../../config/index.js"></script>
<template>
  <div>
  <div style="max-width: 500px;margin: 10px auto">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="股票代码">
        <el-input v-model="codeID"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="chakan(codeID)">查看代码</el-button>
        <el-button type="primary" @click="init()">查看已添加数据</el-button>
        <el-button type="primary" @click="grade()">发送股票评分邮件</el-button>
      </el-form-item>
    </el-form>
    </div>
    <div style="max-width: 1000px;margin: 10px auto">
      <div v-if="!change">
        <template>
          <div style="margin:0 auto; width:1000px">
          <el-table
            :data="list"
            border
            v-if="list.length < 10"
            align="left">
            <el-table-column
              prop="name"
              label="name"
              width="180">
            </el-table-column>
            <el-table-column
              prop="daima"
              label="daima"
              width="180">
            </el-table-column>
            <el-table-column
              prop="dangqianjiage"
              label="dangqianjiage">
            </el-table-column>
            <el-table-column
              prop="timeRQ"
              label="timeRQ">
            </el-table-column>
            <el-table-column
              prop="timeSJ"
              label="timeSJ">
            </el-table-column>
            <el-table-column
              prop="null"
              type=""
              label="操作">
              <template scope="scope">
                <el-button v-if="scope.row.dangqianjiage" type="primary" @click="onSubmit(scope.row)">立即添加</el-button>
              </template>
            </el-table-column>
          </el-table>
            <span>一共{{list.length}}条。</span><b>{{index}}/{{list.length}}</b>
            <el-button type="primary" @click="onSubmit(list, 'all')">全部添加</el-button>
            </div>
        </template>
      </div>
      <div v-else>
        <template>
          <el-table
            :data="data"
            border
            align="left"
            style="margin:0 auto">
            <el-table-column
              prop="codeID"
              label="代码"
              width="120">
            </el-table-column>
            <el-table-column
              prop="name"
              label="名称"
              width="120">
            </el-table-column>
            <el-table-column
              prop="max"
              label="上次最高"
              width="120">
            </el-table-column>
            <el-table-column
              prop="min"
              width="120"
              label="上次最低">
            </el-table-column>
            <el-table-column
              width="120"
              prop="mean"
              label="上次平均价">
            </el-table-column>
            <el-table-column
              prop="timeRQ"
              width="120"
              label="日期">
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态">
              <template scope="scope">
                <el-radio-group v-model="scope.row.status" @change="editType(scope.row, scope.row.status)">
                  <el-radio :label="0">关闭</el-radio>
                  <el-radio :label="1">长线</el-radio>
                  <el-radio :label="2">短线</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
  </div>
  </div>
</template>
<script>
  export default {
    name: 'add',
    data () {
      return {
        msg: 'Welcome to Your Vue.js App',
        codeID: '',
        list: [],
        data: [],
        index: 0,
        change: true
      }
    },
    methods: {
      onSubmit: function (objs, type) {
        if (type === 'all') {
          for (this.index = 0; this.index < objs.length; this.index ++) {
            add(objs[this.index], this)
          }
        } else {
          add(objs, this)
        }
        function add (obj, _this) {
          _this.$axios.post('/api/HamstrerServlet/stock/add', {
            codeID: obj.daima,
            name: obj.name,
            status: 0
          }).then((response) => {
            _this.$message('添加成功!')
            console.log(response)
          }).catch((response) => {
            _this.$message('添加失败!')
            console.log(response)
          })
        }
      },
      editType: function (obj, type) {
        this.$axios.post('/api/HamstrerServlet/stock/edit', {where: {codeID: obj.codeID}, id: {'_id': obj['_id']}, setter: {status: type}}).then(res => {
          console.log(res)
        }).catch((err) => {
          this.$message('修改失败!')
          console.log(err)
        })
      },
      chakan: function (code) {
        this.change = false
        this.list = []
        if (code.indexOf(',') === -1) {
          return this.GPAPI(code)
        }
        let arr = code.split(',')
        arr.forEach(item => {
          this.GPAPI(item)
        })
      },
      GPAPI: function (code) {
        this.$axios.get('/sinajs/list=' + code).then((res) => {
          var data = res.data.split(',')
          var name = data[0].split('"')[1]
          var str = {
            'name': name,
            'daima': code,
            'dangqianjiage': Number(data[3]),
            'timeRQ': data[30],
            'timeSJ': data[31]
          }
          Number(data[3]) && this.list.push(str)
        })
      },
      init () {
        this.change = true
        let obj = {}
        if (this.codeID) {
          obj.codeID = this.codeID
        } else {
          obj.status = {'$gt': 0}
        }
        console.log('init ->', obj)
        this.$axios.post('/api/HamstrerServlet/stock/find', obj).then((d) => {
          this.data = d.data
        }).catch(function (response) {
          alert('刷新数据失败!')
          console.log(response)
        })
      },
      grade () {
        this.$axios.get('/api/HamstrerServlet/api/grade').then((d) => {
          this.$message(d.data)
        })
      }
    }
  }
</script>
