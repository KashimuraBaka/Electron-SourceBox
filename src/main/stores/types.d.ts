declare interface TElectronStore {
  /** Steamworks AppID */
  appid: number
  /** 主窗口定位设置 */
  mainWindow: TWindowSettings
  /** Web服务设置 */
  web: {
    /** 是否开启Web服务 */
    enable: boolean
    /** Web服务端口 */
    port: number
  }
  obsOptions: Config.ObsPlugins
}

declare interface TServersStore {
  servers: string[]
  collections: Config.CollectionItems
}

type TWindowSettings = {
  x: number
  y: number
  width: number
  height: number
  isMaximized: boolean
}
