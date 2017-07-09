import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import add from '@/components/add'
Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/hello',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/add',
      name: 'add',
      component: add
    }
  ]
})
