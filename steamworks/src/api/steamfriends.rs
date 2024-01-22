use super::consts::{EFriendFlags, EPersonaState, PSteamDialog, EOverlayToStoreFlag};
use napi_derive::napi;

#[napi]
pub mod steamfriends {
    use super::{EFriendFlags, EPersonaState, PSteamDialog, EOverlayToStoreFlag};
    use napi::bindgen_prelude::BigInt;
    use steamworks::{FriendGame, SteamId, OverlayToStoreFlag, FriendFlags};

    #[napi(object)]
    /// 好友游玩信息
    pub struct FriendGameInfo {
        /// 好友正在玩的游戏的 ID
        pub game_id: BigInt,
        /// 好友正在玩的服务器的 IP
        pub game_ip: String,
        /// 好友正在玩的服务器端口
        pub game_port: u16,
        /// 好友正在玩的服务器的查询端口
        pub query_port: u16,
        /// 好友所在的大厅的 Steam ID
        pub steam_id_lobby: BigInt,
    }

    impl FriendGameInfo {
        pub(crate) fn from_friend_game(friend_game: Option<FriendGame>) -> Option<FriendGameInfo> {
            match friend_game {
                Some(friend_game) => Some(FriendGameInfo {
                    game_id: BigInt::from(friend_game.game.raw()),
                    game_ip: friend_game.game_address.to_string(),
                    game_port: friend_game.game_port,
                    query_port: friend_game.query_port,
                    steam_id_lobby: BigInt::from(friend_game.lobby.raw()),
                }),
                None => None,
            }
        }
    }

    #[napi(object)]
    /// 好友信息
    pub struct FrinedInfo {
        /// 获取位于指定用户 Steam ID
        pub steamid: BigInt,
        /// 获取指定用户的昵称（显示名称）
        pub name: String,
        /// 获取指定用户当前的状态
        pub state: EPersonaState,
        /// 是否为好友
        pub has_friend: bool,
        /// 正在游玩的游戏
        pub game: Option<FriendGameInfo>,
    }

    #[napi]
    /// 获取当前用户的昵称（显示名称）
    /// 此名称与用户的社区个人资料页面显示的名称相同
    /// 要获取其他用户的昵称，请使用 GetFriendPersonaName
    ///
    /// @returns UTF-8 格式的当前用户的昵称. 保证不为 NULL
    pub fn get_persona_name() -> String {
        let client = crate::client::get_client();
        client.friends().name()
    }

    #[napi]
    /// 设置当前用户的丰富状态键/值, 该键/值会自动分享给玩同一游戏的所有好友
    /// 详情 https://partner.steamgames.com/doc/api/ISteamFriends#SetRichPresence
    ///
    /// @param pchKey 要设置的丰富状态"键"
    /// @param pchValue 要与 pchKey 关联的丰富状态"值". 若设为空字符串（""）或 NULL, 便会移除已设置的键
    pub fn set_rich_presence(key: String, value: Option<String>) {
        let client = crate::client::get_client();
        client.friends().set_rich_presence(&key, value.as_deref());
    }

    #[napi]
    /// 检查指定的好友是否在游戏中，若是则获取游戏的相关信息。
    ///
    /// @param steam_id64 另一位用户的 Steam ID
    /// @returns true 表示用户为好友且在游戏中, 否则返回 false
    pub fn get_friend_game_played(steam_id64: BigInt) -> Option<FriendGameInfo> {
        let client = crate::client::get_client();
        let result = client
            .friends()
            .get_friend(SteamId::from_raw(steam_id64.get_u64().1))
            .game_played();

        FriendGameInfo::from_friend_game(result)
    }

    #[napi]
    /// 获取好友所有信息
    ///
    /// @param flags 一个或多个 EFriendFlags 的并集（二进制）
    /// @returns 返回指定标识所有好友信息
    pub fn get_friends(flag: EFriendFlags) -> Vec<FrinedInfo> {
        let client = crate::client::get_client();
        let eflag = FriendFlags::from(flag);
        client
            .friends()
            .get_friends(eflag)
            .into_iter()
            .map(|friend| FrinedInfo {
                steamid: BigInt::from(friend.id().raw()),
                name: friend.name(),
                state: EPersonaState::from(friend.state()),
                has_friend: friend.has_friend(eflag),
                game: FriendGameInfo::from_friend_game(friend.game_played()),
            })
            .collect()
    }

    #[napi]
    /// 激活 Steam 界面，打开指定的对话框。
    /// 等同于调用 ActivateGameOverlayToUser，其中steamID 设为 ISteamUser::GetSteamID。
    ///
    /// @param dialog 要打开的对话框。
    /// - 有效选项包括“好友”、“社区”、“玩家”、“设置”、“官方游戏组”、“统计”和“成就”。
    /// @noreturns
    pub fn activate_game_overlay(dialog: PSteamDialog) {
        let client = crate::client::get_client();
        client.friends().activate_game_overlay(&dialog.to_string())
    }

    #[napi]
    /// 激活 Steam 界面，打开指定的对话框。
    /// 有效 pchDialog 选项包括：
    /// - "steamid": 打开界面网页浏览器，前往指定的用户或组资料。
    /// - "chat": 打开与指定用户的聊天窗口，或加入组聊天。
    /// - "jointrade": 打开以 ISteamEconomy/StartTrade Web API 开始的 Steam 交易会话窗口。
    /// - "stats": 打开界面网页浏览器，前往指定用户的统计。
    /// - "achievements": 打开界面网页浏览器，前往指定用户的成就。
    /// - "friendadd": 以最小模式打开界面，提示用户将目标用户加为好友。
    /// - "friendremove": 以最小模式打开界面，提示用户移除目标好友。
    /// - "friendrequestaccept": 以最小模式打开界面，提示用户接受传入的好友邀请。
    /// - "friendrequestignore": 以最小模式打开界面，提示用户忽略传入的好友邀请。
    ///
    /// @param dialog 要打开的对话框。
    /// @param steam_id64 要将此对话框打开至的上下文的 Steam ID。
    /// @noreturns
    pub fn activate_game_overlay_to_user(dialog: PSteamDialog, steam_id64: BigInt) {
        let client = crate::client::get_client();
        client.friends().activate_game_overlay_to_user(
            &dialog.to_string(),
            steamworks::SteamId::from_raw(steam_id64.get_u64().1),
        )
    }

    #[napi]
    /// 激活 Steam 界面，打开邀请对话框。 进入该大厅的邀请将从此窗口发出。
    ///
    /// @param lobby_id 选定玩家将受邀进入的大厅的 Steam ID
    /// @noreturns
    pub fn activate_game_overlay_invite_dialog(lobby_id: BigInt) {
        let client = crate::client::get_client();
        client
            .friends()
            .activate_invite_dialog(steamworks::LobbyId::from_raw(lobby_id.get_u64().1))
    }

    #[napi]
    /// 激活 Steam 界面网页浏览器，直接前往指定的 URL。
    ///
    /// @param url 要打开的网页。 （须有完整且符合协议的网址，例如“http://www.steampowered.com”）
    /// @noreturns
    pub fn activate_game_overlay_to_web_page(url: String) {
        let client = crate::client::get_client();
        client.friends().activate_game_overlay_to_web_page(&url)
    }

    #[napi]
    pub fn activate_to_store(app_id: u32, flag: EOverlayToStoreFlag) {
        let client = crate::client::get_client();
        client.friends().activate_game_overlay_to_store(
            steamworks::AppId(app_id),
            OverlayToStoreFlag::from(flag),
        )
    }
}
