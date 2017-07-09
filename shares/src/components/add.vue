<template>
  <div style="max-width: 500px;margin: 10px auto">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="股票代码">
        <el-input v-model="codeID"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">立即添加</el-button>
        <el-button type="primary" @click="chakan(codeID)">查看代码</el-button>
        <el-button>取消</el-button>
      </el-form-item>
      <el-form-item>
        <template>
          <el-table
            :data="list"
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
          </el-table>
        </template>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      codeID: '',
      list: []
    }
  },
  methods: {
    onSubmit: function () {
      if (this.codeID === null || this.codeID === '' && this.codeID.length !== 6) {
        this.$messge('股票代码为空,或格式错误！')
        return
      }
      this.$axios.post('/api/HamstrerServlet/stock/add', {
        codeID: this.codeID
      }).then(function (response) {
        alert('添加成功!')
        console.log(response)
      }).catch(function (response) {
        alert('添加失败!')
        console.log(response)
      })
    },
    chakan: function (code) {
      this.$axios.get('http://hq.sinajs.cn/list=' + code).then((res) => {
        var data = res.data.split(',');
        if (Number(data[3]) == 0) {
          return
        }
        var nub = Number(data[3]);
        if (Sday[code]) {
          Sday[code].push(nub);
        } else {
          Sday[code] = [];
          Sday[code].push(nub);
        }
        var name = data[0].split('"')[1] + '[' + code + ']';
        var str = {
          'name': name,
          'daima': code,
          'dangqianjiage': Number(data[3]),
          'timeRQ': data[30],
          'timeSJ': data[31]
        };
        this.data = [str];
      });
    }
  }
}
</script>
