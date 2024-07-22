import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      component: () => import('@desktop/pages/MainLoading.vue')
    },
    {
      path: '/main',
      component: () => import('@desktop/pages/MainViews.vue'), //二级路由与对应的一级路由不是子父级目录
      children: [
        { path: '', component: () => import('@desktop/pages/Home/Home.vue') },
        { path: 'setting', component: () => import('@desktop/pages/Setting/Setting.vue') },
        { path: 'servers', component: () => import('@desktop/pages/Servers/Servers.vue') },
        { path: 'workshop', component: () => import('@desktop/pages/Workshop/Workshop.vue') },
        { path: 'obsliveoptions', component: () => import('@desktop/pages/OBSSetting/Setting.vue') }
      ]
    }
  ]
})
