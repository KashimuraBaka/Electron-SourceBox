import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const defaultInvokeFunction = (key: any) => {
  return async (...args: any) => ipcRenderer.invoke(key, ...args)
}

// 渲染器的自定义 API
const PROCESS_API: TConsole = {
  windowMinimize: defaultInvokeFunction('windowMinimize'),
  windowMaximize: defaultInvokeFunction('windowMaximize'),
  windowClose: defaultInvokeFunction('windowClose'),
  checkVersion: defaultInvokeFunction('checkVersion'),
  quitToUpdater: defaultInvokeFunction('quitToUpdater'),
  downloadUpdater: defaultInvokeFunction('downloadUpdater'),
  openFile: defaultInvokeFunction('openFile'),
  exec: defaultInvokeFunction('exec')
}

const api = {
  ...PROCESS_API
}

const steamworks: Steamworks.Handlers = {
  run: async (keys: string, ...args: any[]) => await ipcRenderer.invoke('steamworks', [keys, args])
}

const config: Config.API = {
  set: defaultInvokeFunction('set'),
  get: defaultInvokeFunction('get'),
  createWebServer: defaultInvokeFunction('createWebServer'),
  destoryWebServer: defaultInvokeFunction('destoryWebServer')
}

// 仅当启用上下文隔离时，才使用 `contextBridge` API 将 Electron API 公开给渲染器，否则只需添加到 DOM 全局。
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('steamworks', steamworks)
    contextBridge.exposeInMainWorld('config', config)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.steamworks = steamworks
  // @ts-ignore (define in dts)
  window.config = config
}

// 因为启用上下文隔离, 不能因为方便抛弃安全性
ipcRenderer.on('setWebPort', async ({ ports }) => window.postMessage('setWebPort', '*', ports))
