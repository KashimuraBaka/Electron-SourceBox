import type { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  /** 自定义变量 */
  const define: {
    /** 软件版本 */
    readonly version: string
    /** 打包时间 */
    readonly packtime: number
  }

  interface Window {
    electron: ElectronAPI
    api: TConsole
    steamworks: Steamworks.Handlers
    config: Config.API
  }

  interface Json<T = any> {
    [key: string]: T
  }
}
