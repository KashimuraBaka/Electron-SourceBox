import type { StandardLonghandProperties } from 'csstype'

declare global {
  declare namespace Config {
    /** OBS插件数据设置 */
    interface ObsPlugins {
      /** 文字模板 */
      customText: string
      /** 文字样式设置 */
      textStyle: ObsPluginsTextStyle
    }

    /** OBS插件文字设置 */
    interface ObsPluginsTextStyle {
      /** 文字大小 */
      size: string
      /** 文字对齐 */
      align: StandardLonghandProperties['textAlign']
      /** 文字颜色 */
      color: string
      /** 文字样式 */
      shadowType: string
      /** 文字样式颜色 */
      shadowColor: string
    }

    /** 合集信息 */
    interface CollectionItem {
      /** 合集ID */
      id: number
      /** 合集名称 */
      name: string
    }

    /** 合集列表 */
    interface CollectionItems {
      [name: number]: CollectionItem[]
    }

    interface API {
      /** 获取配置 */
      get(store: 'starlist', key: 'servers', defaultValue?: string[]): Promise<string[]>
      get(store: 'starlist', key: 'collections', appid: number, defaultValue?: CollectionItem[]): Promise<CollectionItem[]>

      get(store: 'settings', key: 'web.enable', defaultValue?: boolean): Promise<boolean>
      get(store: 'settings', key: 'web.port', defaultValue?: number): Promise<number>
      get(store: 'settings', key: 'appid', defaultValue?: number): Promise<number>
      get(store: 'settings', key: 'obsOptions', defaultValue?: ObsPlugins): Promise<ObsPlugins>

      /** 设置配置 */
      set(store: 'starlist', key: 'servers', val: string[]): Promise<void>
      set(store: 'starlist', key: 'collections', appid: number, val: CollectionItem[]): Promise<void>

      set(store: 'settings', key: 'web.enable', val: boolean): Promise<void>
      set(store: 'settings', key: 'web.port', val: number): Promise<void>
      set(store: 'settings', key: 'appid', val: number): Promise<void>
      set(store: 'settings', key: 'obsOptions', val: ObsPlugins): Promise<void>

      /** 打开Web服务器提供其他服务 */
      createWebServer(port: number): Promise<void>

      /** 关闭Web服务器 */
      destoryWebServer(): Promise<void>
    }
  }
}
