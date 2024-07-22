import { BrowserWindow, app } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { registerIpcHandler, registerServiceHandler } from './handlers'
import MainWindow from './window/mainWindow'
import LocalStore from './stores/localstore'

import icon from '/resources/icon.png?asset'

app.commandLine.appendSwitch('disable-features', 'WidgetLayering')

// 主进程注册服务
registerIpcHandler()

export class Main {
  public mainWindow!: MainWindow

  constructor() {
    app.on('ready', this.onReady.bind(this))
    app.on('activate', this.onActivate.bind(this))
    app.on('browser-window-created', this.onBrowserWindowCreated.bind(this))
    app.on('window-all-closed', this.onWindowAllClosed.bind(this))
    app.on('will-quit', this.onWillQuit.bind(this))
  }

  async onWillQuit() {
    //
  }

  /**
   * 当 Electron 完成初始化并准备好创建浏览器窗口时, 将调用此方法.
   * 某些API只有在该事件发生后才能使用.
   */
  async onReady() {
    // 创建窗口
    this.mainWindow = await this.createWindow()
    // 启用服务并给主窗口发送管道通信
    registerServiceHandler()
  }

  async onActivate() {
    if (MainWindow.getAllWindows().length === 0) {
      this.createWindow()
    }
  }

  /**
   * 在开发中默认通过 F12 打开或关闭 DevTools，在生产中忽略 CommandOrControl + R。
   * https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
   *
   * @param _
   * @param window 窗口句柄
   */
  async onBrowserWindowCreated(_: unknown, window: BrowserWindow) {
    optimizer.watchWindowShortcuts(window)
  }

  /**
   * 当所有窗口关闭时退出(macOS 除外). 在那里,应用程序及其菜单栏通常会保持活动状态, 直到用户使用 Cmd + Q 显式退出。
   */
  async onWindowAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  }

  /**
   * 创建浏览窗口
   */
  async createWindow() {
    // 设置 Windows 的应用程序用户模型 ID
    electronApp.setAppUserModelId('com.electron')

    // 创建窗口
    return new MainWindow({
      show: false,
      frame: false,
      autoHideMenuBar: true,
      transparent: true,
      fullscreenable: false,
      backgroundColor: 'rgba(0,0,0,0)',
      minHeight: 620,
      minWidth: 930,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true, // 如果需要使用消息管道必须要关闭上下文隔离
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })
  }
}

LocalStore.main = new Main()

// 在此文件中, 您可以包含应用程序特定主流程代码的其余部分. 您还可以将它们放在单独的文件中并在此处需要它们。
