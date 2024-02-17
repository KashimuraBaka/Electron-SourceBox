type WritableComputedRef<T> = import('vue').WritableComputedRef<T>
type TWebServerPort = import('./store').TWebServerPort

interface WebServerPort extends TWebServerPort {
  sendAll(action: 'server', data: A2S.SourceServerInfoFormIP): void
  sendAll(action: 'setting', data: Config.ObsPlugins): void
}

declare interface TCounterStore {
  /** 主题类型 */
  themeDark: WritableComputedRef<boolean>
  /** Web服务器 */
  web: {
    /** 是否启用 */
    enable: boolean
    /** 服务端口 */
    port: number
    obsOptions: {
      ip?: string
      timer?: NodeJS.Timeout
    }
    /** 服务管道 */
    channel?: WebServerPort
  }
  /** SteamApp信息 */
  steamApp: {
    /** Steam AppID */
    id: number
    /** Steam 信息 */
    name: string
  }
  /** 玩家 SteamID 信息 */
  CSteamID: {
    init: boolean
    /** 玩家昵称 */
    name: string
    /** 玩家等级 */
    level: number
    /** 玩家SteamID 32位 */
    steamId32: string
    /** 玩家SteamID 64位 */
    steamId64: bigint
  }
}

declare interface TCounterGetter {
  [key: string]: any
}

declare interface TCounterAction {
  createSourceServerMessage(ip: string): void
}
