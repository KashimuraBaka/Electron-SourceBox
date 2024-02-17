import { MessageChannelMain } from 'electron'
import { createProcess } from '../utils/system'
import Stores from '../stores'
import LocalStore from '../stores/localstore'

import type { IpcMainInvokeEvent } from 'electron'

export function createWebServer(port: number) {
  if (!LocalStore.web) {
    Stores.Settings.set('web.enable', true)
    // 创建进程
    LocalStore.web = createProcess('webserver', port.toString())
    LocalStore.web.on('exit', () => {
      LocalStore.webClientPort?.close()
      LocalStore.webMainPort?.close()
    })
  }
  // 创建管道通信
  const { port1, port2 } = new MessageChannelMain()
  LocalStore.webClientPort?.close()
  LocalStore.webClientPort = port1
  LocalStore.webMainPort?.close()
  LocalStore.webMainPort = port2
  if (LocalStore.main.mainWindow) {
    LocalStore.main.mainWindow.webContents.postMessage('setWebPort', undefined, [port1])
  }
  LocalStore.web.postMessage(undefined, [port2])
}

function destoryWebServer() {
  if (LocalStore.web) {
    LocalStore.web.kill()
    LocalStore.web = undefined
    Stores.Settings.set('web.enable', false)
  }
}

export default {
  get: async (_event: IpcMainInvokeEvent, store: string, key: string, ...args: any[]): Promise<any> => {
    switch (store) {
      // 收藏合集
      case 'starlist': {
        switch (key) {
          case 'collections': {
            const [appid, def] = args
            return Stores.StarList.get(`collections.${appid}`, def)
          }
          case 'servers': {
            const [def] = args
            return Stores.StarList.get(key, def)
          }
        }
        return undefined
      }
      // 设置配置
      case 'settings': {
        const [def] = args
        return Stores.Settings.get(key, def)
      }
    }
  },
  set: async (_event: IpcMainInvokeEvent, store: string, key: string, ...args: any[]): Promise<void> => {
    switch (store) {
      case 'starlist': {
        switch (key) {
          case 'collections': {
            const [appid, val] = args
            Stores.StarList.set(`collections.${appid}`, val)
            break
          }
          case 'servers': {
            const [val] = args
            Stores.StarList.set(key, val)
            break
          }
        }
        break
      }
      case 'settings': {
        const [val] = args
        Stores.Settings.set(key, val)
        break
      }
    }
  },
  createWebServer: async (_event: IpcMainInvokeEvent, port: number): Promise<void> => {
    createWebServer(port)
  },
  destoryWebServer: async (): Promise<void> => {
    destoryWebServer()
  }
}
