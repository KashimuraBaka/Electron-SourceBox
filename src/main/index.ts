import { app, shell, ipcMain, BrowserWindow } from 'electron'
import { join } from 'path'
import { writeFileSync, accessSync, constants } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '/resources/icon.png?asset'
import Greenworks from 'greenworks'

// 解决steam overlay无效的问题
// app.commandLine.appendSwitch('--in-process-gpu')

function fileIsExist(filePath: string): boolean {
  try {
    accessSync(filePath, constants.F_OK)
    return true
  } catch (err) {
    return false
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 960,
    minHeight: 620,
    show: false,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 登录窗口最小化
  ipcMain.on('window-min', () => {
    mainWindow.minimize()
  })

  // 登录窗口最大化
  ipcMain.on('window-max', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  // 登录窗口关闭
  ipcMain.on('window-close', () => {
    mainWindow.close()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 写出 Steam_Appid.txt
  const steamAppFile = join(__dirname, '../../steam_appid.txt')
  if (!fileIsExist(steamAppFile)) {
    try {
      writeFileSync(steamAppFile, '480')
      console.log('已写出 Steam_Appid.txt ...')
    } catch (err) {
      console.log('写入Steam Appid 失败!')
    }
  }

  // Steamworks 初始化
  if (Greenworks.init()) {
    console.log('Steamworks 加载成功!')
  }

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
