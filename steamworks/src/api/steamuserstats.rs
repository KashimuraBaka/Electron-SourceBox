use napi_derive::napi;

#[napi]
pub mod steamuserstats {
    #[napi]
    /// 获取当前用户的当前统计值。
    /// 您必须先调用 RequestCurrentStats，且须通过其回调返回成功之后，才能调用此函数。
    /// 使用 GetUserStat 为其他用户获取统计。
    ///
    /// @param 统计的"API 名称"， 必须不超过 k_cchStatNameMax 的规定。
    /// @returns 此函数若达成所有下列条件，返回 true；否则返回 false。
    /// - 在 Steamworks 网站的"应用管理员"中存在指定统计，且更改已发布。
    /// - RequestCurrentStats 已完成且回调返回成功。
    /// - 传入此函数的类型必须与 Steamworks 网站的"应用管理员"中列出的类型一致。
    pub fn get_stat(name: String) -> Option<i32> {
        let client = crate::client::get_client();
        client.user_stats().get_stat_i32(&name).ok()
    }

    #[napi]
    /// 为当前用户设置/更新给定统计的值。
    /// 您必须先调用 RequestCurrentStats，且须通过其回调返回成功之后，才能调用此函数。
    /// 此调用只修改 Steam 的内存状态，因此开销较小。 这样做使 Steam 在游戏崩溃或意外关闭时能存留更改。
    /// 要将统计提交至服务器，必须调用 StoreStats。
    /// 如果返回 false，但一切似乎都正确，请检查确定您在 Steamworks 网站的"应用管理员"中已发布更改。
    ///
    /// @param 统计的"API 名称"， 必须不超过 k_cchStatNameMax 的规定。
    /// @param 统计的新值。 统计的新值，必须为绝对值，不会为您递增或递减。
    /// @returns 此函数若达成所有下列条件，返回 true；否则返回 false。
    /// - 在 Steamworks 网站的"应用管理员"中存在指定统计，且更改已发布。
    /// - RequestCurrentStats 已完成且回调返回成功。
    /// - 传入此函数的类型必须与 Steamworks 网站的"应用管理员"中列出的类型一致。
    pub fn set_stat(name: String, value: i32) -> bool {
        let client = crate::client::get_client();
        client.user_stats().set_stat_i32(&name, value).is_ok()
    }

    #[napi]
    /// 解锁一项成就。
    /// 您必须先调用 RequestCurrentStats，且须通过其回调返回成功之后，才能调用此函数。
    /// 您可以多次解锁一项成就，而无需担心只设置尚未设置的成就。 此调用只修改 Steam 的内存状态，因此开销较小。
    /// 要向服务器发送解锁状态，触发 Steam 界面通知，您必须调用 StoreStats。
    /// 
    /// @param achievement 要解锁的成就的"API 名称"
    /// @returns 此函数若达成所有下列条件，返回 true；否则返回 false。
    /// - 在 Steamworks 网站的"应用管理员"中存在指定成就的"API 名称"，且更改已发布。
    /// - RequestCurrentStats 已完成且回调返回成功。
    pub fn set_achievement(achievement: String) -> bool {
        let client = crate::client::get_client();
        client
            .user_stats()
            .achievement(&achievement)
            .set()
            .and_then(|_| client.user_stats().store_stats())
            .is_ok()
    }

    #[napi]
    /// 获取成就的解锁状态。
    /// 针对其他用户的等效函数为：GetUserAchievement。
    /// 
    /// @param achievement 成就的"API 名称"
    /// @returns 此函数若达成所有下列条件，返回 true；否则返回 false。
    /// - RequestCurrentStats 已完成且回调返回成功。
    /// - 在 Steamworks 网站的"应用管理员"中存在指定成就的"API 名称"，且更改已发布。
    pub fn get_achievement(achievement: String) -> bool {
        let client = crate::client::get_client();
        client
            .user_stats()
            .achievement(&achievement)
            .get()
            .unwrap_or(false)
    }

    #[napi]
    /// 重置一项成就的解锁状态。
    /// 此函数主要仅用于测试目的。
    /// 您必须先调用 RequestCurrentStats，且须通过其回调返回成功之后，才能调用此函数。
    /// 此调用只修改 Steam 的内存状态，因此开销较小。 要向服务器发送解锁状态，触发 Steam 界面通知，您必须调用 StoreStats。
    /// 
    /// @param achievement 要重置的成就的 "API 名称"
    /// @returns 此函数若达成所有下列条件，返回 true；否则返回 false。
    /// - 在 Steamworks 网站的"应用管理员"中存在指定成就的"API 名称"，且更改已发布。
    /// - RequestCurrentStats 已完成且回调返回成功。
    pub fn clear_achievement(achievement: String) -> bool {
        let client = crate::client::get_client();
        client
            .user_stats()
            .achievement(&achievement)
            .clear()
            .and_then(|_| client.user_stats().store_stats())
            .is_ok()
    }

    #[napi]
    /// 将变动的统计与成就数据发送至服务器进行持久保存。
    /// 若失败，则不会发送任何数据至服务器。 建议不断重试，直至调用成功。
    /// 此调用会受到速率限制。 调用频率应该以分钟计，而非秒计。
    /// 您应只在重大状态更改时调用此函数，比如回合结束、地图更改或用户离开服务器时。
    /// 不过，这调用要求显示成就解锁通知对话框，因此如果您已调用了 SetAchievement，那么建议您随后立即调用此函数。
    /// 如果在您的应用程序进程结束时，您在本地保存有统计或成就，且尚未使用此函数上传，那么此函数将自动调用。
    /// 您可以在 %steam_install%\logs\stats_log.txt 文件中找到更多调试信息。
    ///
    /// @returns 此函数若达成所有下列条件，则返回 true；否则返回 false。
    /// - RequestCurrentStats 已完成且回调返回成功。
    /// - 在 Steamworks 合作伙伴后端，当前游戏相关联的统计，这些统计已发布。
    /// 如果调用成功，您将收到 UserStatsStored_t 回调。
    /// 如果 m_eResult 得到 k_EResultInvalidParam 的结果，那么有一个或多个统计因破坏约束或过期而遭到拒绝。
    /// 这种情况下，服务器发回更新值，统计应在本地更新以保持同步。 此时您无需再次调用 RequestCurrentStats。
    /// 如果已有一个或更多成就解锁，则这也将触发一个 UserAchievementStored_t 回调。
    pub fn store_stats() -> bool {
        let client = crate::client::get_client();
        client.user_stats().store_stats().is_ok()
    }

    #[napi]
    /// 重置当前用户的统计，且可选择是否重置成就。
    /// 此函数自动调用 StoreStats，以持久保留对服务器的更改。 这通常应只用于开发时的测试目的。
    /// 在调用此函数之后，调用 RequestCurrentStats，确认您与 Steam 提供的新默认值同步了您的统计。
    ///
    /// @param achievements_too	是否也重置用户的成就
    /// @returns true 表示 RequestCurrentStats 已调用且成功地返回了其回调，也即成功；否则返回 false。
    pub fn reset_all_stats(achievements_too: bool) -> bool {
        let client = crate::client::get_client();
        client
            .user_stats()
            .reset_all_stats(achievements_too)
            .is_ok()
    }
}
