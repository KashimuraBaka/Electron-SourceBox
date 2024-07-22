import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

import router from './services/router'

// Lanuage File
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// Fix Element Plus Style Error
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

// Sytle
import 'element-plus/theme-chalk/src/dark/var.scss'
import '@renderer/assets/css/style.scss'
import '@renderer/assets/css/element-plus/index.scss'

// component
import MainWindow from './pages/MainWindow.vue'

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

// window.electron.ipcRenderer.send('dev-tool')
