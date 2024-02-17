export function init(appId?: number | undefined | null): void
export function restartAppIfNecessary(appId: number): boolean
export function runCallbacks(): void
/** ISteamUser 接口回调 */
export const enum SteamApiCallback {
  /** 好友的状态改变时调用 */
  PersonaStateChange = 0,
  /**
   * 在与 Steam 后端建立连接时调用。这说明 Steam 客户端现在与 Steam 服务器有了有效连接。
   * 通常这将在游戏启动之前发生，且应该只在用户因网络问题或 Steam 服务器更新而掉线时才发生。
   */
  SteamServersConnected = 1,
  /** 在客户端失去与 Steam 服务器的连接时调用。实时服务将禁用，直到发送了匹配的 SteamServersConnected_t 时为止。 */
  SteamServersDisconnected = 2,
  /** 在试图连接失败时调用。如果 Steam 客户端未连接，并且重新尝试建立连接时失败，这将定期发生。 */
  SteamServerConnectFailure = 3,
  /** 大厅元数据已变更 */
  LobbyDataUpdate = 4,
  /** 大厅聊天室状态已更改，通常在用户加入或离开大厅时发送 */
  LobbyChatUpdate = 5,
  /**
   * 当用户尝试通过好友列表或邀请加入大厅时调用。收到此回调时，游戏客户端应尝试连接至指定大厅。
   * 如果游戏尚未运行，会用命令行参数 +connect_lobby<64-bit lobby Steam ID> 自动启动。
   */
  GameLobbyJoinRequested = 6,
  /**
   * 用户希望通过 SendP2PPacket 与我们在 P2P 通道通信。
   * 响应时，如果您希望打开与用户之间的网络通道，需要调用 AcceptP2PSessionWithUser。
   */
  P2PSessionRequest = 7,
  /**
   * 指定用户无法收到数据包时调用。
   * 所有已排入队列但此时仍未发送的数据包会丢弃，再次尝试发送会重新尝试进行连接（但如果再次失败，会再次丢包）。
   */
  P2PSessionConnectFail = 8,
  /** 在用户响应了小额交易授权请求时调用 */
  MicroTxnAuthorizationResponse = 9
}
/** 用来枚举好友列表或快速检查用户之间关系的标识 */
export const enum EFriendFlags {
  /** 无 */
  None = 0,
  /** 当前用户已屏蔽的用户 */
  Blocked = 1,
  /** 向当前用户发送了好友邀请的用户 */
  FriendshipRequested = 2,
  /** 当前用户的"一般"好友 */
  Immediate = 3,
  /** 与当前用户在同一个（小型）Steam 组的用户 */
  ClanMember = 4,
  /** 由 SetPlayedWith 设置、处于同一个服务器的用户 */
  OnGameServer = 5,
  /** 当前用户向其发送了好友邀请的用户 */
  RequestingFriendship = 6,
  /** 调用 RequestUserInformation 后，目前正在发送有关其自身额外信息的用户 */
  RequestingInfo = 7,
  /** 当前用户已忽略的用户 */
  Ignored = 8,
  /** 忽略当前用户的用户，但当前用户依然知道这些用户 */
  IgnoredFriend = 9,
  /** 在同一个聊天中的用户 */
  ChatMember = 10,
  /** 返回所有的好友标识 */
  All = 11
}
/** Steam 好友可能处于的状态列表 */
export const enum EPersonaState {
  /** 好友目前未登录 */
  Offline = 0,
  /** 好友已登录 */
  Online = 1,
  Busy = 2,
  /** 自动离开功能 */
  Away = 3,
  /** 自动离开了很长时间 */
  Snooze = 4,
  /** 在线，交易中 */
  LookingToTrade = 5,
  /** 在线，等待游戏中 */
  LookingToPlay = 6
}
/** 指定物品状态。 这些标记可以组合使用。 通过 GetItemState 返回。 */
export const enum EItemState {
  /** 未在客户端上追踪此物品。 */
  None = 0,
  /** 当前用户已订阅该物品。 不仅仅是被缓存。 */
  Subscribed = 1,
  /** 此物品是使用 ISteamRemoteStorage 中的旧创意工坊函数创建的。 */
  LegacyItem = 2,
  /** 该物品已安装且可用（但可能太过陈旧）。 */
  Installed = 4,
  /** 此物品需要更新。 原因是尚未安装，或创建者已更新其内容。 */
  NeedsUpdate = 8,
  /** 此物品更新当前正在下载。 */
  Downloading = 16,
  /** 已为此物品调用 DownloadItem，直到 DownloadItemResult_t 触发后，其内容才可用。 */
  DownloadPending = 32
}
/** 创意工坊物品的可见状态种类 */
export const enum ERemoteStoragePublishedFileVisibility {
  /** 所有人可见。 */
  Public = 0,
  /** 仅好友可见。 */
  FriendsOnly = 1,
  /** 仅物品作者可见。 若需将创意工坊物品从 API 中删除，将其设置为私有是最接近的做法。 */
  Private = 2,
  /** 对所有人可见，但不会在任何全局查询中返回。也不会在任何用户列表中返回，除非调用方是创建者或订阅者。 */
  Unlisted = 3
}
/** 在调用 GetItemUpdateProgress 后指明 UGCUpdateHandle_t 的状态，由 GetItemUpdateProgress 返回。 */
export const enum EItemUpdateStatus {
  /** 物品更新句柄无效，操作可能已完成，应该已为其返回了 SubmitItemUpdateResult_t 调用结果。 */
  Invalid = 0,
  /** 物品更新正在处理配置数据。 */
  PreparingConfig = 1,
  /** 物品更新正在读取并处理内容文件。 */
  PreparingContent = 2,
  /** 物品更新正在将内容更改上传到 Steam。 */
  UploadingContent = 3,
  /** 物品更新正在上传新的预览文件图像。 */
  UploadingPreviewFile = 4,
  /** 物品更新正在提交所有更改。 */
  CommittingChanges = 5
}
/** 以下的值将作为参数，使用 ActivateGameOverlayToStore 传入商店中，并修改页面开启时的行为。 */
export const enum EOverlayToStoreFlag {
  /** 无 */
  None = 0,
  /** 将指定的 AppID 加入用户的购物车 */
  AddToCart = 1,
  /** 将指定的 AppID 加入用户的购物车并显示商店页面 */
  AddToCartAndShow = 2
}
/**
 * 指定 SendP2PPacket 的发送类型。
 * 通常 k_EP2PSendUnreliable 用于类似 UDP 的数据包，而 k_EP2PSendReliable 用于类似 TCP 的数据包。
 */
export const enum EP2PSend {
  /**
   * 基础 UDP 发送。 数据包不能大于 1200 字节（MTU 的通常大小）。 可能会丢失，或顺序错乱（罕见）。
   * 发送 API 确实对基础连接有一定了解，因此如果没有完成 NAT 遍历或在连接时发生已识别的调整，数据包将会被批处理，直至连接再次打开。
   */
  Unreliable = 0,
  /**
   * 同上，但如果基础 P2P 连接仍未建立，数据包会被丢弃。 这如果用于发送给远程主机的第一个数据包上，几乎可以肯定数据包会丢失。
   * 这只对不应缓冲的数据类型有用，即语音有效负载数据包。
   */
  UnreliableNoDelay = 1,
  /**
   * 可靠的消息发送。 每条消息可发送高达 1MB 的数据。
   * 可在后台对消息进行碎片化或重组，以及用滑动窗口高效发送大型数据区块。
   */
  Reliable = 2,
  /**
   * 同上，但使用 Nagle 算法发送，发送内容将累积，直至达到当前 MTU 大小（通常约 1200 字节，但可能会变化），或已过去大约 200 毫秒（Nagle 算法）。
   * 如果您想发送一系列较小的消息，但已将他们合并成一个数据包，这将非常有用。
   * 因为所有可靠的数据流都已排序，您可用 k_EP2PSendReliableWithBuffering 发送几个小消息，然后用普通的 k_EP2PSendReliable 强制发送所有已缓冲的数据。
   */
  ReliableWithBuffering = 3
}
/** 指定大厅类型，从 CreateLobby 和 SetLobbyType 设置。 */
export const enum ELobbyType {
  /** 邀请是加入大厅的唯一途径 */
  Private = 0,
  /** 好友和受邀者可加入，但不出现在大厅列表中 */
  FriendsOnly = 1,
  /** 通过搜索返回并对好友可见 */
  Public = 2,
  /**
   * 通过搜索返回，但不对好友可见。
   * 如果希望一个用户同时在两个大厅中，比如将组配到一起时很有用。 用户只能加入一个普通大厅，最多可加入两个不可见大厅。
   */
  Invisible = 3
}
/** 需要打开的对话框类型 */
export const enum PSteamDialog {
  /** 好友对话框 */
  Friends = 0,
  /** 社区对话框 */
  Community = 1,
  /** 玩家对话框 */
  Players = 2,
  /** 设置对话框 */
  Settings = 3,
  /** 离线游戏组对话框 */
  OfficialGameGroup = 4,
  /** 状态对话框 */
  Stats = 5,
  /** 成就对话框 */
  Achievements = 6
}
/** Steam 游戏在全局中的唯一标识符 */
export interface CSteamId {
  /** 64位 SteamID */
  steamId64: bigint
  /** 32位 SteamID */
  steamId32: string
  /** 账户ID */
  accountId: number
}
export namespace callback {
  /**
   * 注册该用户操作回调
   *
   * @param steam_callback Steam用户操作回调
   * @param handler 发生时间回调
   */
  export function registerCallback<C extends keyof import('./callbacks').CallbackReturns>(
    steamCallback: C,
    handler: (value: import('./callbacks').CallbackReturns[C]) => void
  ): Handle
  export class Handle {
    disconnect(): void
  }
}
export namespace steamapps {
  /**
   * 检查活跃用户是否订阅了特定 AppId。
   * 只有在需要检查与您游戏有关的另一个游戏（如试用版）的所有权时，才使用此函数。
   *
   * @param app_id 要检查的 AppID
   * @returns true 表明该活跃用户订阅了特定 App ID；否则返回 false。
   */
  export function isSubscribedApp(appId: number): boolean
  /**
   * 检查用户是否拥有特定 DLC 且该 DLC 已安装。
   *
   * @param app_id 要检查的 DLC 的 AppID
   * @returns true 表明该用户拥有 DLC 且已安装；否则返回 false。
   * 注意： 应只用于简单的客户端检查，不能用于授予游戏中物品。
   */
  export function isDlcInstalled(appId: number): boolean
  /**
   * 检查某特定应用是否已安装。
   * 当前用户也许并不拥有此应用，只是通过免费周末等活动进行过安装。
   * 此函数只对基础应用程序有效，对可下载内容（DLC） 无效。 针对 DLC 请使用 BIsDlcInstalled。
   *
   * @param app_id 要检查的应用程序的 AppID
   * @returns true 表明指定 AppID 已安装；否则返回 false。
   */
  export function isAppInstalled(appId: number): boolean
  /**
   * 检查该用户是否通过免费周末订阅了当前 appID。
   * 在使用此函数前请通过 Steamworks 讨论板联系 Valve 技术客户经理，来为免费周末活动制作相应程序包，确保活动能顺利开展。
   *
   * @returns true 表明该活跃用户通过免费周末订阅了当前 App Id；如果为其他任何类型的许可，则返回 false 。
   */
  export function isSubscribedFromFreeWeekend(): boolean
  /**
   * 检查用户帐户是否受到 VAC 封禁。
   *
   * @returns true 表明该用户帐户受到 VAC 封禁；否则返回 false。
   */
  export function isVacBanned(): boolean
  /**
   * 检查当前 AppID 是否供网吧使用。
   *
   * @returns true 表明此许可用于网吧；否则返回 false。
   * 已弃用 - 不再使用。
   */
  export function isCybercafe(): boolean
  /**
   * 检查用户拥有的许可是否提供低暴力 depot
   * 在对内容有限制的国家，低暴力 depot 有利于游戏销售
   *
   * @returns true 表明用户拥有的许可提供低暴力 depot；否则返回 false
   */
  export function isLowViolence(): boolean
  /**
   * 检查活跃用户是否订阅了当前 App ID。
   * 注意： 如果您使用 Steam DRM 或调用 SteamAPI_RestartAppIfNecessary，此函数将始终返回 true。
   *
   * @returns true 表明该活跃用户拥有当前 AppId；否则返回 false。
   */
  export function isSubscribed(): boolean
  /**
   * 获取当前应用原拥有者的 Steam ID。如该 ID 与当前用户不一致，则为借用所得。
   *
   * @returns 当前应用的原拥有者。
   */
  export function getAppOwner(): CSteamId
  /**
   * 获取当前应用支持的语言列表，以逗号分隔。
   * 参见本地化和语言，了解可能会返回的语言的完整列表。
   *
   * @returns 当前应用支持的语言列表
   */
  export function getAvailableGameLanguages(): Array<string>
  /**
   * 检查用户是否从一个测试版分支运行。如是，获取测试版分支名称。
   *
   * @returns 测试版分支名称
   */
  export function getCurrentBetaName(): string | null
  /**
   * 获取特定 AppID 的安装文件夹。
   * 即使应用程序未安装，该函数仍可按游戏将在 Steam 库的默认安装位置进行调用。
   *
   * @param app_id 要获得安装目录的 AppID
   * @returns 安装目录路径字符串
   */
  export function getAppInstallDir(appId: number): string
  /**
   * 获取用户当前设置的语言。
   * 如果用户未明确选择产品语言，则回退至 Steam UI 语言。
   *
   * @returns 当前用户语言
   */
  export function getCurrentGameLanguage(): string
}
export namespace steamfriends {
  /** 好友游玩信息 */
  export interface FriendGameInfo {
    /** 好友正在玩的游戏的 ID */
    gameId: bigint
    /** 好友正在玩的服务器的 IP */
    gameIp: string
    /** 好友正在玩的服务器端口 */
    gamePort: number
    /** 好友正在玩的服务器的查询端口 */
    queryPort: number
    /** 好友所在的大厅的 Steam ID */
    steamIdLobby: bigint
  }
  /** 好友信息 */
  export interface FrinedInfo {
    /** 获取位于指定用户 Steam ID */
    steamid: bigint
    /** 获取指定用户的昵称（显示名称） */
    name: string
    /** 获取指定用户当前的状态 */
    state: EPersonaState
    /** 是否为好友 */
    hasFriend: boolean
    /** 正在游玩的游戏 */
    game?: FriendGameInfo
  }
  /**
   * 获取当前用户的昵称（显示名称）
   * 此名称与用户的社区个人资料页面显示的名称相同
   * 要获取其他用户的昵称，请使用 GetFriendPersonaName
   *
   * @returns UTF-8 格式的当前用户的昵称. 保证不为 NULL
   */
  export function getPersonaName(): string
  /**
   * 设置当前用户的丰富状态键/值, 该键/值会自动分享给玩同一游戏的所有好友
   * 详情 https://partner.steamgames.com/doc/api/ISteamFriends#SetRichPresence
   *
   * @param pchKey 要设置的丰富状态"键"
   * @param pchValue 要与 pchKey 关联的丰富状态"值". 若设为空字符串（""）或 NULL, 便会移除已设置的键
   */
  export function setRichPresence(key: string, value?: string | undefined | null): void
  /**
   * 检查指定的好友是否在游戏中，若是则获取游戏的相关信息。
   *
   * @param steam_id64 另一位用户的 Steam ID
   * @returns true 表示用户为好友且在游戏中, 否则返回 false
   */
  export function getFriendGamePlayed(steamId64: bigint): FriendGameInfo | null
  /**
   * 获取好友所有信息
   *
   * @param flags 一个或多个 EFriendFlags 的并集（二进制）
   * @returns 返回指定标识所有好友信息
   */
  export function getFriends(flag: EFriendFlags): Array<FrinedInfo>
  /**
   * 激活 Steam 界面，打开指定的对话框。
   * 等同于调用 ActivateGameOverlayToUser，其中steamID 设为 ISteamUser::GetSteamID。
   *
   * @param dialog 要打开的对话框。
   * - 有效选项包括“好友”、“社区”、“玩家”、“设置”、“官方游戏组”、“统计”和“成就”。
   * @noreturns
   */
  export function activateGameOverlay(dialog: PSteamDialog): void
  /**
   * 激活 Steam 界面，打开指定的对话框。
   * 有效 pchDialog 选项包括：
   * - "steamid": 打开界面网页浏览器，前往指定的用户或组资料。
   * - "chat": 打开与指定用户的聊天窗口，或加入组聊天。
   * - "jointrade": 打开以 ISteamEconomy/StartTrade Web API 开始的 Steam 交易会话窗口。
   * - "stats": 打开界面网页浏览器，前往指定用户的统计。
   * - "achievements": 打开界面网页浏览器，前往指定用户的成就。
   * - "friendadd": 以最小模式打开界面，提示用户将目标用户加为好友。
   * - "friendremove": 以最小模式打开界面，提示用户移除目标好友。
   * - "friendrequestaccept": 以最小模式打开界面，提示用户接受传入的好友邀请。
   * - "friendrequestignore": 以最小模式打开界面，提示用户忽略传入的好友邀请。
   *
   * @param dialog 要打开的对话框。
   * @param steam_id64 要将此对话框打开至的上下文的 Steam ID。
   * @noreturns
   */
  export function activateGameOverlayToUser(dialog: PSteamDialog, steamId64: bigint): void
  /**
   * 激活 Steam 界面，打开邀请对话框。 进入该大厅的邀请将从此窗口发出。
   *
   * @param lobby_id 选定玩家将受邀进入的大厅的 Steam ID
   * @noreturns
   */
  export function activateGameOverlayInviteDialog(lobbyId: bigint): void
  /**
   * 激活 Steam 界面网页浏览器，直接前往指定的 URL。
   *
   * @param url 要打开的网页。 （须有完整且符合协议的网址，例如“http://www.steampowered.com”）
   * @noreturns
   */
  export function activateGameOverlayToWebPage(url: string): void
  export function activateToStore(appId: number, flag: EOverlayToStoreFlag): void
}
export namespace steaminput {
  /** 此操作当前轴上的状态 */
  export interface AnalogActionVector {
    /** 此操作当前在水平轴上的状态 */
    x: number
    /** 此操作当前在垂直轴上的状态 */
    y: number
  }
  /**
   * 在开始使用 ISteamInput 接口时必须调用。
   *
   * @noreturns
   */
  export function init(): void
  /**
   * 返回所有模拟游戏手柄的相关控制器句柄，来判定使用 Steam 输入手柄模拟的控制器的类型
   *
   * @returns 所有 InputHandle_t
   */
  export function getControllers(): Array<Controller>
  /**
   * 查找操作集句柄。 最好在启动时调用一次，并存储句柄供所有未来 API 调用使用。
   *
   * @returns 指定操作集的句柄
   */
  export function getActionSetHandle(actionSetName: string): bigint
  /**
   * 获取指定的数字操作的句柄。
   * 注意： 此函数不接受操作集句柄参数。 这意味着 VDF 文件中的每个操作都必须有唯一的字符串标识符。
   * 换言之，如果您在两个不同的操作集中使用了一个名为“向上”的操作，此函数将只返回其中一个，而忽略另一个。
   *
   * @returns 指定数字操作的句柄。
   */
  export function getDigitalAction(actionName: string): bigint
  /**
   * 获得指定的模拟操作的句柄。
   * 注意： 此函数不接受操作集句柄参数。 这意味着 VDF 文件中的每个操作都必须有唯一的字符串标识符。
   * 换言之，如果您在两个不同的操作集中使用了一个名为“向上”的操作，此函数将只返回其中一个，而忽略另一个。
   *
   * @returns 指定模拟操作的句柄。
   */
  export function getAnalogAction(actionName: string): bigint
  /**
   * 在结束使用 ISteamInput 接口时必须调用。
   *
   * @noreturns
   */
  export function shutdown(): void
  export class Controller {
    /**
     * 重新配置控制器以使用指定的操作集（如：“菜单”、“行走”或“驾驶”）。
     * 此函数消耗低，并能多次安全调用。 通常在您的状态循环中反复调用较为容易，无需试图将其放入您的所有状态转换中。
     *
     * @param action_set_handle 您要激活的操作集的句柄
     * @noreturns
     */
    activateActionSet(actionSetHandle: bigint): void
    /**
     * 返回所提供的数字游戏操作是否当前被按下
     *
     * @returns 此操作的当前状态；若此操作当前被按下，为 true，反之则为 false。
     */
    getDigitalActionData(actionHandle: bigint): boolean
    /**
     * 返回所提供的模拟游戏操作的当前状态
     *
     * @param action_handle
     * @return 返回当前模拟游戏所在坐标
     */
    getAnalogActionVector(actionHandle: bigint): AnalogActionVector
  }
}
export namespace steammatchmaking {
  /**
   * 创建一个新的匹配大厅。
   *
   * @param lobby_type 此大厅的类型与可见性，之后可通过 SetLobbyType 更改。
   * @param max_members 可加入此大厅的玩家最大数量。 不能超过 250 人。
   * @returns SteamAPICall_t，与 LobbyCreated_t 调用结果一起使用。
   * - 触发 LobbyEnter_t 回调。
   * - 触发 LobbyDataUpdate_t 回调。
   * - 如果通过 LobbyCreated_t 调用结果返回的结果表明是成功的，那么大厅此时已有人加入，可随时使用。
   * - 本地用户已加入他们自己的大厅，因此也收到了 LobbyEnter_t 回调。
   */
  export function createLobby(lobbyType: ELobbyType, maxMembers: number): Promise<Lobby>
  /**
   * 加入一个现有大厅。
   * 可以用 RequestLobbyList 搜索并加入好友从而获取大厅的 Steam ID，也可以从邀请中获取。
   *
   * @param lobby_id 要加入的大厅的 Steam ID
   * @returns SteamAPICall_t，与LobbyEnter_t 调用结果一起使用。
   * - 触发一个 LobbyDataUpdate_t 回调。
   */
  export function joinLobby(lobbyId: bigint): Promise<Lobby>
  /**
   * 获得经筛选的相关大厅列表。
   * 每次只能有一个活跃的大厅搜索。 如果新请求被启动，旧请求将被取消。 视用户与 Steam 后端的连接状况而定，此调用可能需要 300 毫秒至 5 秒完成，20 秒则超时。
   * 注意：要筛选结果，您必须在调用此函数前先调用 AddRequestLobbyList* 函数。 每次调用该函数时筛选器都被清空。
   * 注意：如果未调用 AddRequestLobbyListDistanceFilter，将会使用 k_ELobbyDistanceFilterDefault，该函数只有在相同或邻近区域才能找到匹配结果。
   * 注意：仅返回未满的大厅，和那些调用了 k_ELobbyTypePublic 或 k_ELobbyTypeInvisible 的大厅，以及使用 SetLobbyJoinable 设置为可加入的大厅。
   *
   * @returns 返回大厅ID列表
   * - SteamAPICall_t，与 LobbyMatchList_t 调用结果一起使用。
   * 注意：这也会出于对旧应用程序的兼容而作为回调返回，但如果可能，您应使用调用结果。
   */
  export function getLobbies(): Promise<Array<Lobby>>
  export class Lobby {
    id: bigint
    /**
     * 加入一个现有大厅。
     * 可以用 RequestLobbyList 搜索并加入好友从而获取大厅的 Steam ID，也可以从邀请中获取。
     *
     * @returns SteamAPICall_t，与LobbyEnter_t 调用结果一起使用。
     * 触发一个 LobbyDataUpdate_t 回调。
     */
    join(): Promise<Lobby>
    /**
     * 离开用户当前所在的大厅，这将立即在客户端生效，大厅的其他用户将得到 LobbyChatUpdate_t 回调的通知。
     *
     * @noreturns
     */
    leave(): void
    /** 激活 Steam 界面，打开邀请对话框。 进入该大厅的邀请将从此窗口发出。 */
    openInviteDialog(): void
    /**
     * 获得一个大厅中的用户数。
     * 注意： 当前用户必须在大厅中才能获取该大厅中其他用户的 Steam ID。
     * 用于循环访问，调用此函数后，可使用 GetLobbyMemberByIndex 来获得大厅中每个成员的 Steam ID。
     * 通过 ISteamFriends 接口可自动收到大厅其他成员的个人信息（姓名、头像等）。
     *
     * @returns 大厅中成员的数量，如果当前用户没有来自大厅的数据，则为 0。
     */
    getMemberCount(): bigint
    /**
     * 当前对于可以加入的玩家数量的限制。
     * 如果没有定义限制，返回 0。
     *
     * @returns 如果指定大厅没有可用元数据，则返回 0。
     */
    getMemberLimit(): bigint | null
    /**
     * 获取当前大厅所有盛有
     *
     * @returns 当前大厅所有成员
     */
    getMembers(): Array<CSteamId>
    /**
     * 返回当前大厅所有者。
     * 注意： 您必须是大厅成员才能访问
     * 始终只有一位大厅所有者，如果当前所有者离开，该大厅中的另一名玩家将自动成为所有者。
     * 在一个大厅的所有者刚离开时，其他玩家便有机会（但较少见）加入该大厅，进入大厅后，其自身便成为该大厅的所有者。
     *
     * @returns 如果您不在大厅中，则返回 k_steamIDNil。
     */
    getOwner(): CSteamId
    /**
     * 设置一个大厅是否对其他玩家开放。 始终默认为启用新的大厅。
     * 如果禁止加入，那么没有玩家可以加入，即便他们是好友或已受邀请。
     * 禁止加入的大厅将不会从大厅搜索中返回。
     *
     * @returns true， 表示成功；否则，如果您不是大厅所有者，则返回 false。
     */
    setJoinable(joinable: boolean): boolean
    /**
     * 获取与指定大厅中的指定键相关的元数据。
     * 注意： 仅能从客户端知晓的大厅获取元数据，客户端或是从 LobbyMatchList_t 收到一个大厅列表并使用
     * RequestLobbyData 获取数据，或是在加入一个大厅后而知晓大厅的。
     *
     * @params key 要获取值的键
     * @returns 如果没有为此键设置值，或 steamIDLobby 无效，则返回一个空白字符串（""）。
     */
    getData(key: string): string | null
    /**
     * 在大厅元数据中设置键/值对。 此函数可用于设置大厅名称、当前地图、游戏模式等。
     * 这只能由大厅所有者设置。 大厅成员则应使用 SetLobbyMemberData。
     * 通过 LobbyDataUpdate_t 回调，大厅中的每位用户都将能收到大厅数据变更的通知，并且任何加入的新用户都将收到所有现有数据。
     * 将只发送已变更的数据。 在发送数据之前会稍有延迟，因此您可以重复调用来设置您需要的所有数据，并在最后一次顺序调用之后，数据将被自动批处理和发送。
     *
     * @param key 要设置数据的键。 不得长于 k_nMaxLobbyKeyLength。
     * @param value 要设置的值。 不得长于 k_cubChatMetadataMax。
     * @return true， 表示数据设置成功。 如果 steamIDLobby 为无效索引或键/值太长，则为 false。
     */
    setData(key: string, value: string): boolean
    /**
     * 从大厅移除元数据键。
     * 此操作只能由大厅所有者完成。
     * 只有当键存在时，才会发送数据。 在发送数据之前会稍有延迟，因此您可以重复调用来设置您需要的所有数据，并在最后一次顺序调用之后，数据将被自动批处理和发送。
     *
     * @returns true， 表示成功删除了键/值；否则，如果 steamIDLobby 或 pchKey 无效，则为 false。
     */
    deleteData(key: string): boolean
    /**
     * 获取当前大厅所有数据键
     *
     * @returns 返回当前大厅数据键
     */
    getFullData(): Record<string, string>
    /**
     * 合并完整数据键数据
     *
     * @params data 大厅所有数据键
     * @returns 是否合并成功
     */
    mergeFullData(data: Record<string, string>): boolean
  }
}
export namespace steamnetworking {
  /** P2P数据包信息 */
  export interface P2PPacket {
    /** 数据包原始数据 */
    data: Buffer
    /** 数据包大小 */
    size: number
    /** SteamID */
    steamId: CSteamId
  }
  /**
   * 给指定用户发送 P2P 数据包。
   * 此 API 不产生会话，而是自动遍历 NAT 或建立 Steam 中继服务器连接。
   * 注意： 在运行 NAT 遍历代码时，第一个数据包发送可能会延迟。
   * 参见 EP2PSend ，了解发送数据包的不同方法。
   * 您所发送的数据为任意类型，您可使用现成可用的系统，如 Protocol Buffers 或 Cap'n Proto，对数据包进行高效编码，或者您也可以创建自己的消息传送系统。
   *
   * @param stema_id64 要向其发送数据包的目标用户
   * @param send_type 指定您希望数据传输的方式，如可靠、不可靠、缓冲，等等。
   */
  export function sendP2PPacket(steamId64: bigint, sendType: EP2PSend, data: Buffer): boolean
  /**
   * 检查是否有 P2P 数据包可读，如有，获取消息大小。
   * 应在您使用的每个通道中循环调用。 如有数据包可用，您应调用 ReadP2PPacket 获取数据包数据。
   *
   * @returns 返回数据包的大小
   */
  export function isP2PPacketAvailable(): number
  /**
   * 在另一位用户通过 SendP2PPacket 发送的数据包中读取。
   * 如果 cubDest 缓冲区过小，无法容纳该数据包，则消息会截断。
   * 调用不阻止，如无数据可用，会返回 false。
   * 在调用此函数前，您应调用 IsP2PPacketAvailable。
   *
   * @param size 分配给 pubDest 的大小。应与 IsP2PPacketAvailable 返回的大小或您最大数据包的大小相同。
   * @returns true， 表示成功读取数据包；如无数据包可用，则返回 false。
   */
  export function readP2PPacket(size: number): P2PPacket
  /**
   * 这允许游戏指定是否接受传入的数据包。 需要在与远程主机建立真正的连接之前调用，让游戏有机会决定是否允许远程用户访问。
   * 如果一个您最近并未向其发送数据包的远程用户尝试先向您发送一个数据包，您的游戏会收到 P2PSessionRequest_t 回调。
   * 该回调包含希望向您发送数据包的用户的 Steam ID。
   * 响应回调时，您应该查看是否想与此用户通话（如用户是否与您在同一大厅内），如果您愿意，接受连接；
   * 否则，如您不想与此用户通话，只需忽略请求即可。 如该用户继续向您发送数据包，另一个 P2PSessionRequest_t 将定期发布。
   * 如您已对该用户调用了 SendP2PPacket，这会隐式接受会话请求。
   * 注意，此函数只应在响应 P2PSessionRequest_t 回调时才能调用！
   *
   * @param steam_id64 向我们发送了初始数据包的用户的 Steam ID
   * @returns true， 表示成功；只有在 steamIDRemote 无效时为 false。
   */
  export function acceptP2PsessionWithUser(steamId64: bigint): void
}
export namespace steamremotestorage {
  /**
   * 检查是否此用户帐户中的所有 Steam 云设置都已启用，或者是否用户在“设置”->“云”对话框禁用了 Steam 云。
   * 确定您也检查了 IsCloudEnabledForApp。这两个选项互相排斥。
   *
   * @returns true， 表示此帐户启用了 Steam 云；否则，返回 false。
   */
  export function isCloudEnabledForAccount(): boolean
  /**
   * 查看是否此用户启用了按游戏设置的 Steam 云，或在“游戏属性”->“更新”对话框中禁用了 Steam 云。
   * 确定您也检查了 IsCloudEnabledForAccount。这两个选项互相排斥。
   * 我们一般建议您允许用户使用游戏内选项切换此设置。您可以使用 SetCloudEnabledForApp 进行切换。
   *
   * @returns true， 表示 Steam 云为此应用启用；否则，返回 false。
   */
  export function isCloudEnabledForApp(): boolean
  /**
   * 打开一个二进制文件，将文件内容读取至一个字节数组，然后关闭文件。
   * 注意： 这是一个同步调用，因此将阻止您调用磁盘 IO 的线程，也将阻止 SteamAPI，这可能导致您应用程序中的其他线程受阻。
   * 要避免客户端电脑由于磁盘繁忙出现“卡顿”，我们建议使用此API 的异步版本，即 FileReadAsync。
   *
   * @returns 返回读取文件信息
   */
  export function fileRead(name: string): string
  /**
   * 创建一个新文件，将字节写入文件，再关闭文件。 目标文件若已存在，将被覆盖。
   * 注意： 这是一个同步调用，因此将阻止您调用磁盘 IO 的线程，也将阻止 SteamAPI，这可能导致您应用程序中的其他线程受阻。
   * 要避免客户端电脑由于磁盘繁忙出现“卡顿”，我们建议使用此API 的异步版本，即 FileWriteAsync。
   *
   * @returns true， 表示写入成功。
   * 否则，在下列情况时，返回 false：
   * - 您尝试写入的文件大于 k_unMaxCloudFileChunkSize 所规定的 100MiB。
   * - cubData 小于 0。
   * - pvData 为 NULL。
   * - 您尝试从无效路径或文件名读取。 由于 Steam 云是跨平台的，文件需要在支持的所有操作系统与文件系统中均有有效名称。 参见微软命名文件、路径与命名空间文档。
   * - 超过了当前用户的 Steam 云存储配额。 云存储或者缺乏空间，或者有过多文件。
   * - Steam 无法写入磁盘，该位置可能为只读。
   */
  export function fileWrite(name: string, content: string): boolean
  /**
   * 从本地磁盘中删除一个文件，并将该删除传播到云端。
   * 此函数应该只在用户主动删除文件时使用。 如果您希望将一个文件从 Steam 云中移除，但将其保留在用户的本地磁盘，则需使用 FileForget。
   * 您删除文件后，可以使用 FileWrite 重新写入该文件，以将其重新上传至 Steam 云。
   *
   * @returns true， 表示文件存在且已成功删除；否则，如果文件不存在，返回 false。
   */
  export function fileDelete(name: string): boolean
  /**
   * 检查指定文件是否存在。
   *
   * @returns true， 表示文件存在；否则，返回 false。
   */
  export function fileExists(name: string): boolean
}
export namespace steamugc {
  /** 创建创意工坊物品信息 */
  export interface UgcResult {
    /** 物品ID */
    itemId: bigint
    /** 用户需要接受《Steam 创意工坊法律协议》 */
    needsToAcceptAgreement: boolean
  }
  /** 创意工坊信息 */
  export interface UgcUpdate {
    /** 创意工坊标题 */
    title?: string
    /** 创意工坊描述 */
    description?: string
    /** 创意工坊更新信息 */
    changeNote?: string
    /** 创意工坊预览路径 */
    previewPath?: string
    /** 创意工坊文件路径 */
    contentPath?: string
    /** 创意工坊分类标签 */
    tags?: Array<string>
    /** 创意工坊可见性 */
    visibility?: ERemoteStoragePublishedFileVisibility
  }
  /** 创意工坊物品安装信息 */
  export interface InstallInfo {
    /** 内容的文件夹的绝对路径 */
    folder: string
    /** 创意工坊物品的字节大小 */
    sizeOnDisk: bigint
    /** 创意工坊物品上次更新的时间 */
    timestamp: number
  }
  /** 创意工坊更新进度 */
  export interface UpdateProgress {
    status: EItemUpdateStatus
    progress: bigint
    total: bigint
  }
  /** 创意工坊下载信息 */
  export interface DownloadInfo {
    /** 返回当前已下载的字节 */
    current: bigint
    /** 返回总字节数。 仅在下载开始后有效 */
    total: bigint
  }
  /** 创意工坊查询 */
  export interface WorkshopItemQueryOptions {
    /** 设置待处理的 UGC 查询是否从特定时间段的缓存中返回查询结果 */
    cachedResponseMaxAge?: number
    /** 设置待处理的 UGC 查询是否需要返回开发者指定的物品元数据 */
    includeMetadata?: boolean
    /** 设置待处理的 UGC 查询是否需要返回物品的完整描述。如果您未设置此项，那么您只会收到概要，也即被截断为 255 个字节的描述。 */
    includeLongDescription?: boolean
    /** 设置待处理的 UGC 查询返回的物品标题和描述所使用的语言 */
    language?: string
  }
  /** 创意工坊信息 */
  export interface WorkshopItem {
    /** 此 UGC 的全局唯一物品句柄 */
    publishedFileId: bigint
    /** 创建此物品的应用的 App Id */
    creatorAppId?: number
    /** 将消耗此物品的应用的 App Id */
    consumerAppId?: number
    /** 此物品的标题 */
    title: string
    /** 此物品的说明 */
    description: string
    /** 创建此内容的用户的 Steam ID */
    owner: CSteamId
    /** 所发布物品的创建时间，以 Unix 时间戳格式提供（自 1970 年 1 月 1 日起的秒数） */
    timeCreated: number
    /** 所发布物品的最后更新时间，以 Unix 时间戳格式提供（自 1970 年 1 月 1 日起的秒数） */
    timeUpdated: number
    /** 此物品是否被封禁 */
    banned: boolean
    /** 此应用的开发者是否已经将此物品特别标记为被创意工坊所接受。 */
    acceptedForUse: boolean
    /** 与此物品关联的所有标签 */
    tags: Array<string>
    /** 标签列表是否因过长而不能返回到提供的缓冲区并因此而截断 */
    tagsTruncated: boolean
    /** 与此物品关联的 URL */
    url: string
    /** 此物品赞的数量 */
    numUpvotes: number
    /** 此物品踩的数量 */
    numDownvotes: number
    /** 如果 m_eFileType 为 k_EWorkshopFileTypeCollection，则代表合集中的物品数; 也可能是此特定物品所依赖的物品数 */
    numChildren: number
    /** 预览文件图片链接 */
    previewUrl?: string
  }
  /**
   * 获取此客户端上创意工坊物品的当前状态
   *
   * @returns 返回此物品状态。 应与 EItemState 标记一起使用，以确定创意工坊物品的状态。
   */
  export function getItemState(itemId: bigint): number
  /**
   * 创建一个尚无附加内容的新创意工坊物品
   *
   * @return 创意工坊信息
   */
  export function createItem(appId?: number | undefined | null): Promise<UgcResult>
  /**
   * 将对物品所做的更改上传到 Steam 创意工坊。
   * 您可以使用 GetItemUpdateProgress 追踪物品更新的进度。
   *
   * @param item_id 创意工坊ID
   * @param update_details 创意工坊更新信息
   * @param app_id 创意工坊所属应用ID
   * @returns 返回更新结果及错误信息
   */
  export function updateItem(itemId: bigint, updateDetails: UgcUpdate, appId?: number | undefined | null): Promise<UgcResult>
  /**
   * 订阅创意工坊物品。 会尽快下载并安装该物品。
   *
   * @param item_id 要订阅的创意工坊物品
   * @returns 返回订阅结果
   */
  export function subscribeItem(itemId: bigint): Promise<void>
  /**
   * 取消来自创意工坊物品的订阅。 退出游戏后会移除该物品。
   *
   * @param item_id 要取消订阅的创意工坊物品项目
   * @returns 返回订阅结果
   */
  export function unsubscribeItem(itemId: bigint): Promise<void>
  /**
   * 下载或更新创意工坊物品。
   * 如果返回值为 true，在调用 GetItemInstallInfo 或访问磁盘上创意工坊物品前，注册并等待 DownloadItemResult_t 回调。
   * 如果用户并未订阅该物品（例如匿名登录的游戏服务器），创意工坊物品会下载并临时存放于缓存中。
   * 如果创意工坊物品有一个状态为 k_EItemStateNeedsUpdate 的物品，则可调用此函数来开始更新。
   * 在调用 DownloadItemResult_t 前切勿访问磁盘上的创意工坊物品。
   * DownloadItemResult_t 回调中包含与创意工坊物品关联的应用 ID。
   * 无论正在运行什么应用程序，均会为所有物品下载调用处理程序，因此请检查该应用 ID 与运行中的应用的 ID 是否一致。
   *
   * @param item_id 要下载的创意工坊物品
   * @param high_priority 以高优先级模式开始下载，暂停所有其他正在进行的 Steam 下载并立即开始下载此创意工坊物品
   * @returns true 表明下载成功开始；否则，如果 nPublishedFileID 无效或用户尚未登录，返回 false。
   */
  export function downloadItem(itemId: bigint, highPriority: boolean): boolean
  /**
   * 获得当前游戏中，当前用户所订阅的所有物品的清单。
   *
   * @returns 已订阅的创意工坊物品ID
   */
  export function getSubscribedItems(): Array<bigint>
  /**
   * 查询特定 UGC 物品的详细信息。 目前您可以请求的项目数量限制为 1,000，但将来此限制可能会取消。
   *
   * @param item 要获取详细信息的创意工坊物品列表
   * @param query 要查询创意工坊指定选项
   * @returns 返回创意工坊查询结果
   */
  export function getItem(item: bigint, query?: WorkshopItemQueryOptions | undefined | null): Promise<WorkshopItem | null>
  /**
   * 查询特定 UGC 物品的详细信息。 目前您可以请求的项目数量限制为 1,000，但将来此限制可能会取消。
   *
   * @param items 要获取详细信息的创意工坊物品列表
   * @param query 要查询创意工坊指定选项
   * @returns 返回创意工坊查询结果
   */
  export function getItems(items: Array<bigint>, query?: WorkshopItemQueryOptions | undefined | null): Promise<Array<WorkshopItem | undefined | null>>
  /**
   * 获取当前已安装在光盘上的创意工坊物品相关信息。
   *
   * @param item_id 	要获取安装信息的创意工坊物品
   * @returns 返回创意工坊安装信息
   */
  export function getItemInstallInfo(itemId: bigint): InstallInfo | null
  /**
   * 获取设置了 k_EItemStateNeedsUpdate 的创意工坊物品的待下载状态信息
   *
   * @param item_id 要获取下载信息的创意工坊物品
   */
  export function getItemDownloadInfo(itemId: bigint): DownloadInfo | null
  /**
   * 获取创意工坊物品更新的进度
   *
   * @param item_id 创意工坊物品ID
   * @param update_details 创意工坊信息
   * @param app_id 创意工坊对应app_id
   * @param success_callback 创意工坊上传成功时回调
   * @param error_callback 创意工坊上传失败时回调
   * @param progress_callback 创意工坊上传失败时回调
   * @param progress_callback_interval_ms 创意工坊回调时间
   */
  export function updateItemWithCallback(
    itemId: bigint,
    updateDetails: UgcUpdate,
    appId: number | undefined | null,
    successCallback: (data: UgcResult) => void,
    errorCallback: (err: any) => void,
    progressCallback?: (data: UpdateProgress) => void,
    progressCallbackIntervalMs?: number | undefined | null
  ): void
}
export namespace steamuser {
  /**
   * 获取当前登录至 Steam 客户端帐户的 Steam ID。 通常被称为“当前用户”，或“本地用户”。
   * Steam ID 是 Steam 帐户、Steam 组、大厅和聊天室的唯一标识符，用于在 Steamworks API 各部分中区分用户。
   *
   * @returns CSteamID
   */
  export function getSteamId(): CSteamId
  /**
   * 获得用户的 Steam 社区个人资料中显示的 Steam 等级
   *
   * @returns 当前用户的等级
   */
  export function getPlayerSteamLevel(): number
  /**
   * 通过SteamID获取身份验证票证，以便发送给希望对您进行身份验证的实体。
   * 调用此函数之后，您可以发送票证至实体，该实体然后可以调用 BeginAuthSession/ISteamGameServer::BeginAuthSession，验证此实体的完整性。
   *
   * @param networkIdentity - 将验证票证的远程系统的身份
   * - 如果是 P2P，则为用户 Steam ID。
   * - 如果是游戏服务器，且是从可信的第三方获得的，则可以使用游戏服务器的 steam ID
   * @param timeoutSeconds - 等待票证验证的秒数。 默认值为 10 秒。 如果是游戏服务器，且是从可信的第三方获得的，则可以使用游戏服务器的 steam ID
   * @returns 返回验证票证
   */
  export function getSessionTicketWithSteamId(steamId64: bigint, timeoutSeconds?: number | undefined | null): Promise<Ticket>
  /**
   * 通过SteamID获取身份验证票证，以便发送给希望对您进行身份验证的实体。
   * 调用此函数之后，您可以发送票证至实体，该实体然后可以调用 BeginAuthSession/ISteamGameServer::BeginAuthSession，验证此实体的完整性。
   *
   * @param ip - 将验证票证的远程系统的身份, 必须是服务器IP地址
   * @param timeoutSeconds - 等待票证验证的秒数。 默认值为 10 秒。 如果是游戏服务器，且是从可信的第三方获得的，则可以使用游戏服务器的 steam ID
   * @returns 返回验证票证
   */
  export function getSessionTicketWithIp(ip: string, timeoutSeconds?: number | undefined | null): Promise<Ticket>
  /**
   * 使用 ISteamUserAuth/AuthenticateUserTicket Web API 获取要发送给欲对您进行身份验证的实体的验证票证。
   * - 调用应用程序必须等待 API 调用生成的 GetTicketForWebApiResponse_t 回调才能访问票证。
   * 最佳做法是为每个将使用票证的服务使用标识字符串。
   * - 注意：此 API 不能用于创建供 BeginAuthSession/ISteamGameServer::BeginAuthSession 使用的票证。 请改用 GetAuthSessionTicket API。
   *
   * @param identity 将验证票证的远程服务的身份。 该服务应提供一个字符串标识符。 如果未提供，则传入 null。
   * @returns 验证票证
   */
  export function getAuthTicketForWebApi(identity: string, timeoutSeconds?: number | undefined | null): Promise<Ticket>
  /** Steam 票证信息 */
  export class Ticket {
    cancel(): void
    getBytes(): Buffer
  }
}
export namespace steamuserstats {
  /**
   * 获取当前用户的当前统计值。
   * 您必须先调用 RequestCurrentStats，且须通过其回调返回成功之后，才能调用此函数。
   * 使用 GetUserStat 为其他用户获取统计。
   *
   * @param 统计的"API 名称"， 必须不超过 k_cchStatNameMax 的规定。
   * @returns 此函数若达成所有下列条件，返回 true；否则返回 false。
   * - 在 Steamworks 网站的"应用管理员"中存在指定统计，且更改已发布。
   * - RequestCurrentStats 已完成且回调返回成功。
   * - 传入此函数的类型必须与 Steamworks 网站的"应用管理员"中列出的类型一致。
   */
  export function getStat(name: string): number | null
  /**
   * 为当前用户设置/更新给定统计的值。
   * 您必须先调用 RequestCurrentStats，且须通过其回调返回成功之后，才能调用此函数。
   * 此调用只修改 Steam 的内存状态，因此开销较小。 这样做使 Steam 在游戏崩溃或意外关闭时能存留更改。
   * 要将统计提交至服务器，必须调用 StoreStats。
   * 如果返回 false，但一切似乎都正确，请检查确定您在 Steamworks 网站的"应用管理员"中已发布更改。
   *
   * @param 统计的"API 名称"， 必须不超过 k_cchStatNameMax 的规定。
   * @param 统计的新值。 统计的新值，必须为绝对值，不会为您递增或递减。
   * @returns 此函数若达成所有下列条件，返回 true；否则返回 false。
   * - 在 Steamworks 网站的"应用管理员"中存在指定统计，且更改已发布。
   * - RequestCurrentStats 已完成且回调返回成功。
   * - 传入此函数的类型必须与 Steamworks 网站的"应用管理员"中列出的类型一致。
   */
  export function setStat(name: string, value: number): boolean
  /**
   * 解锁一项成就。
   * 您必须先调用 RequestCurrentStats，且须通过其回调返回成功之后，才能调用此函数。
   * 您可以多次解锁一项成就，而无需担心只设置尚未设置的成就。 此调用只修改 Steam 的内存状态，因此开销较小。
   * 要向服务器发送解锁状态，触发 Steam 界面通知，您必须调用 StoreStats。
   *
   * @param achievement 要解锁的成就的"API 名称"
   * @returns 此函数若达成所有下列条件，返回 true；否则返回 false。
   * - 在 Steamworks 网站的"应用管理员"中存在指定成就的"API 名称"，且更改已发布。
   * - RequestCurrentStats 已完成且回调返回成功。
   */
  export function setAchievement(achievement: string): boolean
  /**
   * 获取成就的解锁状态。
   * 针对其他用户的等效函数为：GetUserAchievement。
   *
   * @param achievement 成就的"API 名称"
   * @returns 此函数若达成所有下列条件，返回 true；否则返回 false。
   * - RequestCurrentStats 已完成且回调返回成功。
   * - 在 Steamworks 网站的"应用管理员"中存在指定成就的"API 名称"，且更改已发布。
   */
  export function getAchievement(achievement: string): boolean
  /**
   * 重置一项成就的解锁状态。
   * 此函数主要仅用于测试目的。
   * 您必须先调用 RequestCurrentStats，且须通过其回调返回成功之后，才能调用此函数。
   * 此调用只修改 Steam 的内存状态，因此开销较小。 要向服务器发送解锁状态，触发 Steam 界面通知，您必须调用 StoreStats。
   *
   * @param achievement 要重置的成就的 "API 名称"
   * @returns 此函数若达成所有下列条件，返回 true；否则返回 false。
   * - 在 Steamworks 网站的"应用管理员"中存在指定成就的"API 名称"，且更改已发布。
   * - RequestCurrentStats 已完成且回调返回成功。
   */
  export function clearAchievement(achievement: string): boolean
  /**
   * 将变动的统计与成就数据发送至服务器进行持久保存。
   * 若失败，则不会发送任何数据至服务器。 建议不断重试，直至调用成功。
   * 此调用会受到速率限制。 调用频率应该以分钟计，而非秒计。
   * 您应只在重大状态更改时调用此函数，比如回合结束、地图更改或用户离开服务器时。
   * 不过，这调用要求显示成就解锁通知对话框，因此如果您已调用了 SetAchievement，那么建议您随后立即调用此函数。
   * 如果在您的应用程序进程结束时，您在本地保存有统计或成就，且尚未使用此函数上传，那么此函数将自动调用。
   * 您可以在 %steam_install%\logs\stats_log.txt 文件中找到更多调试信息。
   *
   * @returns 此函数若达成所有下列条件，则返回 true；否则返回 false。
   * - RequestCurrentStats 已完成且回调返回成功。
   * - 在 Steamworks 合作伙伴后端，当前游戏相关联的统计，这些统计已发布。
   * 如果调用成功，您将收到 UserStatsStored_t 回调。
   * 如果 m_eResult 得到 k_EResultInvalidParam 的结果，那么有一个或多个统计因破坏约束或过期而遭到拒绝。
   * 这种情况下，服务器发回更新值，统计应在本地更新以保持同步。 此时您无需再次调用 RequestCurrentStats。
   * 如果已有一个或更多成就解锁，则这也将触发一个 UserAchievementStored_t 回调。
   */
  export function storeStats(): boolean
  /**
   * 重置当前用户的统计，且可选择是否重置成就。
   * 此函数自动调用 StoreStats，以持久保留对服务器的更改。 这通常应只用于开发时的测试目的。
   * 在调用此函数之后，调用 RequestCurrentStats，确认您与 Steam 提供的新默认值同步了您的统计。
   *
   * @param achievements_too	是否也重置用户的成就
   * @returns true 表示 RequestCurrentStats 已调用且成功地返回了其回调，也即成功；否则返回 false。
   */
  export function resetAllStats(achievementsToo: boolean): boolean
}
export namespace steamutils {
  /**
   * 返回客户端正在运行的 2 位 ISO 3166-1-alpha-2 格式的国家代码, 如“US”或“UK”。
   * 通过 IP 地址位置数据库来查找。
   *
   * @returns 国家代码
   */
  export function getIpCountry(): string
  /**
   * 获取当前进程的 App ID。
   *
   * @returns 当前进程的 App ID
   */
  export function getAppId(): number
  /**
   * 以 Unix 时间戳格式返回 Steam 服务器时间。 （自 1970 年 1 月 1 日起的秒数）。
   *
   * @returns 返回当前Steam服务器时间
   */
  export function getServerRealTime(): number
  /**
   * 检查 Steam 是否在 Steam Deck 设备上运行。
   *
   * @returns true， 表示 Steam 本身在 Steam Deck 设备上运行，否则返回 false。
   */
  export function isSteamRunningOnSteamDeck(): boolean
}
