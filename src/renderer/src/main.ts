import { createApp } from 'vue'
import MainWindow from './views/MainWindow.vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

import router from './router'

// Lanuage File
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// Sytle
import 'element-plus/theme-chalk/src/dark/var.scss'
import './assets/css/style.scss'

const VueApp = createApp(MainWindow)
VueApp.use(createPinia())
VueApp.use(router)
VueApp.use(ElementPlus, { locale: zhCn })
VueApp.mount('#app').$nextTick(() => {
  // 删除预加载脚本加载
  postMessage({ payload: 'removeLoading' }, '*')

  // Use contextBridge
  window.electron.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
})
