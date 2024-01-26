declare interface ParseObjectOptions {
  /** 自动转换数组类型 */
  autoConvertArrays: boolean
  /** 自动转换布尔类型 */
  autoConvertBooleans: boolean
  /** 日期选项 */
  dateProperties: string[]
}

declare interface TShortcutOptions {
  /** 应用软件名 */
  Exe: string
  /** 应用图标 */
  icon?: string
  /** 应用快捷路径 */
  ShortcutPath?: string
  /** 应用启动选项 */
  LaunchOptions?: string
  /** 是否隐藏 */
  IsHidden?: boolean
  /** 允许桌面设置 */
  AllowDesktopConfig?: boolean
  /** 允许启用 Steam Overlay */
  AllowOverlay?: boolean
  /** 打开VR模式 */
  OpenVR?: boolean
  /** 打开开发工具 */
  Devkit?: boolean
  /** 开发工具ID */
  DevkitGameID?: string
  /** 开发工具覆盖AppID */
  DevkitOverrideAppID?: boolean
  /** 上次游玩时间 */
  LastPlayTime?: Data
  /** Flatpak AppID */
  FlatpakAppID?: string
  /** 应用标签 */
  tags?: string[]
}

declare interface TShortcut {
  /** 应用ID */
  appid: number
  /** 应用程序名 */
  AppName: string
  /** 应用软件名 */
  Exe: string
  /** 应用运行所在文件夹 */
  StartDir: string
  /** 应用图标 */
  icon: string
  /** 应用快捷路径 */
  ShortcutPath: string
  /** 应用启动选项 */
  LaunchOptions: string
  /** 是否隐藏 */
  IsHidden: boolean
  /** 允许桌面设置 */
  AllowDesktopConfig: boolean
  /** 允许启用 Steam Overlay */
  AllowOverlay: boolean
  /** 打开VR模式 */
  OpenVR: boolean
  /** 打开开发工具 */
  Devkit: boolean
  /** 开发工具ID */
  DevkitGameID: string
  /** 开发工具覆盖AppID */
  DevkitOverrideAppID: boolean
  /** 上次游玩时间 */
  LastPlayTime: Data
  /** Flatpak AppID */
  FlatpakAppID: string
  /** 应用标签 */
  tags: string[]
}

declare interface TShortcuts {
  shortcuts: TShortcut[]
}

declare type TObject = { [name: string]: any }

declare type ObjectAny = TObject | string | boolean | Buffer | symbol | number
