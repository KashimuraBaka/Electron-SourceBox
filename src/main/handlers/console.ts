import { exec } from 'child_process'
import { BrowserWindow, dialog } from 'electron'

import type { IpcMainInvokeEvent } from 'electron'

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
  openFile: async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({})
    if (!canceled) {
      return filePaths[0]
    }
    return ''
  },
  exec: async (_event: IpcMainInvokeEvent, ...args: any[]): Promise<boolean> => {
    const command = args[0]
    if (command) {
      exec(command)
      return true
    }
    return false
  }
}
