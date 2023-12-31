import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: () => import("../views/components/Home/HelloWorld.vue") },
    { path: "/servers", component: () => import("../views/components/Servers/ServersWindows.vue") }
  ]
});

