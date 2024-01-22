use napi_derive::napi;

#[napi]
pub mod steamutils {
    #[napi]
    /// 返回客户端正在运行的 2 位 ISO 3166-1-alpha-2 格式的国家代码, 如“US”或“UK”。
    /// 通过 IP 地址位置数据库来查找。
    ///
    /// @returns 国家代码
    pub fn get_ip_country() -> String {
        let client = crate::client::get_client();
        client.utils().ip_country()
    }

    #[napi]
    /// 获取当前进程的 App ID。
    /// 
    /// @returns 当前进程的 App ID
    pub fn get_app_id() -> u32 {
        let client = crate::client::get_client();
        client.utils().app_id().0
    }

    #[napi]
    /// 以 Unix 时间戳格式返回 Steam 服务器时间。 （自 1970 年 1 月 1 日起的秒数）。
    /// 
    /// @returns 返回当前Steam服务器时间
    pub fn get_server_real_time() -> u32 {
        let client = crate::client::get_client();
        client.utils().get_server_real_time()
    }

    #[napi]
    /// 检查 Steam 是否在 Steam Deck 设备上运行。
    /// 
    /// @returns true， 表示 Steam 本身在 Steam Deck 设备上运行，否则返回 false。
    pub fn is_steam_running_on_steam_deck() -> bool {
        let client = crate::client::get_client();
        client.utils().is_steam_running_on_steam_deck()
    }
}
