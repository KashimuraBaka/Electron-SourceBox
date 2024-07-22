import { exec } from 'child_process'
import { BrowserWindow, dialog } from 'electron'
import AppUpdater from '../updater'

import type { IpcMainInvokeEvent } from 'electron'
import LocalStore from '../stores/localstore'

export default {
  /** 窗口最小化 */
  windowMinimize: async (event: IpcMainInvokeEvent) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  },
  /** 窗口最大化 */
  windowMaximize: async (event: IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      const isMaximized = window.isMaximized()
      if (isMaximized) {
        window.setResizable(true)
        window.unmaximize()
      } else {
        window.setResizable(false)
        window.maximize()
      }
      return !isMaximized
    }
    return false
  },
  /** 关闭窗口 */
  windowClose: async (event: IpcMainInvokeEvent) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  },
  /** 检查更新 */
  checkVersion: async (event: IpcMainInvokeEvent) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window && !LocalStore.updater) {
      LocalStore.updater = new AppUpdater(window.webContents)
    }
    return await LocalStore.updater?.Check()
  },
  /** 退出并安装更新 */
  downloadUpdater: async () => {
    LocalStore.updater?.Download()
  },
  /** 退出并安装更新 */
  quitToUpdater: async () => {
    LocalStore.updater?.Install()
  },
  /** 打开文件 */
  openFile: async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({})
    if (!canceled) {
      return filePaths[0]
    }
    return ''
  },
  /** 执行文件 */
  exec: async (_event: IpcMainInvokeEvent, ...args: any[]): Promise<boolean> => {
    const command = args[0]
    if (command) {
      exec(command)
      return true
    }
    return false
  }
}
