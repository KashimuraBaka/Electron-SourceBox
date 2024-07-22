/** STEAMAPI响应结果 */
export type TSteamResponse<T> = {
  response: T
}

/** STEAM 个人资料信息（批量查询） */
export interface TSteamPlayersInfo {
  players: SteamPlayerInfo[]
}

/** STEAM 个人资料信息 */
export interface SteamPlayerInfo {
  /** 头像普通图地址 */
  avatar: string
  /** 头像完整图地址 */
  avatarfull: string
  /** 头像文件哈希值 */
  avatarhash: string
  /** 头像缩略图地址 */
  avatarmedium: string
  /** 评论权限 */
  commentpermission: number
  /** 个人资料状态 */
  communityvisibilitystate: number
  /** 上次登录时间 */
  lastlogoff: string
  /** 玩家名称 */
  personaname: string
  /** 玩家STEAM状态 */
  personastate: number
  /** 玩家状态标志 */
  personastateflags: number
  /** 个人组id */
  primaryclanid: string
  /** 个人资料状态 */
  profilestate: number
  /** 个人资料链接 */
  profileurl: string
  /** STEAMID */
  steamid: string
  /** 账号创建时间 */
  timecreated: string
}

export interface TSteamGameRequirement {
  /** 最低配置 */
  minimum: string
  /** 推荐配置 */
  recommended?: string
}

export interface TSteamSubGamePackage {
  /** 应用包ID */
  packageid: number
  /** 应用包优惠信息 */
  percent_savings_text: string
  /** 应用包优惠信息数量 */
  percent_savings: 0
  /** 应用包名称 */
  option_text: string
  /** 应用包描述 */
  option_description: string
  /** 应用包能免费获取次数 */
  can_get_free_license: string
  /** 应用包能否免费获取 */
  is_free_license: true
  /** 带折扣的价格（以分为单位） */
  price_in_cents_with_discount: number
}

export interface TSteamGamePackage {
  /** 应用包名称 */
  name: string
  /** 应用包标题 */
  title: string
  /** 应用包描述 */
  description: string
  /** 应用包选中时信息 */
  selection_text: string
  /** 应用包保存信息 */
  save_text: string
  /** 显示类型 */
  display_type: number
  /** 是否定期订阅 */
  is_recurring_subscription: string
  /** 子应用包包含 */
  subs: TSteamSubGamePackage[]
}

export interface TSteamGamePlatform {
  /** 是否支持 Windows */
  windows: boolean
  /** 是否支持 Mac */
  mac: boolean
  /** 是否支持 Linux */
  linux: boolean
}

export interface TSteamGameCategory {
  /** 类别ID */
  id: number
  /** 类别描述 */
  description: string
}

export interface TSteamGameGenre {
  /** 类型ID */
  id: string
  /** 类型描述 */
  description: string
}

export interface TSteamGameScreenshot {
  /** 截图ID */
  id: number
  /** 截图缩略图 */
  path_thumbnail: string
  /** 截图原图 */
  path_full: string
}

export interface TSteamGameMovie {
  /** 视频ID */
  id: number
  /** 视频名称 */
  name: string
  /** 视频预览图 */
  thumbnail: string
  /** webm 视频格式链接 */
  webm: { [key: string]: string }
  /** mp4 视频格式链接 */
  mp4: { [key: string]: string }
  /** 是否高光 */
  highlight: true
}

export interface TSteamAchievements {
  /** 成就数量 */
  total: number
  /** 成就列表 */
  highlighted: {
    /** 成就名称 */
    name: string
    /** 成就图片链接 */
    path: string
  }[]
}

export interface TSteamGameDetails {
  [key: string]: {
    success: boolean
    data?: {
      /** 应用类型, 软件还是游戏 */
      type: string
      /** 应用名称 */
      name: string
      /** 应用AppID */
      steam_appid: number
      /** 请求寿命 */
      required_age: number
      /** 是否免费游戏 */
      is_free: true
      /** 附带 DLC ID列表 */
      dlc: number[]
      /** 应用描述 */
      detailed_description: string
      /** 应用关于 */
      about_the_game: string
      /** 应用简单描述 */
      short_description: string
      /** 应用支持语言 */
      supported_languages: string
      /** 头像预览图片 */
      header_image: string
      /** 胶囊预览图像 */
      capsule_image: string
      /** 胶囊预览图像v5 */
      capsule_imagev5: string
      /** 应用主页 */
      website: string
      /** Windows 配置推荐 */
      pc_requirements: TSteamGameRequirement
      /** Mac 配置推荐 */
      mac_requirements: TSteamGameRequirement
      /** Linux 配置推荐 */
      linux_requirements: TSteamGameRequirement
      /** 开发商 */
      developers: string[]
      /** 发行商 */
      publishers: string[]
      /** 当前应用包含的ID */
      packages: number[]
      /** 当前应用所包含应用包 */
      package_groups: TSteamGamePackage[]
      /** 应用系统支持 */
      platforms: TSteamGamePlatform
      /** 应用类别 (与其说是支持) */
      categories: TSteamGameCategory[]
      /** 应用类型 */
      genres: TSteamGameGenre[]
      /** 应用截图 */
      screenshots: TSteamGameScreenshot[]
      /** 应用视频 */
      movies: TSteamGameMovie[]
      /** 应用建议 */
      recommendations: { total: number }
      /** 应用包含成就 */
      achievements: TSteamAchievements
      /** 应用发售日期 */
      release_date: {
        /** 是否即将发售 */
        coming_soon: boolean
        /** 发售日期 */
        date: string
      }
      /** 提供支持信息 */
      support_info: {
        /** 服务网站地址 */
        url: string
        /** 服务邮箱 */
        email: string
      }
      /** 背景图片 */
      background: string
      /** 原始背景图片 */
      background_raw: string
      /** 内容描述 */
      content_descriptors: {
        /** 描述ID */
        ids: number[]
        /** 描述笔记 */
        notes: string
      }
    }
  }
}

export interface TSteamAppid<T = number> {
  appid: T
  name: string
}

export interface TSteamAppList {
  applist: {
    apps: TSteamAppid[]
  }
}

export interface TSteamMiniProfile {
  /** 玩家等级 */
  level: number
  /** 头像元素类 (无用) */
  level_class: string
  /** 头像链接 */
  avatar_url: string
  /** 玩家名称 */
  persona_name: string
  /** 徽章信息 */
  favorite_badge: {
    /** 徽章名称 */
    name: string
    /** 徽章经验值 */
    xp: string
    /** 徽章等级 */
    level: number
    /** 徽章描述 */
    description: string
    /** 徽章图标链接 */
    icon: string
  }
  /** 头像框架图片 */
  avatar_frame: string
}

export interface TSteamWorkshopItemDetails {
  /** 创意工坊ID */
  id: bigint
  /** 创意工坊名称 */
  title: string
  /** 创意工坊预览图片链接 */
  preview_url: string
  /** 创意工坊作者名称 */
  author: string
  /** 创意工坊作者链接 */
  author_url: string
  /** 创意工坊描述(不完整) */
  desc: string
}

export interface TSteamWorkshopCollectionDetails<T = TSteamWorkshopItemDetails> {
  /** 对应游戏ID */
  appid: number
  /** 对应游戏名 */
  app_name: string
  /** 创意工坊合集ID */
  id: number
  /** 创意工坊收集者 */
  author: string
  /** 创意工坊合集名称 */
  title: string
  /** 创意工坊合集内容 */
  content: string
  /** 创意工坊合集背景 */
  background: string
  /** 创意工坊创建时间 */
  create_time: string
  /** 创意工坊更新时间 */
  update_time: string
  /** 创意工坊物品列表 */
  items: T[]
}

export interface TSteamWorkshopCollectionDetailsRespones {
  success: boolean
  data?: TSteamWorkshopCollectionDetails
}
