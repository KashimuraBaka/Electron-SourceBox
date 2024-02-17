import * as TSteamworks from '../main/utils/steamworks/client'

declare global {
  namespace Steamworks {
    type CSteamID = TSteamworks.CSteamId
    type EFriendFlags = TSteamworks.EFriendFlags
    type EItemState = TSteamworks.EItemState

    namespace ISteamFriends {
      type FrinedInfo = TSteamworks.steamfriends.FrinedInfo
    }

    namespace ISteamUGC {
      type DownloadInfo = TSteamworks.steamugc.DownloadInfo
      type WorkshopItemQueryOptions = TSteamworks.steamugc.WorkshopItemQueryOptions
      type WorkshopItem = TSteamworks.steamugc.WorkshopItem
      type UgcResult = TSteamworks.steamugc.UgcResult
      type UgcUpdate = TSteamworks.steamugc.UgcUpdate
      type InstallInfo = TSteamworks.steamugc.InstallInfo
    }

    type RichPresenceKeys =
      /** UTF-8 字符串, 将在 Steam 好友列表中"查看游戏信息"对话框显示. */
      | 'status'
      /**
       * UTF-8 字符串, 包含好友如何能连接至游戏的命令行
       * - 这将启用"查看游戏信息"对话框中的"加入游戏"按钮, 在右键点击 Steam 好友列表出现的菜单以及玩家的 Steam 社区个人资料中
       * - 确保您的应用实现了 ISteamApps::GetLaunchCommandLine , 以便您可以在通过命令行启动时禁用弹出警告
       */
      | 'connect'
      /**
       * 命名一个丰富状态本地化标记, 该标记将在 Steam 客户端 UI 中以用户选定的语言显示
       * 参见 Rich Presence Localization 了解更多信息, 包括测试此丰富状态数据的页面链接
       * 如果 steam_display 未设置为有效本地化标签, 则丰富状态将不会显示在 Steam 客户端中
       */
      | 'steam_display'
      /**
       * 设置时, 对 Steam 客户端指明玩家为特定组成员
       * 属于同一组的玩家可以在 Steam UI 各处组织在一起
       * 此字符串能识别队伍、服务器或与您游戏相关的其他群组. 字符串本身不显示给用户
       */
      | 'steam_player_group'
      /**
       * 设置时, 指明在 steam_player_group 中的玩家总人数
       * 若并非一个组的所有成员都在用户的好友列表中, Steam 客户端可以使用此数字显示关于该组的附加信息 （例如, "鲍勃、彼特及其他 4 人"）
       */
      | 'steam_player_group_size'

    interface Handlers {
      /**
       * 初始化SteamworksSDKiSteamUGC
       * @return {boolean} 是否初始化成功
       */
      run(keys: 'initialized'): Promise<string | undefined>

      /**
       * 设置当前Steamworks Appid
       * @param apppid 要修改AppID
       * @noreturn
       */
      run(keys: 'setAppid', appid: number): Promise<boolean>

      /**
       * 简单查询服务器信息
       * @param address 服务器地址
       * @return {SourceServerInfo} 返回服务器信息
       */
      run(keys: 'simpleQueryServer', address: string): Promise<A2S.SourceServerInfo>

      /**
       * 查询服务器玩家
       * @param address 服务器地址
       * @return {A2S.SourceServerPlayers} 玩家信息
       */
      run(keys: 'queryServerPlayers', address: string): Promise<A2S.SourceServerPlayers>

      /**
       * 查询服务器规则参数
       * @param address 服务器地址
       * @return {A2S.SourceServerRules} 服务器规则
       */
      run(keys: 'queryServerRules', address: string): Promise<A2S.SourceServerRules>

      /**
       * 检查您的可执行文件是否通过 Steam 启动，如果不是，则通过 Steam 重新启动。
       * @param appId 应用ID
       * @return {boolean}
       * - 如果返回 true，则在必须时启动 Steam 客户端，然后通过客户端再次启动您的游戏，而您应尽快退出进程。
       * 此举将有效地运行 steam://run/<AppId>，可能不会重启调用此函数的确切可执行文件，因为它将始终重启您 Steam 库文件夹中安装的版本。
       * - 而如果返回 false，则您的游戏是由 Steam 客户端启动，无需进行任何操作。
       * 一个例外是，如果存在 steam_appid.txt 文件，则无论何种情况都会返回 false。 这让您不必通过 Steam 客户端启动您的游戏，便能进行开发与测试。
       * 将游戏上传至您的 Steam depot 时，务必删除 steam_appid.txt！
       */
      run(keys: 'restartAppIfNecessary', appId: number): Promise<boolean>

      /**
       * 检查活跃用户是否订阅了特定 AppId
       * 只有在需要检查与您游戏有关的另一个游戏（如试用版）的所有权时, 才使用此函数
       * @param appId 要检查的 AppID
       * @return {boolean} true 表明该活跃用户订阅了特定 App ID; 否则返回 false
       */
      run(keys: 'steamapps.isSubscribedApp', appId: number): Promise<boolean>

      /**
       * 检查某特定应用是否已安装
       * 当前用户也许并不拥有此应用, 只是通过免费周末等活动进行过安装
       * 此函数只对基础应用程序有效, 对可下载内容（DLC） 无效. 针对 DLC 请使用 BIsDlcInstalled
       * @param appId 要检查的应用程序的 AppID
       * @return {boolean} true 表明指定 AppID 已安装; 否则返回 false
       */
      run(keys: 'steamapps.isAppInstalled', appId: number): Promise<boolean>

      /**
       * 检查用户是否拥有特定 DLC 且该 DLC 已安装
       * @param appId 要检查的 DLC 的 AppID
       * @return {boolean} true 表明该用户拥有 DLC 且已安装; 否则返回 false
       */
      run(keys: 'steamapps.isDlcInstalled', appId: number): Promise<boolean>

      /**
       * 检查活跃用户是否订阅了当前 App ID
       * 注意：如果您使用 Steam DRM 或调用 SteamAPI_RestartAppIfNecessary, 此函数将始终返回 true
       * @return {boolean} true 表明该活跃用户拥有当前 AppId; 否则返回 false
       */
      run(keys: 'steamapps.isSubscribed'): Promise<boolean>

      /**
       * 检查该用户是否通过免费周末订阅了当前 appID
       * 在使用此函数前请通过 Steamworks 讨论板联系 Valve 技术客户经理, 来为免费周末活动制作相应程序包, 确保活动能顺利开展
       * @return {boolean} true 表明该活跃用户通过免费周末订阅了当前 App Id; 如果为其他任何类型的许可, 则返回 false
       */
      run(keys: 'steamapps.isSubscribedFromFreeWeekend'): Promise<boolean>

      /**
       * 检查用户帐户是否受到 VAC 封禁
       * @return {boolean} true 表明该用户帐户受到 VAC 封禁; 否则返回 false
       */
      run(keys: 'steamapps.isVacBanned'): Promise<boolean>

      /**
       * 检查当前 AppID 是否供网吧使用。(已弃用 - 不再使用。)
       * @return {boolean} true 表明此许可用于网吧; 否则返回 false
       */
      run(keys: 'steamapps.isCybercafe'): Promise<boolean>

      /**
       * 检查用户拥有的许可是否提供低暴力 depot
       * 在对内容有限制的国家, 低暴力 depot 有利于游戏销售
       * @return {boolean} true 表明用户拥有的许可提供低暴力 depot; 否则返回 false
       */
      run(keys: 'steamapps.isLowViolence'): Promise<boolean>

      /**
       * 获取此应用的 buildid, 可能根据游戏的后端更新而随时改变
       * @return {number} 此应用的当前 Build Id。如您未运行从 Steam 下载的生成版本, 则默认为 0
       */
      run(keys: 'steamapps.appBuildId'): Promise<number>

      /**
       * 获取特定 AppID 的安装文件夹
       * 即使应用程序未安装, 该函数仍可按游戏将在 Steam 库的默认安装位置进行调用
       * @param appId 要获得安装目录的 AppID
       * @return {string} App 安装路径
       */
      run(keys: 'steamapps.appInstallDir', appId: number): Promise<string>

      /**
       * 获取当前应用原拥有者的 Steam ID。如该 ID 与当前用户不一致, 则为借用所得
       * @return {CSteamID} 所有 Steam 帐户、Steam 组、大厅和聊天室的全局唯一标识符.
       */
      run(keys: 'steamapps.appOwner'): Promise<CSteamID>

      /**
       * 获取当前应用支持的语言列表, 以逗号分隔
       * 参见本地化和语言, 了解可能会返回的语言的完整列表
       * @return {string[]} 返回支持语言列表
       */
      run(keys: 'steamapps.availableGameLanguages'): Promise<string[]>

      /**
       * 获取用户当前设置的语言
       * 如果用户未明确选择产品语言, 则回退至 Steam UI 语言
       * 参见支持的语言, 查看完整语言列表
       */
      run(keys: 'steamapps.currentGameLanguage'): Promise<string>

      /**
       * 检查用户是否从一个测试版分支运行。如是, 获取测试版分支名称
       * @return {string | null} 用户运行测试版分支
       */
      run(keys: 'steamapps.currentBetaName'): Promise<string | null>

      /**
       * 设置当前用户的丰富状态键/值, 该键/值会自动分享给玩同一游戏的所有好友
       * 详情 https://partner.steamgames.com/doc/api/ISteamFriends#SetRichPresence
       * @param pchKey 要设置的丰富状态"键"
       * @param pchValue 要与 pchKey 关联的丰富状态"值". 若设为空字符串（""）或 NULL, 便会移除已设置的键
       */
      run(keys: 'steamfriends.setRichPresence', pchKey: RichPresenceKeys, pchValue?: string | undefined | null): void

      /**
       * 获取当前用户的昵称（显示名称）.
       * 此名称与用户的社区个人资料页面显示的名称相同.
       * @return {string} UTF-8 格式的当前用户的昵称. 保证不为 NULL.
       */
      run(keys: 'steamfriends.getPersonaName'): Promise<string>

      /**
       * 获取好友所有信息
       *
       * @param flags 一个或多个 EFriendFlags 的并集（二进制）
       * @returns 返回指定标识所有好友信息
       */
      run(keys: 'steamfriends.getFriends', flags: EFriendFlags): Promise<ISteamFriends.FrinedInfo[]>

      /**
       * 获取当前登录至 Steam 客户端帐户的 Steam ID. 通常被称为"当前用户", 或"本地用户".
       * Steam ID 是 Steam 帐户、Steam 组、大厅和聊天室的唯一标识符, 用于在 Steamworks API 各部分中区分用户.
       * @return {CSteamID} 所有 Steam 帐户、Steam 组、大厅和聊天室的全局唯一标识符.
       */
      run(keys: 'steamuser.getSteamId'): Promise<CSteamID>

      /**
       * 获得用户的 Steam 社区个人资料中显示的 Steam 等级
       * @return {number} 当前用户的等级
       */
      run(keys: 'steamuser.getPlayerSteamLevel'): Promise<number>

      /**
       * 返回客户端正在运行的 2 位 ISO 3166-1-alpha-2 格式的国家代码。如"US"或"UK"
       * 通过 IP 地址位置数据库来查找
       * @return {string} 所在区域代码
       */
      run(keys: 'steamutils.getIpCountry'): Promise<string>

      /**
       * 获取成就的解锁状态
       * @param pchName 成就的"API 名称"
       * @return {boolean} 返回成就的解锁状态, 此函数若达成所有下列条件, 返回 true; 否则返回 false
       * - RequestCurrentStats 已完成且回调返回成功
       * - 在 Steamworks 网站的"应用管理员"中存在指定成就的"API 名称", 且更改已发布
       */
      run(keys: 'steamuserstats.getAchievement', pchName: string): Promise<boolean>

      /**
       * 解锁一项成就
       * 您必须先调用 RequestCurrentStats, 且须通过其回调返回成功之后, 才能调用此函数
       * 您可以多次解锁一项成就, 而无需担心只设置尚未设置的成就
       * 此调用只修改 Steam 的内存状态, 因此开销较小. 要向服务器发送解锁状态, 触发 Steam 界面通知, 您必须调用 StoreStats
       * @param achievementId 要解锁的成就的"API 名称"
       * @return {boolean} 此函数若达成所有下列条件, 返回 true; 否则返回 false
       * - 在 Steamworks 网站的"应用管理员"中存在指定成就的"API 名称", 且更改已发布
       * - RequestCurrentStats 已完成且回调返回成功
       */
      run(keys: 'steamuserstats.setAchievement', achievementId: string): Promise<boolean>

      /**
       * 重置一项成就的解锁状态
       * 此函数主要仅用于测试目的
       * 您必须先调用 RequestCurrentStats, 且须通过其回调返回成功之后, 才能调用此函数
       * 此调用只修改 Steam 的内存状态, 因此开销较小. 要向服务器发送解锁状态, 触发 Steam 界面通知, 您必须调用 StoreStats
       * @param achievement 要重置的成就的 "API 名称"
       * @return {boolean} 此函数若达成所有下列条件, 返回 true; 否则返回 false
       * - 在 Steamworks 网站的“应用管理员”中存在指定成就的“API 名称”, 且更改已发布
       * - RequestCurrentStats 已完成且回调返回成功
       */
      run(keys: 'steamuserstats.clearAchievement', achievement: string): Promise<boolean>

      /**
       * 查看是否此用户启用了按游戏设置的 Steam 云, 或在"游戏属性"->"更新"对话框中禁用了 Steam 云
       * 确定您也检查了 IsCloudEnabledForAccount. 这两个选项互相排斥
       * 我们一般建议您允许用户使用游戏内选项切换此设置. 您可以使用 SetCloudEnabledForApp 进行切换
       * @return {boolean} true, 表示 Steam 云为此应用启用; 否则, 返回 false
       */
      run(keys: 'cloud.isEnabledForApp'): Promise<boolean>

      /**
       * 检查是否此用户帐户中的所有 Steam 云设置都已启用, 或者是否用户在"设置"->"云"对话框禁用了 Steam 云
       * 确定您也检查了 IsCloudEnabledForApp. 这两个选项互相排斥
       * @return {boolean} true, 表示此帐户启用了 Steam 云; 否则, 返回 false
       */
      run(keys: 'cloud.isEnabledForAccount'): Promise<boolean>

      /**
       * 打开一个二进制文件, 将文件内容读取至一个字节数组, 然后关闭文件
       * 注意： 这是一个同步调用, 因此将阻止您调用磁盘 IO 的线程, 也将阻止 SteamAPI, 这可能导致您应用程序中的其他线程受阻
       * 要避免客户端电脑由于磁盘繁忙出现"卡顿", 我们建议使用此API 的异步版本, 即 FileReadAsync
       * @param pchFile 	要读取的文件名称
       * @return {boolean} true, 表示文件成功读取
       */
      run(keys: 'cloud.readFile', pchFile: string): Promise<boolean>

      /**
       * 创建一个新文件, 将字节写入文件, 再关闭文件. 目标文件若已存在, 将被覆盖
       * 注意： 这是一个同步调用, 因此将阻止您调用磁盘 IO 的线程, 也将阻止 SteamAPI, 这可能导致您应用程序中的其他线程受阻
       * 要避免客户端电脑由于磁盘繁忙出现"卡顿", 我们建议使用此API 的异步版本, 即 FileWriteAsync
       * @param name 要写入的文件的名称
       * @param content 要写入文件的内容
       * @return {boolean} true,  表示写入成功. 否则, 在下列情况时, 返回 false：
       * - 您尝试写入的文件大于 k_unMaxCloudFileChunkSize 所规定的 100MiB.
       * - cubData 小于 0.
       * - pvData 为 NULL.
       * - 您尝试从无效路径或文件名读取.
       * 由于 Steam 云是跨平台的, 文件需要在支持的所有操作系统与文件系统中均有有效名称.
       * 参见微软命名文件、路径与命名空间文档.
       * - 超过了当前用户的 Steam 云存储配额. 云存储或者缺乏空间, 或者有过多文件.
       * - Steam 无法写入磁盘, 该位置可能为只读.
       */
      run(keys: 'cloud.writeFile', name: string, content: string): Promise<boolean>

      /**
       * 从本地磁盘中删除一个文件, 并将该删除传播到云端.
       * 此函数应该只在用户主动删除文件时使用. 如果您希望将一个文件从 Steam 云中移除, 但将其保留在用户的本地磁盘, 则需使用 FileForget.
       * 您删除文件后, 可以使用 FileWrite 重新写入该文件, 以将其重新上传至 Steam 云.
       * @param name 要删除的文件的名称
       * @return {boolean} true,  表示文件存在且已成功删除; 否则, 如果文件不存在, 返回 false.
       */
      run(keys: 'cloud.deleteFile', name: string): Promise<boolean>

      /**
       * 检查指定文件是否存在
       * @param name 文件名称
       * @return {boolean} true,  表示文件存在; 否则, 返回 false.
       */
      run(keys: 'cloud.fileExists', name: string): Promise<boolean>

      /**
       * 创建一个尚无附加内容的新创意工坊物品
       * @param appId 将使用此物品的 App ID
       * @return {ISteamUGC.UgcResult}
       */
      run(keys: 'workshop.createItem', appId?: number | null | undefined): Promise<ISteamUGC.UgcResult>

      /**
       * 下载或更新创意工坊物品
       * 如果返回值为 true, 在调用 GetItemInstallInfo 或访问磁盘上创意工坊物品前, 注册并等待 DownloadItemResult_t 回调
       * 如果用户并未订阅该物品（例如匿名登录的游戏服务器）, 创意工坊物品会下载并临时存放于缓存中
       * 如果创意工坊物品有一个状态为 k_EItemStateNeedsUpdate 的物品, 则可调用此函数来开始更新. 在调用 DownloadItemResult_t 前切勿访问磁盘上的创意工坊物品
       * DownloadItemResult_t 回调中包含与创意工坊物品关联的应用 ID. 无论正在运行什么应用程序, 均会为所有物品下载调用处理程序, 因此请检查该应用 ID 与运行中的应用的 ID 是否一致
       * @param itemId 要下载的创意工坊物品
       * @param highPriority 以高优先级模式开始下载, 暂停所有其他正在进行的 Steam 下载并立即开始下载此创意工坊物品
       * @return {boolean} true 表明下载成功开始; 否则, 如果 nPublishedFileID 无效或用户尚未登录, 返回 false
       */
      run(keys: 'steamugc.downloadItem', itemId: bigint, highPriority: boolean): Promise<boolean>

      /**
       * 获取设置了 k_EItemStateNeedsUpdate 的创意工坊物品的待下载状态信息。
       * @param itemId 要获取下载信息的创意工坊物品
       * @return {ISteamUGC.DownloadInfo | null}
       */
      run(keys: 'steamugc.getItemDownloadInfo', itemId: bigint): Promise<ISteamUGC.DownloadInfo | null>

      /**
       * 获取此客户端上创意工坊物品的当前状态。
       * @param item 要获取状态的创意工坊物品
       * @param query 查询条件
       * @return {WorkshopItem | null} 创意工坊物品信息
       */
      run(keys: 'steamugc.getItem', itemId: bigint, query?: ISteamUGC.WorkshopItemQueryOptions): Promise<ISteamUGC.WorkshopItem | null>

      /**
       * 批量获取客户端上创意工坊物品的状态
       * @param items 要获取状态的创意工坊物品列表
       * @param query 查询条件
       * @return {(ISteamUGC.WorkshopItem | null)[]}  创意工坊物品信息列表
       */
      run(keys: 'steamugc.getItems', items: bigint[], query?: ISteamUGC.WorkshopItemQueryOptions): Promise<(ISteamUGC.WorkshopItem | null)[]>

      /**
       * 获得当前游戏中，当前用户所订阅的所有物品的清单。
       * @return {bigint[]} 当前订阅的所有创意工坊ID
       */
      run(keys: 'steamugc.getSubscribedItems'): Promise<bigint[]>

      /**
       * 获取设置了 k_EItemStateInstalled 的创意工坊物品当前已安装在光盘上内容的相关信息。
       * 调用此函数会为当前玩家在创意工坊物品上设置“使用过”标记，并将其加入玩家的 k_EUserUGCList_UsedOrPlayed 列表。
       * 如果设置了 k_EItemStateLegacyItem，那么pchFolder 包含通往遗留文件自身而非文件夹的路径。
       * @param itemId 要获取状态的创意工坊物品列表
       * @return {ISteamUGC.InstallInfo | null} 返回创意工坊物品信息
       * true 表明创意工坊物品已安装。false 表明出现下列情况之一：
       * - cchFolderSize 为 0
       * - 创意工坊物品无内容
       * - 创意工坊物品未安装
       * - GetItemState
       */
      run(keys: 'steamugc.getItemInstallInfo', itemId: bigint): Promise<ISteamUGC.InstallInfo | null>

      /**
       * 获取此客户端上创意工坊物品的当前状态
       * @param itemId 要获取状态的创意工坊物品
       * @return {number} 返回此物品状态。 应与 EItemState 标记一起使用，以确定创意工坊物品的状态
       */
      run(keys: 'steamugc.getItemState', itemId: bigint): Promise<EItemState>

      /**
       * 订阅创意工坊物品, 会尽快下载并安装该物品
       * @param itemId 要订阅的创意工坊物品项目
       * @noreturn
       */
      run(keys: 'steamugc.subscribeItem', itemId: bigint): Promise<void>

      /**
       * 取消来自创意工坊物品的订阅, 退出游戏后会移除该物品
       * @param itemId 要取消订阅的创意工坊物品项目
       * @noreturn
       */
      run(keys: 'steamugc.unsubscribeItem', itemId: bigint): Promise<void>

      /**
       * 更新创意工坊物品
       * @param itemId 要更新的创意工坊物品项目
       * @param updateDetails 更新选项
       * @param appId 更新创意工坊项目对应游戏ID
       * @return {ISteamUGC.UgcResult}
       */
      run(keys: 'steamugc.updateItem', itemId: bigint, updateDetails: ISteamUGC.UgcUpdate, appId?: number): Promise<ISteamUGC.UgcResult>
    }
  }
}
