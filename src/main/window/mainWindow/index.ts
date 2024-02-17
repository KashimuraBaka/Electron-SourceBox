import { BrowserWindow, app, ipcMain, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import Stores from '../../stores'

import type { BrowserWindowConstructorOptions } from 'electron'

export default class MainWindow extends BrowserWindow {
  private isCurrentlyMaximized = false

  constructor(props?: BrowserWindowConstructorOptions) {
    const {
      mainWindow: { isMaximized, ...posAndSize }
    } = Stores.Settings.store

    super({ ...posAndSize, ...props })

    if (isMaximized) {
      this.maximize()
      this.isCurrentlyMaximized = true
    }

    this.on('ready-to-show', this.onReadyToShow.bind(this))
    this.on('maximize', this.onMaximize.bind(this))
    this.on('unmaximize', this.onUnmaximize.bind(this))
    this.on('close', this.onClose.bind(this))

    ipcMain.on('window-relaunch', this.windowRelaunch.bind(this))
    ipcMain.on('dev-tool', this.devTool.bind(this))

    this.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // 允许主界面跨域请求
    this.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        // 响应头重写
        responseHeaders: {
          'Access-Control-Allow-Origin': ['*'],
          ...details.responseHeaders
        }
      })
    })

    // 基于 Electron-vite cli 的渲染器 HMR. 加载用于开发的远程 URL 或用于生产的本地 html 文件
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  onReadyToShow() {
    this.show()
  }

  onMaximize() {
    this.isCurrentlyMaximized = true
  }

  onUnmaximize() {
    this.isCurrentlyMaximized = false
  }

  onClose() {
    this.savePositionAndSize()
    return false
  }

  windowRelaunch() {
    app.relaunch()
    app.exit()
  }

  /** 打开开发者工具 */
  devTool() {
    this.webContents.openDevTools()
  }

  savePositionAndSize() {
    const position = this.getPosition()
    const size = this.getSize()
    const isMaximized = this.isCurrentlyMaximized

    const newWindowState = {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
      isMaximized
    }

    Stores.Settings.set('mainWindow', newWindowState)
  }
}
