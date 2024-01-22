use napi::bindgen_prelude::{FromNapiValue, ToNapiValue};
use napi::threadsafe_function::{ErrorStrategy, ThreadsafeFunction, ThreadsafeFunctionCallMode};
use napi_derive::napi;

#[napi]
/// ISteamUser 接口回调
pub enum SteamApiCallback {
    /// 好友的状态改变时调用
    PersonaStateChange,
    /// 在与 Steam 后端建立连接时调用。这说明 Steam 客户端现在与 Steam 服务器有了有效连接。
    /// 通常这将在游戏启动之前发生，且应该只在用户因网络问题或 Steam 服务器更新而掉线时才发生。
    SteamServersConnected,
    /// 在客户端失去与 Steam 服务器的连接时调用。实时服务将禁用，直到发送了匹配的 SteamServersConnected_t 时为止。
    SteamServersDisconnected,
    /// 在试图连接失败时调用。如果 Steam 客户端未连接，并且重新尝试建立连接时失败，这将定期发生。
    SteamServerConnectFailure,
    /// 大厅元数据已变更
    LobbyDataUpdate,
    /// 大厅聊天室状态已更改，通常在用户加入或离开大厅时发送
    LobbyChatUpdate,
    /// 当用户尝试通过好友列表或邀请加入大厅时调用。收到此回调时，游戏客户端应尝试连接至指定大厅。
    /// 如果游戏尚未运行，会用命令行参数 +connect_lobby<64-bit lobby Steam ID> 自动启动。
    GameLobbyJoinRequested,
    /// 用户希望通过 SendP2PPacket 与我们在 P2P 通道通信。
    /// 响应时，如果您希望打开与用户之间的网络通道，需要调用 AcceptP2PSessionWithUser。
    P2PSessionRequest,
    /// 指定用户无法收到数据包时调用。
    /// 所有已排入队列但此时仍未发送的数据包会丢弃，再次尝试发送会重新尝试进行连接（但如果再次失败，会再次丢包）。
    P2PSessionConnectFail,
    /// 在用户响应了小额交易授权请求时调用
    MicroTxnAuthorizationResponse,
}

impl SteamApiCallback {
    pub(crate) fn set(
        cb: SteamApiCallback,
        handler: ThreadsafeFunction<serde_json::Value, ErrorStrategy::Fatal>,
    ) -> steamworks::CallbackHandle {
        match cb {
            SteamApiCallback::PersonaStateChange => {
                Self::register_callback::<steamworks::PersonaStateChange>(handler)
            }
            SteamApiCallback::SteamServersConnected => {
                Self::register_callback::<steamworks::SteamServersConnected>(handler)
            }
            SteamApiCallback::SteamServersDisconnected => {
                Self::register_callback::<steamworks::SteamServersDisconnected>(handler)
            }
            SteamApiCallback::SteamServerConnectFailure => {
                Self::register_callback::<steamworks::SteamServerConnectFailure>(handler)
            }
            SteamApiCallback::LobbyDataUpdate => {
                Self::register_callback::<steamworks::LobbyDataUpdate>(handler)
            }
            SteamApiCallback::LobbyChatUpdate => {
                Self::register_callback::<steamworks::LobbyChatUpdate>(handler)
            }
            SteamApiCallback::P2PSessionRequest => {
                Self::register_callback::<steamworks::P2PSessionRequest>(handler)
            }
            SteamApiCallback::P2PSessionConnectFail => {
                Self::register_callback::<steamworks::P2PSessionConnectFail>(handler)
            }
            SteamApiCallback::GameLobbyJoinRequested => {
                Self::register_callback::<steamworks::GameLobbyJoinRequested>(handler)
            }
            SteamApiCallback::MicroTxnAuthorizationResponse => {
                Self::register_callback::<steamworks::MicroTxnAuthorizationResponse>(handler)
            }
        }
    }

    fn register_callback<C>(
        threadsafe_handler: ThreadsafeFunction<serde_json::Value, ErrorStrategy::Fatal>,
    ) -> steamworks::CallbackHandle
    where
        C: steamworks::Callback + serde::Serialize,
    {
        let client = crate::client::get_client();
        client.register_callback(move |value: C| {
            let value = serde_json::to_value(&value).unwrap();
            threadsafe_handler.call(value, ThreadsafeFunctionCallMode::Blocking);
        })
    }
}

#[napi]
pub mod callback {
    use super::SteamApiCallback;
    use napi::{
        threadsafe_function::{ErrorStrategy, ThreadsafeFunction},
        JsFunction,
    };

    #[napi]
    pub struct Handle {
        handle: Option<steamworks::CallbackHandle>,
    }

    #[napi]
    impl Handle {
        #[napi]
        pub fn disconnect(&mut self) {
            if let Some(handle) = self.handle.take() {
                handle.disconnect();
            }
        }
    }

    #[napi(ts_generic_types = "C extends keyof import('./callbacks').CallbackReturns")]
    /// 注册该用户操作回调
    ///
    /// @param steam_callback Steam用户操作回调
    /// @param handler 发生时间回调
    pub fn register_callback(
        #[napi(ts_arg_type = "C")] steam_callback: SteamApiCallback,
        #[napi(ts_arg_type = "(value: import('./callbacks').CallbackReturns[C]) => void")] handler: JsFunction,
    ) -> Handle {
        let threadsafe_handler: ThreadsafeFunction<serde_json::Value, ErrorStrategy::Fatal> =
            handler
                .create_threadsafe_function(0, |ctx| Ok(vec![ctx.value]))
                .unwrap();

        let handle = SteamApiCallback::set(steam_callback, threadsafe_handler);

        Handle {
            handle: Some(handle),
        }
    }
}
