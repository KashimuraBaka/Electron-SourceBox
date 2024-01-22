use super::consts::CSteamID;
use napi_derive::napi;

#[napi]
pub mod steamapps {
    use super::CSteamID;
    use steamworks::AppId;

    #[napi]
    /// 检查活跃用户是否订阅了特定 AppId。
    /// 只有在需要检查与您游戏有关的另一个游戏（如试用版）的所有权时，才使用此函数。
    ///
    /// @param app_id 要检查的 AppID
    /// @returns true 表明该活跃用户订阅了特定 App ID；否则返回 false。
    pub fn is_subscribed_app(app_id: u32) -> bool {
        let client = crate::client::get_client();
        client.apps().is_subscribed_app(AppId(app_id))
    }

    #[napi]
    /// 检查用户是否拥有特定 DLC 且该 DLC 已安装。
    ///
    /// @param app_id 要检查的 DLC 的 AppID
    /// @returns true 表明该用户拥有 DLC 且已安装；否则返回 false。
    /// 注意： 应只用于简单的客户端检查，不能用于授予游戏中物品。
    pub fn is_dlc_installed(app_id: u32) -> bool {
        let client = crate::client::get_client();
        client.apps().is_dlc_installed(AppId(app_id))
    }

    #[napi]
    /// 检查某特定应用是否已安装。
    /// 当前用户也许并不拥有此应用，只是通过免费周末等活动进行过安装。
    /// 此函数只对基础应用程序有效，对可下载内容（DLC） 无效。 针对 DLC 请使用 BIsDlcInstalled。
    ///
    /// @param app_id 要检查的应用程序的 AppID
    /// @returns true 表明指定 AppID 已安装；否则返回 false。
    pub fn is_app_installed(app_id: u32) -> bool {
        let client = crate::client::get_client();
        client.apps().is_app_installed(AppId(app_id))
    }

    #[napi]
    /// 检查该用户是否通过免费周末订阅了当前 appID。
    /// 在使用此函数前请通过 Steamworks 讨论板联系 Valve 技术客户经理，来为免费周末活动制作相应程序包，确保活动能顺利开展。
    ///
    /// @returns true 表明该活跃用户通过免费周末订阅了当前 App Id；如果为其他任何类型的许可，则返回 false 。
    pub fn is_subscribed_from_free_weekend() -> bool {
        let client = crate::client::get_client();
        client.apps().is_subscribed_from_free_weekend()
    }

    #[napi]
    /// 检查用户帐户是否受到 VAC 封禁。
    ///
    /// @returns true 表明该用户帐户受到 VAC 封禁；否则返回 false。
    pub fn is_vac_banned() -> bool {
        let client = crate::client::get_client();
        client.apps().is_vac_banned()
    }

    #[napi]
    /// 检查当前 AppID 是否供网吧使用。
    ///
    /// @returns true 表明此许可用于网吧；否则返回 false。
    /// 已弃用 - 不再使用。
    pub fn is_cybercafe() -> bool {
        let client = crate::client::get_client();
        client.apps().is_cybercafe()
    }

    #[napi]
    /// 检查用户拥有的许可是否提供低暴力 depot
    /// 在对内容有限制的国家，低暴力 depot 有利于游戏销售
    ///
    /// @returns true 表明用户拥有的许可提供低暴力 depot；否则返回 false
    pub fn is_low_violence() -> bool {
        let client = crate::client::get_client();
        client.apps().is_low_violence()
    }

    #[napi]
    /// 检查活跃用户是否订阅了当前 App ID。
    /// 注意： 如果您使用 Steam DRM 或调用 SteamAPI_RestartAppIfNecessary，此函数将始终返回 true。
    ///
    /// @returns true 表明该活跃用户拥有当前 AppId；否则返回 false。
    pub fn is_subscribed() -> bool {
        let client = crate::client::get_client();
        client.apps().is_subscribed()
    }

    #[napi]
    /// 获取当前应用原拥有者的 Steam ID。如该 ID 与当前用户不一致，则为借用所得。
    ///
    /// @returns 当前应用的原拥有者。
    pub fn get_app_owner() -> CSteamID {
        let client = crate::client::get_client();
        let steam_id = client.apps().app_owner();
        CSteamID::from_steamid(steam_id)
    }

    #[napi]
    /// 获取当前应用支持的语言列表，以逗号分隔。
    /// 参见本地化和语言，了解可能会返回的语言的完整列表。
    ///
    /// @returns 当前应用支持的语言列表
    pub fn get_available_game_languages() -> Vec<String> {
        let client = crate::client::get_client();
        client.apps().available_game_languages()
    }

    #[napi]
    /// 检查用户是否从一个测试版分支运行。如是，获取测试版分支名称。
    ///
    /// @returns 测试版分支名称
    pub fn get_current_beta_name() -> Option<String> {
        let client = crate::client::get_client();
        client.apps().current_beta_name()
    }

    #[napi]
    /// 获取特定 AppID 的安装文件夹。
    /// 即使应用程序未安装，该函数仍可按游戏将在 Steam 库的默认安装位置进行调用。
    ///
    /// @param app_id 要获得安装目录的 AppID
    /// @returns 安装目录路径字符串
    pub fn get_app_install_dir(app_id: u32) -> String {
        let client = crate::client::get_client();
        client.apps().app_install_dir(AppId(app_id))
    }

    #[napi]
    /// 获取用户当前设置的语言。
    /// 如果用户未明确选择产品语言，则回退至 Steam UI 语言。
    ///
    /// @returns 当前用户语言
    pub fn get_current_game_language() -> String {
        let client = crate::client::get_client();
        client.apps().current_game_language()
    }
}
