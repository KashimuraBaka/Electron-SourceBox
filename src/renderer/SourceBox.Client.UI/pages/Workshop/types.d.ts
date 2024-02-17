/** 创意工坊订阅信息 */
declare interface WorkshopItemSubscriptionDetail extends Steamworks.ISteamUGC.WorkshopItem {
  /** 创意工坊作者名称 */
  author: string
  /** 创意工坊时间间距 */
  timeDistance: number
  /** 创意工坊安装信息 */
  install_info: Steamworks.ISteamUGC.InstallInfo | null
}

/** 扩展 Steamworks 接口信息 */
declare interface WorkshopCollectionItemData extends Steamworks.ISteamUGC.WorkshopItem {
  /** 作者名称 (原 SteamworksAPI 不提供作者信息) */
  author: string
}

/** 创意工坊物品信息 */
declare interface WorkshopCollectionItem {
  /** 是否勾选信息 */
  checked: boolean
  /** 创意工坊物品信息 */
  item: WorkshopCollectionItemData
}
