use std::fmt;

use napi::bindgen_prelude::{BigInt, FromNapiValue, ToNapiValue};
use napi_derive::napi;
use steamworks::{
    FriendFlags, FriendState, LobbyType, OverlayToStoreFlag, PublishedFileVisibility, SendType,
    SteamId, UpdateStatus,
};

#[napi]
/// 用来枚举好友列表或快速检查用户之间关系的标识
pub enum EFriendFlags {
    /// 无
    None,
    /// 当前用户已屏蔽的用户
    Blocked,
    /// 向当前用户发送了好友邀请的用户
    FriendshipRequested,
    /// 当前用户的"一般"好友
    Immediate,
    /// 与当前用户在同一个（小型）Steam 组的用户
    ClanMember,
    /// 由 SetPlayedWith 设置、处于同一个服务器的用户
    OnGameServer,
    /// 当前用户向其发送了好友邀请的用户
    RequestingFriendship,
    /// 调用 RequestUserInformation 后，目前正在发送有关其自身额外信息的用户
    RequestingInfo,
    /// 当前用户已忽略的用户
    Ignored,
    /// 忽略当前用户的用户，但当前用户依然知道这些用户
    IgnoredFriend,
    /// 在同一个聊天中的用户
    ChatMember,
    /// 返回所有的好友标识
    All,
}

impl From<EFriendFlags> for FriendFlags {
    fn from(flag: EFriendFlags) -> Self {
        match flag {
            EFriendFlags::None => Self::NONE,
            EFriendFlags::Blocked => Self::BLOCKED,
            EFriendFlags::FriendshipRequested => Self::FRIENDSHIP_REQUESTED,
            EFriendFlags::Immediate => Self::IMMEDIATE,
            EFriendFlags::ClanMember => Self::CLAN_MEMBER,
            EFriendFlags::OnGameServer => Self::ON_GAME_SERVER,
            EFriendFlags::RequestingFriendship => Self::REQUESTING_FRIENDSHIP,
            EFriendFlags::RequestingInfo => Self::REQUESTING_INFO,
            EFriendFlags::Ignored => Self::IGNORED,
            EFriendFlags::IgnoredFriend => Self::IGNORED_FRIEND,
            EFriendFlags::ChatMember => Self::CHAT_MEMBER,
            EFriendFlags::All => Self::ALL,
        }
    }
}

#[napi]
/// Steam 好友可能处于的状态列表
pub enum EPersonaState {
    /// 好友目前未登录
    Offline,
    /// 好友已登录
    Online,
    // 好友已登录，但设置为“请勿打扰”
    Busy,
    /// 自动离开功能
    Away,
    /// 自动离开了很长时间
    Snooze,
    /// 在线，交易中
    LookingToTrade,
    /// 在线，等待游戏中
    LookingToPlay,
}

impl From<FriendState> for EPersonaState {
    fn from(state: FriendState) -> Self {
        match state {
            FriendState::Offline => Self::Offline,
            FriendState::Online => Self::Online,
            FriendState::Busy => Self::Busy,
            FriendState::Away => Self::Away,
            FriendState::Snooze => Self::Snooze,
            FriendState::LookingToPlay => Self::LookingToPlay,
            FriendState::LookingToTrade => Self::LookingToTrade,
        }
    }
}

#[napi]
/// 指定物品状态。 这些标记可以组合使用。 通过 GetItemState 返回。
pub enum EItemState {
    /// 未在客户端上追踪此物品。
    None = 0,
    /// 当前用户已订阅该物品。 不仅仅是被缓存。
    Subscribed = 1,
    /// 此物品是使用 ISteamRemoteStorage 中的旧创意工坊函数创建的。
    LegacyItem = 2,
    /// 该物品已安装且可用（但可能太过陈旧）。
    Installed = 4,
    /// 此物品需要更新。 原因是尚未安装，或创建者已更新其内容。
    NeedsUpdate = 8,
    /// 此物品更新当前正在下载。
    Downloading = 16,
    /// 已为此物品调用 DownloadItem，直到 DownloadItemResult_t 触发后，其内容才可用。
    DownloadPending = 32,
}

#[napi]
/// 创意工坊物品的可见状态种类
pub enum ERemoteStoragePublishedFileVisibility {
    /// 所有人可见。
    Public,
    /// 仅好友可见。
    FriendsOnly,
    /// 仅物品作者可见。 若需将创意工坊物品从 API 中删除，将其设置为私有是最接近的做法。
    Private,
    /// 对所有人可见，但不会在任何全局查询中返回。也不会在任何用户列表中返回，除非调用方是创建者或订阅者。
    Unlisted,
}

impl From<ERemoteStoragePublishedFileVisibility> for PublishedFileVisibility {
    fn from(visibility: ERemoteStoragePublishedFileVisibility) -> Self {
        match visibility {
            ERemoteStoragePublishedFileVisibility::Public => Self::Public,
            ERemoteStoragePublishedFileVisibility::FriendsOnly => Self::FriendsOnly,
            ERemoteStoragePublishedFileVisibility::Private => Self::Private,
            ERemoteStoragePublishedFileVisibility::Unlisted => Self::Unlisted,
        }
    }
}

#[napi]
/// 在调用 GetItemUpdateProgress 后指明 UGCUpdateHandle_t 的状态，由 GetItemUpdateProgress 返回。
pub enum EItemUpdateStatus {
    /// 物品更新句柄无效，操作可能已完成，应该已为其返回了 SubmitItemUpdateResult_t 调用结果。
    Invalid,
    /// 物品更新正在处理配置数据。
    PreparingConfig,
    /// 物品更新正在读取并处理内容文件。
    PreparingContent,
    /// 物品更新正在将内容更改上传到 Steam。
    UploadingContent,
    /// 物品更新正在上传新的预览文件图像。
    UploadingPreviewFile,
    /// 物品更新正在提交所有更改。
    CommittingChanges,
}

impl From<UpdateStatus> for EItemUpdateStatus {
    fn from(visibility: UpdateStatus) -> Self {
        match visibility {
            UpdateStatus::Invalid => Self::Invalid,
            UpdateStatus::PreparingConfig => Self::PreparingConfig,
            UpdateStatus::PreparingContent => Self::PreparingContent,
            UpdateStatus::UploadingContent => Self::UploadingContent,
            UpdateStatus::UploadingPreviewFile => Self::UploadingPreviewFile,
            UpdateStatus::CommittingChanges => Self::CommittingChanges,
        }
    }
}

#[napi]
/// 以下的值将作为参数，使用 ActivateGameOverlayToStore 传入商店中，并修改页面开启时的行为。
pub enum EOverlayToStoreFlag {
    /// 无
    None,
    /// 将指定的 AppID 加入用户的购物车
    AddToCart,
    /// 将指定的 AppID 加入用户的购物车并显示商店页面
    AddToCartAndShow,
}

impl From<EOverlayToStoreFlag> for OverlayToStoreFlag {
    fn from(flag: EOverlayToStoreFlag) -> Self {
        match flag {
            EOverlayToStoreFlag::None => Self::None,
            EOverlayToStoreFlag::AddToCart => Self::AddToCart,
            EOverlayToStoreFlag::AddToCartAndShow => Self::AddToCartAndShow,
        }
    }
}

#[napi]
/// 指定 SendP2PPacket 的发送类型。
/// 通常 k_EP2PSendUnreliable 用于类似 UDP 的数据包，而 k_EP2PSendReliable 用于类似 TCP 的数据包。
pub enum EP2PSend {
    /// 基础 UDP 发送。 数据包不能大于 1200 字节（MTU 的通常大小）。 可能会丢失，或顺序错乱（罕见）。
    /// 发送 API 确实对基础连接有一定了解，因此如果没有完成 NAT 遍历或在连接时发生已识别的调整，数据包将会被批处理，直至连接再次打开。
    Unreliable,
    /// 同上，但如果基础 P2P 连接仍未建立，数据包会被丢弃。 这如果用于发送给远程主机的第一个数据包上，几乎可以肯定数据包会丢失。
    /// 这只对不应缓冲的数据类型有用，即语音有效负载数据包。
    UnreliableNoDelay,
    /// 可靠的消息发送。 每条消息可发送高达 1MB 的数据。
    /// 可在后台对消息进行碎片化或重组，以及用滑动窗口高效发送大型数据区块。
    Reliable,
    /// 同上，但使用 Nagle 算法发送，发送内容将累积，直至达到当前 MTU 大小（通常约 1200 字节，但可能会变化），或已过去大约 200 毫秒（Nagle 算法）。
    /// 如果您想发送一系列较小的消息，但已将他们合并成一个数据包，这将非常有用。
    /// 因为所有可靠的数据流都已排序，您可用 k_EP2PSendReliableWithBuffering 发送几个小消息，然后用普通的 k_EP2PSendReliable 强制发送所有已缓冲的数据。
    ReliableWithBuffering,
}

impl From<EP2PSend> for SendType {
    fn from(send_type: EP2PSend) -> Self {
        match send_type {
            EP2PSend::Unreliable => Self::Unreliable,
            EP2PSend::UnreliableNoDelay => Self::UnreliableNoDelay,
            EP2PSend::Reliable => Self::Reliable,
            EP2PSend::ReliableWithBuffering => Self::ReliableWithBuffering,
        }
    }
}

#[napi]
/// 指定大厅类型，从 CreateLobby 和 SetLobbyType 设置。
pub enum ELobbyType {
    /// 邀请是加入大厅的唯一途径
    Private,
    /// 好友和受邀者可加入，但不出现在大厅列表中
    FriendsOnly,
    /// 通过搜索返回并对好友可见
    Public,
    /// 通过搜索返回，但不对好友可见。
    /// 如果希望一个用户同时在两个大厅中，比如将组配到一起时很有用。 用户只能加入一个普通大厅，最多可加入两个不可见大厅。
    Invisible,
}

impl From<ELobbyType> for LobbyType {
    fn from(lobby_type: ELobbyType) -> Self {
        match lobby_type {
            ELobbyType::Private => Self::Private,
            ELobbyType::FriendsOnly => Self::FriendsOnly,
            ELobbyType::Public => Self::Public,
            ELobbyType::Invisible => Self::Invisible,
        }
    }
}

#[napi]
/// 需要打开的对话框类型
pub enum PSteamDialog {
    /// 好友对话框
    Friends,
    /// 社区对话框
    Community,
    /// 玩家对话框
    Players,
    /// 设置对话框
    Settings,
    /// 离线游戏组对话框
    OfficialGameGroup,
    /// 状态对话框
    Stats,
    /// 成就对话框
    Achievements,
}

impl fmt::Display for PSteamDialog {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Self::Friends => write!(f, "friends"),
            Self::Community => write!(f, "community"),
            Self::Players => write!(f, "players"),
            Self::Settings => write!(f, "settings"),
            Self::OfficialGameGroup => write!(f, "officialgamegroup"),
            Self::Stats => write!(f, "stats"),
            Self::Achievements => write!(f, "achievements"),
        }
    }
}

#[derive(Debug)]
#[napi(object)]
/// Steam 游戏在全局中的唯一标识符
pub struct CSteamID {
    /// 64位 SteamID
    pub steam_id64: BigInt,
    /// 32位 SteamID
    pub steam_id32: String,
    /// 账户ID
    pub account_id: u32,
}

impl CSteamID {
    pub(crate) fn from_steamid(steam_id: SteamId) -> Self {
        Self {
            steam_id64: steam_id.raw().into(),
            steam_id32: steam_id.steamid32(),
            account_id: steam_id.account_id().raw(),
        }
    }
}
