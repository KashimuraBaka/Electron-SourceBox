import { createApp } from 'vue'
import MainWindow from './pages/MainWindow.vue'
import { createPinia } from 'pinia'
import ElementPlus, { ElMessageBox } from 'element-plus'

import router from './services/router'
import { InitConterStore } from './services/store'

// Lanuage File
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// Fix Element Plus Style Error
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

// Sytle
import 'element-plus/theme-chalk/src/dark/var.scss'
import '@renderer/assets/css/style.scss'

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

window.electron.ipcRenderer.send('dev-tool')

router.replace('/')

InitConterStore().catch((err) => {
  ElMessageBox.confirm(
    <p>
      <span>Steam服务未加载, 请打开Steam客户端重试.</span>
      <p style="color: teal">{err}</p>
    </p>,
    '错误',
    {
      confirmButtonText: '重启',
      cancelButtonText: '关闭',
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: false,
      type: 'error'
    }
  )
    .then(() => window.electron.ipcRenderer.send('window-relaunch'))
    .catch(() => {})
})
