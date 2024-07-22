import { app } from 'electron'
import { CancellationToken, autoUpdater } from 'electron-updater'
import path from 'path'

import type { WebContents } from 'electron'
import type { UpdateInfo, ProgressInfo } from 'electron-updater'

export default class AppUpdater {
  private content: WebContents
  private cancellationToken?: CancellationToken

  constructor(webContent: WebContents) {
    this.content = webContent
    // 开发者模式进行Update测试
    if (process.env.NODE_ENV === 'development') {
      Object.defineProperty(app, 'isPackaged', {
        get() {
          return true
        }
      })
      autoUpdater.updateConfigPath = path.join(__dirname, '../../dist/win-unpacked/resources/app-update.yml')
    }
    // 开始检查更新
    autoUpdater.logger = null
    autoUpdater.autoDownload = false
    autoUpdater.removeAllListeners()
    autoUpdater.on('error', this.onError.bind(this))
    autoUpdater.on('checking-for-update', this.onCheckingForUpdate.bind(this))
    autoUpdater.on('update-available', this.onUpdateAvailable.bind(this))
    autoUpdater.on('update-not-available', this.onUpdateNotAvailable.bind(this))
    autoUpdater.on('download-progress', this.onDownloadProgress.bind(this))
    autoUpdater.on('update-downloaded', this.onUpdateDownloaded.bind(this))
  }

  private sendStatusToWindow(action: string, ...args: any[]) {
    this.content.send(action, ...args)
  }

  // 监听升级失败事件
  private onError(err: Error, message?: string) {
    this.sendStatusToWindow('app-updater-error', err, message)
  }

  // 监听开始检测更新事件
  private onCheckingForUpdate() {
    this.sendStatusToWindow('app-updater-update')
  }

  // 监听发现可用更新事件
  private onUpdateAvailable(info: UpdateInfo) {
    this.sendStatusToWindow('app-updater-available', info)
  }

  // 监听没有可用更新事件
  private onUpdateNotAvailable(info: UpdateInfo) {
    this.sendStatusToWindow('app-updater-notavailable', info)
  }

  // 更新下载进度事件
  private onDownloadProgress(progress: ProgressInfo) {
    this.sendStatusToWindow('app-updater-progress', progress)
  }

  // 监听下载完成事件
  private onUpdateDownloaded(info: UpdateInfo) {
    this.sendStatusToWindow('app-updater-downloaded', info)
  }

  public async Check() {
    return await autoUpdater.checkForUpdates()
  }

  public Download() {
    this.cancellationToken?.cancel()
    this.cancellationToken = new CancellationToken()
    autoUpdater.downloadUpdate(this.cancellationToken)
  }

  public Install() {
    // 退出并安装更新包，不退出如果取消安装的话，无法再次启动安装程序
    app.quit()
    autoUpdater.quitAndInstall()
  }
}
