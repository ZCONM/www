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
        <el-button @click="clickof">取消</el-button>
      </el-form-item>
    </el-form>
    </div>
    <div style="max-width: 1000px;margin: 10px auto">
      <div v-if="!change">
        <template>
          <el-table
            :data="list"
            border
            align="left"
            style="margin:0 auto">
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
              width="180">
            </el-table-column>
            <el-table-column
              prop="name"
              label="名称"
              width="180">
            </el-table-column>
            <el-table-column
              prop="max"
              label="上次最高"
              width="180">
            </el-table-column>
            <el-table-column
              prop="min"
              label="上次最低">
            </el-table-column>
            <el-table-column
              width="200"
              prop="mean"
              label="上次平均价">
            </el-table-column>
            <el-table-column
              prop="timeRQ"
              label="日期">
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
        change: true
      }
    },
    methods: {
      onSubmit: function (obj) {
        debugger
        this.$axios.post('/api/HamstrerServlet/stock/add', {
          codeID: obj.daima,
          name: obj.name
        }).then((response) => {
          this.$message('添加成功!')
          console.log(response)
        }).catch((response) => {
          this.$message('添加失败!')
          console.log(response)
        })
      },
      chakan: function (code) {
        this.change = false
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
          this.list = [str]
        })
      },
      init () {
        this.change = true
        this.$axios.get('/api/HamstrerServlet/stock/find').then((d) => {
          this.data = d.data
        }).catch(function (response) {
          alert('刷新数据失败!')
          console.log(response)
        })
      },
      clickof () {
        debugger
        this.$ref('helloID')
      }
    }
  }
</script>
