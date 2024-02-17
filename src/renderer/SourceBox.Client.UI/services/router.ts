import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('@desktop/pages/Home/Home.vue') },
    { path: '/setting', component: () => import('@desktop/pages/Setting/Setting.vue') },
    { path: '/servers', component: () => import('@desktop/pages/Servers/Servers.vue') },
    { path: '/workshop', component: () => import('@desktop/pages/Workshop/Workshop.vue') },
    { path: '/obsliveoptions', component: () => import('@desktop/pages/OBSSetting/Setting.vue') }
  ]
})
